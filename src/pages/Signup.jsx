import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logoNavy from '../assets/carevia-logo-navy.png'

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
              {step === 'email' ? 'Select your role and get started' : `Verification code sent to ${formData.email}`}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
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

              <button
                onClick={handleRequestOTP}
                disabled={!formData.email || !isValidEmail(formData.email)}
                className="btn-pill"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: 14,
                  opacity: (!formData.email || !isValidEmail(formData.email)) ? 0.6 : 1,
                  cursor: (!formData.email || !isValidEmail(formData.email)) ? 'not-allowed' : 'pointer',
                  marginBottom: 20
                }}
              >
                Send verification code
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
                onClick={handleVerifyOTP}
                className="btn-pill"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: 14,
                  marginBottom: 12
                }}
              >
                Verify & create account
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