#!/usr/bin/env node
/**
 * Make Supabase email a 6-digit OTP instead of a click-to-sign-in link.
 *
 * Why this script exists: signInWithOtp() always generates BOTH a token and a
 * confirmation URL. Which one the user receives is decided entirely by the email
 * template on the hosted project — so no amount of client-side change can stop a
 * magic link from going out while the template still references .ConfirmationURL.
 *
 * Supabase refuses template edits while a project is on the built-in email
 * provider ("not available for free tier projects using the default email
 * provider"), so custom SMTP has to be configured first. Pass the SMTP_* vars
 * below and this script sets SMTP, the send rate limit, and the templates in one
 * go; omit them and it only touches the templates.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/fix-otp-templates.mjs --check   # read only
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/fix-otp-templates.mjs           # apply
 *
 *   # first run, including SMTP:
 *   SMTP_HOST=smtp-relay.brevo.com SMTP_PORT=587 SMTP_USER=... SMTP_PASS=... \
 *   SMTP_SENDER_EMAIL=no-reply@example.com SMTP_SENDER_NAME=CAREVIA \
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/fix-otp-templates.mjs
 *
 * Credentials are read from the environment only and never written to disk.
 */
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

// Prefer an explicit token; otherwise reuse whatever `supabase login` stored, so
// logging in with the CLI is enough to run this.
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim() || readStoredToken()

function readStoredToken() {
  if (process.platform !== 'win32') return null
  try {
    return execFileSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(root, 'scripts', 'read-cli-token.ps1')],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim() || null
  } catch {
    return null
  }
}

if (!token) {
  console.error('No Supabase access token found.')
  console.error('Either run `npx supabase login`, or set SUPABASE_ACCESS_TOKEN to a')
  console.error('personal access token (Dashboard → Account → Access Tokens, starts with sbp_).')
  process.exit(1)
}

// Prefer an explicit ref, else fall back to the linked project in config.toml.
const ref =
  process.env.SUPABASE_PROJECT_ID ||
  readFileSync(join(root, 'supabase', 'config.toml'), 'utf8').match(/project_id\s*=\s*"([^"]+)"/)?.[1]

if (!ref) {
  console.error('Could not determine the project ref. Set SUPABASE_PROJECT_ID.')
  process.exit(1)
}

const api = `https://api.supabase.com/v1/projects/${ref}/config/auth`
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

// Carries an already-formatted message, so the top level can print it and set an
// exit code without process.exit() firing mid-request (Node then trips a libuv
// assertion on the still-open socket).
class Fatal extends Error {}

const call = async (method, body) => {
  const res = await fetch(api, { method, headers, body: body && JSON.stringify(body) })
  const text = await res.text()
  if (res.status === 401 || res.status === 403) {
    // Overwhelmingly the common failure: a valid token, but for an account that
    // cannot manage THIS project. Say so instead of printing a stack trace.
    throw new Fatal(
      `The token works, but its account cannot manage project ${ref}.\n` +
        'Log in as the account that owns it, then retry:\n' +
        '  npx supabase login\n' +
        `  npx supabase projects list   # ${ref} must appear here`
    )
  }
  if (/default email provider/i.test(text)) {
    throw new Fatal(
      'Supabase will not accept custom templates while the project uses the\n' +
        'built-in email provider — and the built-in provider only ever sends its own\n' +
        'magic-link template, so OTP codes are impossible until SMTP is configured.\n\n' +
        'Re-run with SMTP credentials (see the header of this file), e.g. Brevo:\n' +
        '  SMTP_HOST=smtp-relay.brevo.com SMTP_PORT=587 SMTP_USER=... SMTP_PASS=... \\\n' +
        '  SMTP_SENDER_EMAIL=you@example.com npm run fix:otp'
    )
  }
  if (!res.ok) throw new Fatal(`${method} failed with ${res.status}: ${text}`)
  return JSON.parse(text)
}

const template = (name) => readFileSync(join(root, 'supabase', 'templates', name), 'utf8')

// Reports what a template will actually produce, which is the whole question here.
const describe = (html) => {
  const link = /\{\{\s*\.ConfirmationURL\s*\}\}/.test(html ?? '')
  const code = /\{\{\s*\.Token\s*\}\}/.test(html ?? '')
  if (link && code) return 'link + code (the link is what users click)'
  if (link) return 'sign-in LINK — this is the bug'
  if (code) return '6-digit code'
  return 'neither (Supabase default = sign-in link)'
}

const report = (label, cfg) => {
  console.log(label)
  console.log(`  email provider              : ${cfg.smtp_host ? `custom SMTP (${cfg.smtp_host})` : 'Supabase built-in (blocks template edits)'}`)
  console.log(`  magic link (existing users) : ${describe(cfg.mailer_templates_magic_link_content)}`)
  console.log(`  confirm signup (new users)  : ${describe(cfg.mailer_templates_confirmation_content)}`)
  console.log(`  OTP length                  : ${cfg.mailer_otp_length ?? '(default)'}`)
  console.log(`  OTP expiry                  : ${cfg.mailer_otp_exp ?? '(default)'}s`)
  console.log(`  emails allowed per hour     : ${cfg.rate_limit_email_sent ?? '(default)'}`)
}

// Supplying SMTP is optional, but all six parts are needed to form a valid config.
const smtp = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  senderEmail: process.env.SMTP_SENDER_EMAIL,
  senderName: process.env.SMTP_SENDER_NAME || 'CAREVIA',
}
const smtpRequested = Boolean(smtp.host || smtp.user || smtp.pass || smtp.senderEmail)

try {
  console.log(`Project: ${ref}\n`)
  report('Current state', await call('GET'))

  if (checkOnly) {
    console.log('\n--check given, nothing changed.')
  } else {
    if (smtpRequested) {
      const missing = ['host', 'port', 'user', 'pass', 'senderEmail'].filter((k) => !smtp[k])
      if (missing.length) {
        throw new Fatal(`Incomplete SMTP config — missing: ${missing.map((m) => `SMTP_${m === 'senderEmail' ? 'SENDER_EMAIL' : m.toUpperCase()}`).join(', ')}`)
      }
      console.log('\nConfiguring custom SMTP...')
      await call('PATCH', {
        smtp_host: smtp.host,
        smtp_port: String(smtp.port),
        smtp_user: smtp.user,
        smtp_pass: smtp.pass,
        smtp_admin_email: smtp.senderEmail,
        smtp_sender_name: smtp.senderName,
        // The built-in provider caps at 2/hour, which no real sign-in flow survives.
        rate_limit_email_sent: 100,
      })
    }

    console.log('\nApplying OTP templates...')
    await call('PATCH', {
      mailer_subjects_magic_link: 'Your CAREVIA sign-in code',
      mailer_templates_magic_link_content: template('magic_link.html'),
      mailer_subjects_confirmation: 'Confirm your CAREVIA email',
      mailer_templates_confirmation_content: template('confirm_signup.html'),
      mailer_otp_length: 6,
      mailer_otp_exp: 3600,
    })

    const after = await call('GET')
    console.log('')
    report('After', after)

    const ok =
      describe(after.mailer_templates_magic_link_content) === '6-digit code' &&
      describe(after.mailer_templates_confirmation_content) === '6-digit code'
    if (!ok) throw new Fatal('Templates did not take effect — check the output above.')
    console.log('\nDone. Sign-in emails now carry a 6-digit code.')
  }
} catch (err) {
  console.error(`\n${err instanceof Fatal ? err.message : err}`)
  process.exitCode = 1
}
