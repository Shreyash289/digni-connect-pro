import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

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
        // Supabase Auth owns the authenticated session.
        // Do NOT manually store access tokens.
        // Do NOT create fake authentication state.
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
            opacity: 0.4;
          }
          50% { 
            transform: translate(30px, -40px); 
            opacity: 0.6;
          }
        }
        
        @keyframes orb-float-2 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.3;
          }
          50% { 
            transform: translate(-40px, 30px); 
            opacity: 0.5;
          }
        }
        
        @keyframes orb-float-3 {
          0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0.35;
          }
          50% { 
            transform: translate(35px, 25px); 
            opacity: 0.55;
          }
        }
        
        @keyframes titleFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes subtitleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes pageSlideIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .splash-screen {
          animation: pageSlideIn 0.6s ease-out;
        }
        
        .login-page {
          animation: pageSlideIn 0.8s ease-out;
        }
        
        .orb-1 { animation: orb-float-1 8s ease-in-out infinite; }
        .orb-2 { animation: orb-float-2 10s ease-in-out infinite; }
        .orb-3 { animation: orb-float-3 9s ease-in-out infinite; }
        
        .splash-title {
          animation: titleFadeIn 1s ease-out 0.3s both;
        }
        
        .splash-subtitle {
          animation: subtitleFadeIn 1s ease-out 0.6s both;
        }
        
        .splash-loading {
          animation: loadingPulse 1.5s ease-in-out infinite;
        }
        
        .form-fadeIn {
          animation: pageSlideIn 0.6s ease-out 0.2s both;
        }
      `}</style>

      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className="splash-screen" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0C1F3F 0%, #1a3a52 100%)',
          overflow: 'hidden',
          position: 'fixed',
          width: '100%',
          zIndex: 1000
        }}>
          <div style={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.6), rgba(37, 99, 235, 0.1))',
            filter: 'blur(40px)',
            top: '15%',
            left: '10%'
          }} className="orb-1" />

          <div style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.5), rgba(13, 148, 136, 0.05))',
            filter: 'blur(35px)',
            bottom: '20%',
            right: '12%'
          }} className="orb-2" />

          <div style={{
            position: 'absolute',
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(2, 132, 199, 0.4), rgba(2, 132, 199, 0.05))',
            filter: 'blur(30px)',
            top: '50%',
            right: '8%'
          }} className="orb-3" />

          <div style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
            color: '#fff'
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.2)',
              border: '2px solid rgba(37, 99, 235, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 800,
              margin: '0 auto 24px'
            }} className="splash-title">
              C
            </div>

            <h1 style={{
              fontSize: 40,
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans',
              margin: '0 0 10px 0',
              letterSpacing: '0.08em'
            }} className="splash-title">
              CAREVIA
            </h1>

            <p style={{
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              fontWeight: 500
            }} className="splash-subtitle">
              Survivor Repository
            </p>

            <div style={{
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }} className="splash-loading">
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.8)'
              }} />
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(13, 148, 136, 0.6)',
                opacity: 0.6
              }} />
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.4)',
                opacity: 0.4
              }} />
            </div>
          </div>
        </div>
      )}

      {/* LOGIN PAGE */}
      {!showSplash && (
        <div className="login-page" style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6', overflow: 'hidden' }}>
          <div style={{
            flex: 1,
            background: '#0C1F3F',
            color: '#fff',
            padding: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '15%',
              right: '10%',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              border: '2px solid rgba(37, 99, 235, 0.3)'
            }} className="orb-1" />

            <div style={{
              position: 'absolute',
              bottom: '20%',
              left: '8%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(13, 148, 136, 0.08)',
              border: '1px solid rgba(13, 148, 136, 0.2)'
            }} className="orb-2" />

            <div style={{
              position: 'absolute',
              top: '30%',
              right: '20%',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#2563EB'
            }} className="splash-loading" />

            <div style={{
              position: 'absolute',
              bottom: '35%',
              left: '15%',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#0D9488'
            }} className="splash-loading" />

            <div style={{ position: 'relative', zIndex: 10 }} className="form-fadeIn">
              <div style={{
                width: 70,
                height: 70,
                borderRadius: 14,
                background: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                fontWeight: 800,
                marginBottom: 20,
                fontFamily: 'Plus Jakarta Sans'
              }}>
                C
              </div>

              <h1 style={{
                fontSize: 32,
                fontWeight: 800,
                fontFamily: 'Plus Jakarta Sans',
                marginBottom: 6
              }}>
                CAREVIA
              </h1>
              <p style={{
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 40,
                fontWeight: 500
              }}>
                Survivor Repository
              </p>

              <div style={{
                maxWidth: 320,
                marginBottom: 40
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.5,
                  marginBottom: 12
                }}>
                  Empowering Survivors Through Verified Employment
                </div>
                <div style={{
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  SRM University × RRU Pondicherry × CAREVIA
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 3 }}>500+</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Survivors</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 3 }}>50+</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>NGO Partners</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 3 }}>200+</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Placements</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            flex: 1,
            padding: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }} className="form-fadeIn">
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0C1F3F',
                  fontFamily: 'Plus Jakarta Sans',
                  marginBottom: 6
                }}>
                  {step === 'email' ? 'Welcome Back' : 'Verify OTP'}
                </h2>
                <p style={{ fontSize: 12, color: '#6B7280' }}>
                  {step === 'email'
                    ? 'Sign in to your CAREVIA account'
                    : 'Enter the code sent to your email'}
                </p>
              </div>

              {step === 'email' && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: 7
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        border: '0.5px solid #E5E7EB',
                        borderRadius: 6,
                        fontSize: 13,
                        fontFamily: 'Inter',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.3s'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleRequestOTP}
                    disabled={!email || !isValidEmail(email)}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: (email && isValidEmail(email)) ? '#2563EB' : '#D1D5DB',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: (email && isValidEmail(email)) ? 'pointer' : 'not-allowed',
                      marginBottom: 18,
                      fontFamily: 'Inter',
                      transition: 'background 0.3s'
                    }}
                  >
                    Send OTP →
                  </button>

                  <div style={{
                    padding: 14,
                    background: '#EFF6FF',
                    border: '0.5px solid #BFDBFE',
                    borderRadius: 6
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#1E40AF',
                      marginBottom: 10,
                      textTransform: 'uppercase'
                    }}>
                      🎬 Quick Demo
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                      {Object.entries(demoAccounts).map(([role, account]) => (
                        <button
                          key={role}
                          onClick={() => handleDemoLogin(role)}
                          style={{
                            padding: '7px 9px',
                            background: '#fff',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                          }}
                        >
                          {account.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '0.5px solid #E5E7EB',
                    fontSize: 12,
                    color: '#6B7280',
                    textAlign: 'center'
                  }}>
                    New user?{' '}
                    <Link
                      to="/signup"
                      style={{
                        color: '#2563EB',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      Create an account
                    </Link>
                  </div>
                </>
              )}

              {step === 'otp' && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: 7
                    }}>
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      placeholder="000000"
                      maxLength="6"
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        border: '0.5px solid #E5E7EB',
                        borderRadius: 6,
                        fontSize: 16,
                        fontFamily: 'Inter',
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleOTPVerify}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: '#2563EB',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 10,
                      fontFamily: 'Inter'
                    }}
                  >
                    Verify & Continue →
                  </button>

                  <button
                    onClick={() => setStep('email')}
                    style={{
                      width: '100%',
                      padding: '9px 13px',
                      background: 'transparent',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter'
                    }}
                  >
                    ← Back to Email
                  </button>
                </>
              )}

              <div style={{
                marginTop: 20,
                paddingTop: 14,
                borderTop: '0.5px solid #E5E7EB',
                fontSize: 9,
                color: '#9CA3AF',
                textAlign: 'center'
              }}>
                🔒 Encrypted & Secure
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}