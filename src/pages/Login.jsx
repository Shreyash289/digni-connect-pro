import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { resolveHomeAfterAuth } from '../lib/roles'
import { authErrorMessage } from '../lib/auth-errors'
import logoNavy from '../assets/carevia-logo-navy.png'

const RESEND_SECONDS = 60

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState(() =>
    new URLSearchParams(window.location.search).has('suspended')
      ? { type: 'error', text: 'Your account has been suspended. Please contact the CAREVIA team.' }
      : null
  )

  const isValidEmail = (emailStr) => /\S+@\S+\.\S+/.test(emailStr)
  const cleanEmail = email.trim().toLowerCase()

  // Already signed in? Go straight to the right portal.
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
    if (!isValidEmail(cleanEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        // Sign-in only: new accounts are created on the Create account page,
        // where the role is chosen.
        options: { shouldCreateUser: false },
      })
      if (error) {
        const raw = error.message?.toLowerCase() ?? ''
        if (raw.includes('signups not allowed') || raw.includes('user not found')) {
          setMessage({ type: 'error', text: 'No account found for this email. Please create an account first.' })
        } else {
          setMessage({ type: 'error', text: authErrorMessage(error, 'Could not send the code. Please try again.') })
        }
        return
      }
      setStep('otp')
      setCode('')
      setCooldown(RESEND_SECONDS)
      setMessage({ type: 'info', text: `We sent a 6-digit code to ${cleanEmail}. Check your spam folder if you don't see it.` })
    } catch (err) {
      setMessage({ type: 'error', text: authErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerify = async () => {
    if (!/^\d{6,8}$/.test(code)) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit code from your email.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: cleanEmail, token: code, type: 'email' })
      if (error) {
        // Best-effort entry in the admin audit log; never blocks the UI
        supabase.rpc('log_failed_login', { _email: cleanEmail }).then(() => {}, () => {})
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
    <>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.5;
          }
          50% { 
            transform: translate(25px, -30px); 
            opacity: 0.75;
          }
        }
        
        @keyframes orb-float-2 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.4;
          }
          50% { 
            transform: translate(-30px, 25px); 
            opacity: 0.65;
          }
        }

        .orb-float-blue-1 {
          animation: orb-float-1 7s ease-in-out infinite;
        }

        .orb-float-blue-2 {
          animation: orb-float-2 7s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .orb-float-blue-1, .orb-float-blue-2 {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

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
          position: 'relative',
          overflow: 'hidden'
        }}
      >
          {/* Subtle floating background orbs */}
          <div
            className="orb-float-blue-1"
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 32% 28%, #fff, #8FAAF2 45%, #2F5BEA)',
              opacity: 0.35,
              filter: 'blur(45px)',
              top: '8%',
              left: '8%',
              pointerEvents: 'none'
            }}
          />
          <div
            className="orb-float-blue-2"
            style={{
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 32% 28%, #fff, #8FAAF2 45%, #2F5BEA)',
              opacity: 0.3,
              filter: 'blur(40px)',
              bottom: '10%',
              right: '8%',
              pointerEvents: 'none'
            }}
          />

          <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 10 }}>
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
                Empowering survivors through secure, verified employment pathways
              </p>
            </div>

            {/* FORM CARD */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
                  {step === 'email' ? 'Welcome back' : 'Verify one-time passcode'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                  {step === 'email' ? 'Sign in to access your portal' : `Enter the 6-digit code sent to ${cleanEmail}`}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !loading && handleRequestOTP()}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <button
                    onClick={handleRequestOTP}
                    disabled={!isValidEmail(cleanEmail) || loading}
                    className="btn-pill"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: 14,
                      opacity: (!isValidEmail(cleanEmail) || loading) ? 0.6 : 1,
                      cursor: (!isValidEmail(cleanEmail) || loading) ? 'not-allowed' : 'pointer',
                      marginBottom: 24
                    }}
                  >
                    {loading ? 'Sending code...' : 'Continue with Email'}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--royal)', textDecoration: 'none', fontWeight: 500 }}>
                      Create account
                    </Link>
                  </div>
                </>
              )}

              {step === 'otp' && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
                      6-digit passcode
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
                      onKeyDown={(e) => e.key === 'Enter' && !loading && handleOTPVerify()}
                      style={{
                        textAlign: 'center',
                        fontSize: 20,
                        letterSpacing: '0.3em'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleOTPVerify}
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
                    {loading ? 'Verifying...' : 'Verify and continue'}
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
                    Back to email entry
                  </button>
                </>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink2)' }}>
              Protected by encrypted privacy and role-based permissions
            </div>
          </div>
        </div>
    </>
  )
}