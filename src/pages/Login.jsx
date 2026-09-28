import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { fetchMyRoles, homePathForRoles } from '../lib/roles'
import { authErrorMessage } from '../lib/auth-errors'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const isValidEmail = (emailStr) => /\S+@\S+\.\S+/.test(emailStr)

  async function routeAfterAuth() {
    const { roles } = await fetchMyRoles()
    const home = homePathForRoles(roles)
    navigate(home ?? '/select-role')
  }

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!email || !isValidEmail(email) || !password) {
      setError('Please enter a valid email and password')
      return
    }

    setError('')
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(authErrorMessage(signInError, 'Invalid email or password.'))
        return
      }

      if (data.session) {
        await routeAfterAuth()
      }
    } catch (err) {
      setError(authErrorMessage(err, 'Something went wrong signing in.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(30px, -40px); opacity: 0.6; }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(-40px, 30px); opacity: 0.5; }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.35; }
          50% { transform: translate(35px, 25px); opacity: 0.55; }
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
        .splash-screen { animation: pageSlideIn 0.6s ease-out; }
        .login-page { animation: pageSlideIn 0.8s ease-out; }
        .orb-1 { animation: orb-float-1 8s ease-in-out infinite; }
        .orb-2 { animation: orb-float-2 10s ease-in-out infinite; }
        .orb-3 { animation: orb-float-3 9s ease-in-out infinite; }
        .splash-title { animation: titleFadeIn 1s ease-out 0.3s both; }
        .splash-subtitle { animation: subtitleFadeIn 1s ease-out 0.6s both; }
        .splash-loading { animation: loadingPulse 1.5s ease-in-out infinite; }
        .form-fadeIn { animation: pageSlideIn 0.6s ease-out 0.2s both; }
      `}</style>

      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className="splash-screen" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
          background: 'linear-gradient(135deg, #0C1F3F 0%, #1a3a52 100%)', overflow: 'hidden',
          position: 'fixed', width: '100%', zIndex: 1000,
        }}>
          <div style={{
            position: 'absolute', width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.6), rgba(37, 99, 235, 0.1))',
            filter: 'blur(40px)', top: '15%', left: '10%',
          }} className="orb-1" />
          <div style={{
            position: 'absolute', width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.5), rgba(13, 148, 136, 0.05))',
            filter: 'blur(35px)', bottom: '20%', right: '12%',
          }} className="orb-2" />
          <div style={{
            position: 'absolute', width: 90, height: 90, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(2, 132, 199, 0.4), rgba(2, 132, 199, 0.05))',
            filter: 'blur(30px)', top: '50%', right: '8%',
          }} className="orb-3" />

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, color: '#fff' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)',
              border: '2px solid rgba(37, 99, 235, 0.4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 40, fontWeight: 800, margin: '0 auto 24px',
            }} className="splash-title">
              C
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', margin: '0 0 10px 0', letterSpacing: '0.08em' }} className="splash-title">
              CAREVIA
            </h1>
            <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 500 }} className="splash-subtitle">
              Survivor Repository
            </p>
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} className="splash-loading">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.8)' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.6)', opacity: 0.6 }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.4)', opacity: 0.4 }} />
            </div>
          </div>
        </div>
      )}

      {/* LOGIN PAGE */}
      {!showSplash && (
        <div className="login-page" style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6', overflow: 'hidden' }}>
          <div style={{
            flex: 1, background: '#0C1F3F', color: '#fff', padding: 60, display: 'flex',
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '15%', right: '10%', width: 60, height: 60, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', border: '2px solid rgba(37, 99, 235, 0.3)' }} className="orb-1" />
            <div style={{ position: 'absolute', bottom: '20%', left: '8%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)' }} className="orb-2" />
            <div style={{ position: 'absolute', top: '30%', right: '20%', width: 4, height: 4, borderRadius: '50%', background: '#2563EB' }} className="splash-loading" />
            <div style={{ position: 'absolute', bottom: '35%', left: '15%', width: 3, height: 3, borderRadius: '50%', background: '#0D9488' }} className="splash-loading" />

            <div style={{ position: 'relative', zIndex: 10 }} className="form-fadeIn">
              <div style={{ width: 70, height: 70, borderRadius: 14, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, marginBottom: 20, fontFamily: 'Plus Jakarta Sans' }}>
                C
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>CAREVIA</h1>
              <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 40, fontWeight: 500 }}>
                Survivor Repository
              </p>
              <div style={{ maxWidth: 320, marginBottom: 40 }}>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>
                  Empowering Survivors Through Verified Employment
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>
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

          <div style={{ flex: 1, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }} className="form-fadeIn">
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>
                  Welcome Back
                </h2>
                <p style={{ fontSize: 12, color: '#6B7280' }}>Sign in to your CAREVIA account</p>
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B91C1C' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    autoComplete="email"
                    style={{
                      width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                      fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box', transition: 'border-color 0.3s',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                      fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box', transition: 'border-color 0.3s',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !isValidEmail(email) || !password}
                  style={{
                    width: '100%', padding: '11px 13px',
                    background: (!loading && email && isValidEmail(email) && password) ? '#2563EB' : '#D1D5DB',
                    color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                    cursor: (!loading && email && isValidEmail(email) && password) ? 'pointer' : 'not-allowed',
                    marginBottom: 18, fontFamily: 'Inter', transition: 'background 0.3s',
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
                New user?{' '}
                <Link to="/signup" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                  Create an account
                </Link>
              </div>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '0.5px solid #E5E7EB', fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>
                🔒 Encrypted & Secure
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
