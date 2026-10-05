import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { resolveHomeAfterAuth } from '../lib/roles'
import { authErrorMessage } from '../lib/auth-errors'
import logoNavy from '../assets/carevia-logo-navy.png'

const RESEND_SECONDS = 60
// The form uses "ngo"; the database role is "ngo_partner"
const DB_ROLE = { survivor: 'survivor', recruiter: 'recruiter', ngo: 'ngo_partner' }

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    role: 'survivor',
    companyName: '',
  })
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'verify'
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)
  const cleanEmail = formData.email.trim().toLowerCase()
  const needsCompany = formData.role === 'recruiter'
  const canSend = isValidEmail(cleanEmail) && (!needsCompany || formData.companyName.trim().length > 0)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) navigate(await resolveHomeAfterAuth(), { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleRequestOTP = async () => {
    if (!canSend) {
      setMessage({ type: 'error', text: needsCompany && !formData.companyName.trim() ? 'Please enter your company name.' : 'Please enter a valid email address.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          // Read by the assign_signup_role trigger: the account gets this role
          // automatically, so the user is never asked to pick it again.
          data: {
            signup_role: DB_ROLE[formData.role],
            ...(needsCompany ? { company_name: formData.companyName.trim() } : {}),
          },
        },
      })
      if (error) {
        setMessage({ type: 'error', text: authErrorMessage(error, 'Could not send the code. Please try again.') })
        return
      }
      setStep('verify')
      setCode('')
      setCooldown(RESEND_SECONDS)
      setMessage({ type: 'info', text: `We sent a 6-digit code to ${cleanEmail}. Check your spam folder if you don't see it.` })
    } catch (err) {
      setMessage({ type: 'error', text: authErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!/^\d{6,8}$/.test(code)) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit code from your email.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code, type: 'email' })
      if (error) {
        const wrong = /expired|invalid/i.test(error.message ?? '')
        setMessage({ type: 'error', text: wrong ? 'That code is wrong or has expired. Use the latest email, or request a new code.' : authErrorMessage(error) })
        return
      }
      if (data.session) navigate(await resolveHomeAfterAuth(), { replace: true })
    } catch (err) {
      setMessage({ type: 'error', text: authErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative'
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* HERO PANEL */}
        <div
          style={{
            borderRadius: 'var(--r-hero)',
            background: 'var(--grad-hero)',
            color: 'var(--navy)',
            padding: '36px 28px',
            textAlign: 'center',
            marginBottom: 20,
            border: '1px solid var(--line)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <img
              src={logoNavy}
              alt="CareVia Logo"
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 500, fontSize: 18, color: 'var(--navy)', letterSpacing: '-0.3px' }}>
              CAREVIA
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(32px, 6vw, 44px)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-1.2px',
              marginBottom: 8,
              color: 'var(--navy)'
            }}
          >
            Where careers begin again
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink2)', margin: 0, fontWeight: 400 }}>
            Join our inclusive community and begin your pathway to verified employment
          </p>
        </div>

        {/* FORM CARD */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 20, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
              {step === 'email' ? 'Create an account' : 'Verify email'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
              {step === 'email' ? 'Select your role and get started' : `Verification code sent to ${cleanEmail}`}
            </p>
          </div>

          {message && (
            <div
              role={message.type === 'error' ? 'alert' : 'status'}
              style={{
                marginBottom: 18, padding: '10px 14px', borderRadius: 'var(--r-input)', fontSize: 13, lineHeight: 1.5,
                background: message.type === 'error' ? '#FDECEC' : 'var(--mist)',
                color: message.type === 'error' ? '#B42318' : 'var(--navy)',
              }}
            >
              {message.text}
            </div>
          )}

          {step === 'email' && (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
                  I am registering as a
                </label>
                <select
                  className="input"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="survivor">Survivor / Job Seeker</option>
                  <option value="recruiter">Recruiter / Employer</option>
                  <option value="ngo">NGO / Support Partner</option>
                </select>
              </div>

              {needsCompany && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
                    Company name
                  </label>
                  <input
                    className="input"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your company or organisation"
                  />
                </div>
              )}

              <button
                onClick={handleRequestOTP}
                disabled={!canSend || loading}
                className="btn-pill"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: 14,
                  opacity: (!canSend || loading) ? 0.6 : 1,
                  cursor: (!canSend || loading) ? 'not-allowed' : 'pointer',
                  marginBottom: 20
                }}
              >
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--royal)', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in
                </Link>
              </div>
            </>
          )}

          {step === 'verify' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
                  6-digit verification code
                </label>
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="000000"
                  maxLength="8"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleVerifyOTP()}
                  style={{
                    textAlign: 'center',
                    fontSize: 20,
                    letterSpacing: '0.3em'
                  }}
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || code.length < 6}
                className="btn-pill"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: 14,
                  marginBottom: 12,
                  opacity: loading || code.length < 6 ? 0.6 : 1
                }}
              >
                {loading ? 'Verifying...' : 'Verify & create account'}
              </button>

              <button
                onClick={handleRequestOTP}
                disabled={loading || cooldown > 0}
                className="btn-soft"
                style={{ width: '100%', padding: '10px', textAlign: 'center', fontSize: 13, marginBottom: 8, opacity: cooldown > 0 ? 0.6 : 1 }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>

              <button
                onClick={() => { setStep('email'); setMessage(null) }}
                className="btn-soft"
                style={{
                  width: '100%',
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: 13
                }}
              >
                Back to details
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink2)' }}>
          Your privacy and personal information are protected by encrypted protocols
        </div>
      </div>
    </div>
  )
}