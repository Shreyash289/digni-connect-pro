// Creates (or resets the password on) an admin account directly via the
// Supabase Admin API, using the service_role key. Safer than hand-editing
// auth.users via raw SQL, and works even if the built-in mailer is broken
// since email_confirm bypasses the confirmation-email step entirely.
//
// Usage:
//   ADMIN_EMAIL=someone@example.com ADMIN_PASSWORD='...' node --env-file=.env scripts/create-admin.mjs
//
// Credentials are read from the environment on purpose — never hardcode a
// real password into this file, this repo is public.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment before running this script.')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findExistingUser(email) {
  // No direct "get by email" in this SDK version — page through listUsers.
  let page = 1
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < 200) return null
    page += 1
  }
}

async function main() {
  let user = await findExistingUser(ADMIN_EMAIL)

  if (user) {
    console.log(`Found existing user ${ADMIN_EMAIL} (${user.id}) — updating password + confirming email.`)
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) throw error
    user = data.user
  } else {
    console.log(`Creating new user ${ADMIN_EMAIL}.`)
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) throw error
    user = data.user
  }

  console.log(`User ready: ${user.id}`)

  // profiles row (in case the on_auth_user_created trigger didn't fire, e.g.
  // for an already-existing user)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: user.id, full_name: 'CAREVIA Admin', email: user.email }, { onConflict: 'id' })
  if (profileError) console.warn('profiles upsert warning:', profileError.message)

  // Grant admin role directly (belt-and-suspenders alongside the
  // grant_admin_for_reserved_emails trigger from the SQL migration).
  const { error: roleError } = await admin
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' })
  if (roleError) throw roleError

  console.log(`Admin role granted to ${ADMIN_EMAIL}. Done.`)
}

main().catch((err) => {
  console.error('Failed:', err.message ?? err)
  process.exit(1)
})
