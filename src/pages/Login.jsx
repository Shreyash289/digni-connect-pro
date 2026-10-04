import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import logoNavy from '../assets/carevia-logo-navy.png'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)

  const demoAccounts = {
    survivor: { email: 'survivor@demo.carevia', label: 'Survivor Demo' },
    recruiter: { email: 'recruiter@demo.carevia', label: 'Recruiter Demo' },
    ngo: { email: 'ngo@demo.carevia', label: 'NGO Demo' },
    admin: { email: 'admin@demo.carevia', label: 'Admin Demo' }
  }

  const isValidEmail = (emailStr) => {
    return emailStr.includes('@') && emailStr.includes('.')
  }

  const handleDemoLogin = (role) => {
    const demoEmail = demoAccounts[role].email
    setEmail(demoEmail)
    localStorage.setItem('email', demoEmail)
    localStorage.setItem('role', role)
    localStorage.setItem('isLoggedIn', 'true')
    navigate('/select-role')
  }

  const handleRequestOTP = async () => {
    if (!email || !isValidEmail(email)) {
      alert('Please enter a valid email')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        alert('❌ Failed to send OTP: ' + error.message)
        return
      }

      setStep('otp')
      alert('✅ OTP sent to ' + email + ' (check spam folder too)')
    } catch (error) {
      alert('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerify = async () => {
    const otpInput = document.querySelector('input[maxLength="6"]')?.value

    if (!otpInput || otpInput.length !== 6) {
      alert('Please enter 6-digit OTP')
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpInput,
        type: 'email',
      })

      if (error) {
        alert('❌ Invalid or expired OTP: ' + error.message)
        return
      }

      if (data.session) {
        navigate('/select-role')
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
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
                  {step === 'email' ? 'Sign in to access your portal' : `Enter the 6-digit code sent to ${email}`}
                </p>
              </div>

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
                      placeholder="name@example.com"
                    />
                  </div>

                  <button
                    onClick={handleRequestOTP}
                    disabled={!email || !isValidEmail(email) || loading}
                    className="btn-pill"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: 14,
                      opacity: (!email || !isValidEmail(email) || loading) ? 0.6 : 1,
                      cursor: (!email || !isValidEmail(email) || loading) ? 'not-allowed' : 'pointer',
                      marginBottom: 24
                    }}
                  >
                    {loading ? 'Sending code...' : 'Continue with Email'}
                  </button>

                  {/* QUICK DEMO BUTTONS IN 2x2 GRID */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink2)', marginBottom: 12, textAlign: 'center' }}>
                      EXPLORE DEMO PORTALS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {Object.entries(demoAccounts).map(([roleKey, account]) => (
                        <button
                          key={roleKey}
                          onClick={() => handleDemoLogin(roleKey)}
                          className="btn-soft"
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            padding: '10px 8px',
                            fontSize: 12,
                            fontWeight: 500
                          }}
                        >
                          {account.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                      placeholder="000000"
                      maxLength="6"
                      style={{
                        textAlign: 'center',
                        fontSize: 20,
                        letterSpacing: '0.3em'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleOTPVerify}
                    disabled={loading}
                    className="btn-pill"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: 14,
                      marginBottom: 12,
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify and continue'}
                  </button>

                  <button
                    onClick={() => setStep('email')}
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