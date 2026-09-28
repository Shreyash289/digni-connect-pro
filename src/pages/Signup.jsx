import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { assignInitialRole, fetchMyRoles, homePathForRoles } from '../lib/roles'
import { authErrorMessage } from '../lib/auth-errors'

const ROLE_OPTIONS = [
  { value: 'survivor', label: 'Survivor looking for employment' },
  { value: 'recruiter', label: 'Recruiter / Company' },
  { value: 'ngo_partner', label: 'NGO Partner' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'survivor',
    companyName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkEmailMsg, setCheckEmailMsg] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

  const canSubmit =
    formData.email &&
    isValidEmail(formData.email) &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    (formData.role !== 'recruiter' || formData.companyName.trim().length > 0)

  const handleSignup = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      setError('Please enter a valid email')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.role === 'recruiter' && !formData.companyName.trim()) {
      setError('Please enter your company name')
      return
    }

    setError('')
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) {
        setError(authErrorMessage(signUpError))
        return
      }

      if (!data.session) {
        // Email confirmation is required on this project before a session
        // is issued — the account exists, but can't pick a role yet.
        setCheckEmailMsg(true)
        return
      }

      await assignInitialRole(formData.role, { companyName: formData.companyName.trim() })
      const { roles } = await fetchMyRoles()
      navigate(homePathForRoles(roles) ?? '/select-role')
    } catch (err) {
      setError(authErrorMessage(err, 'Something went wrong creating your account.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6' }}>
      <div style={{
        flex: 1, background: '#0C1F3F', color: '#fff', padding: 60, display: 'flex',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 14, background: '#2563EB', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800,
            marginBottom: 20, fontFamily: 'Plus Jakarta Sans',
          }}>
            C
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>CAREVIA</h1>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 40, fontWeight: 500 }}>
            Survivor Repository
          </p>
          <div style={{ maxWidth: 320, marginBottom: 40 }}>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>
              Join CAREVIA Today
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>
              Create your account and start your journey to employment
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 6 }}>
              Create Account
            </h2>
            <p style={{ fontSize: 12, color: '#6B7280' }}>Join our community</p>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B91C1C' }}>
              {error}
            </div>
          )}

          {checkEmailMsg ? (
            <div style={{ padding: 16, background: '#F0FDF4', border: '0.5px solid #BBF7D0', borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                ✓ Account created
              </div>
              <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.5, marginBottom: 12 }}>
                This project requires confirming your email before signing in. Check your inbox (and spam folder)
                for a confirmation link, then come back and sign in with your new password.
              </div>
              <Link to="/login" style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
                Go to Sign In →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                    fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                    fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  style={{
                    width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                    fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  I am a...
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                    fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box',
                  }}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {formData.role === 'recruiter' && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Acme Inc."
                    style={{
                      width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6,
                      fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <button
                onClick={handleSignup}
                disabled={loading || !canSubmit}
                style={{
                  width: '100%', padding: '11px 13px',
                  background: (!loading && canSubmit) ? '#2563EB' : '#D1D5DB',
                  color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  cursor: (!loading && canSubmit) ? 'pointer' : 'not-allowed',
                  marginBottom: 18, fontFamily: 'Inter',
                }}
              >
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>

              <div style={{ padding: 14, background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 6, marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1E40AF', marginBottom: 8 }}>
                  🔒 Your data is secure
                </div>
                <div style={{ fontSize: 10, color: '#1E40AF', lineHeight: 1.4 }}>
                  We protect survivor privacy with encryption and verified access controls
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
                Already have an account? <Link to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
              </div>
            </>
          )}

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '0.5px solid #E5E7EB', fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>
            🔒 Your privacy is protected
          </div>
        </div>
      </div>
    </div>
  )
}
