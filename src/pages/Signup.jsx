import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { assignInitialRole, fetchMyRoles, homePathForRoles } from '../lib/roles'

const ROLE_OPTIONS = [
  { value: 'survivor', label: 'Survivor looking for employment' },
  { value: 'recruiter', label: 'Recruiter / Company' },
  { value: 'ngo_partner', label: 'NGO Partner' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    role: 'survivor',
    companyName: '',
  })
  const [step, setStep] = useState('email') // 'email' or 'verify'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

  const canRequestOtp =
    formData.email &&
    isValidEmail(formData.email) &&
    (formData.role !== 'recruiter' || formData.companyName.trim().length > 0)

  const handleRequestOTP = async () => {
    if (!canRequestOtp) {
      setError(
        formData.role === 'recruiter' && !formData.companyName.trim()
          ? 'Please enter your company name'
          : 'Please enter a valid email',
      )
      return
    }

    setError('')
    setLoading(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: { shouldCreateUser: true },
      })

      if (otpError) {
        setError(otpError.message)
        return
      }

      setOtp(['', '', '', '', '', ''])
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong sending the code.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleVerifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setError('')
    setLoading(true)
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: code,
        type: 'email',
      })

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired code. Please try again.')
        return
      }

      if (!data.session) return

      // If this account already has a role (e.g. re-verifying an existing
      // account), don't try to assign one again — just route them home.
      const { roles: existingRoles } = await fetchMyRoles()
      if (existingRoles.length > 0) {
        navigate(homePathForRoles(existingRoles) ?? '/select-role')
        return
      }

      await assignInitialRole(formData.role, { companyName: formData.companyName.trim() })
      const { roles } = await fetchMyRoles()
      navigate(homePathForRoles(roles) ?? '/select-role')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong verifying the code.')
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
            <p style={{ fontSize: 12, color: '#6B7280' }}>
              {step === 'email' ? 'Join our community' : 'Verify your email'}
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 12, color: '#B91C1C' }}>
              {error}
            </div>
          )}

          {step === 'email' && (
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
                onClick={handleRequestOTP}
                disabled={loading || !canRequestOtp}
                style={{
                  width: '100%', padding: '11px 13px',
                  background: (!loading && canRequestOtp) ? '#2563EB' : '#D1D5DB',
                  color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  cursor: (!loading && canRequestOtp) ? 'pointer' : 'not-allowed',
                  marginBottom: 18, fontFamily: 'Inter',
                }}
              >
                {loading ? 'Sending code…' : 'Send Verification Code →'}
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
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  6-Digit Code
                </label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      className="otp-box"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      ref={(el) => (otpRefs.current[i] = el)}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                style={{
                  width: '100%', padding: '11px 13px', background: loading ? '#93C5FD' : '#2563EB', color: '#fff',
                  border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10, fontFamily: 'Inter',
                }}
              >
                {loading ? 'Verifying…' : 'Verify & Create Account →'}
              </button>

              <button
                onClick={() => { setStep('email'); setError('') }}
                disabled={loading}
                style={{
                  width: '100%', padding: '9px 13px', background: 'transparent', color: '#2563EB',
                  border: '1px solid #BFDBFE', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter',
                }}
              >
                ← Back
              </button>
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
