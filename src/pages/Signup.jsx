import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'survivor'
  })
  const [step, setStep] = useState('email') // 'email' or 'verify'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const isValidEmail = (email) => {
    return email.includes('@') && email.includes('.')
  }

  const handleRequestOTP = () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      alert('Please enter a valid email')
      return
    }
    localStorage.setItem('tempEmail', formData.email)
    setStep('verify')
  }

  const handleVerifyOTP = () => {
    // Mock OTP verification
    localStorage.setItem('email', formData.email)
    localStorage.setItem('role', formData.role)
    localStorage.setItem('isLoggedIn', 'true')
    alert('✅ Signup successful! Welcome to CAREVIA')
    navigate('/select-role')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6' }}>
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
        <div style={{ position: 'relative', zIndex: 10 }}>
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
              Join CAREVIA Today
            </div>
            <div style={{
              fontSize: 11,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.7)'
            }}>
              Create your account and start your journey to employment
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
        <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0C1F3F',
              fontFamily: 'Plus Jakarta Sans',
              marginBottom: 6
            }}>
              Create Account
            </h2>
            <p style={{ fontSize: 12, color: '#6B7280' }}>
              {step === 'email' ? 'Join our community' : 'Verify your email'}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    border: '0.5px solid #E5E7EB',
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: 'Inter',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 7
                }}>
                  I am a...
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    border: '0.5px solid #E5E7EB',
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: 'Inter',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="survivor">Survivor looking for employment</option>
                  <option value="recruiter">Recruiter/Company</option>
                  <option value="ngo">NGO Partner</option>
                </select>
              </div>

              <button
                onClick={handleRequestOTP}
                disabled={!formData.email || !isValidEmail(formData.email)}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  background: (formData.email && isValidEmail(formData.email)) ? '#2563EB' : '#D1D5DB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: (formData.email && isValidEmail(formData.email)) ? 'pointer' : 'not-allowed',
                  marginBottom: 18,
                  fontFamily: 'Inter'
                }}
              >
                Send Verification Code →
              </button>

              <div style={{
                padding: 14,
                background: '#EFF6FF',
                border: '0.5px solid #BFDBFE',
                borderRadius: 6,
                marginBottom: 18
              }}>
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

          {step === 'verify' && (
            <>
              <div style={{ marginBottom: 18, padding: 12, background: '#F0FDF4', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginBottom: 4 }}>
                  ✓ Verification code sent to:
                </div>
                <div style={{ fontSize: 12, color: '#0C1F3F', fontWeight: 600 }}>
                  {formData.email}
                </div>
              </div>

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
                onClick={handleVerifyOTP}
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
                Verify & Create Account →
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
                ← Back
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
            🔒 Your privacy is protected
          </div>
        </div>
      </div>
    </div>
  )
}