import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OTPVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || 'user@example.com'

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits'); return }
    setLoading(true); setError('')
    setTimeout(() => { setLoading(false); navigate('/select-role') }, 1000)
  }

  const autofill = () => {
    const demo = ['4', '2', '7', '8', '9', '1']
    setOtp(demo)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6' }}>
      <div className="card fade-in" style={{ width: 420, padding: '40px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px' }}>📩</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', marginBottom: 8, fontFamily: 'Plus Jakarta Sans' }}>Check your email</h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 8 }}>
          We sent a 6-digit login code to
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#2563EB', marginBottom: 28 }}>{email}</p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={el => refs.current[i] = el}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
            />
          ))}
        </div>

        {error && <div style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{error}</div>}

        <button className="btn-primary" onClick={handleVerify} disabled={loading}
          style={{ width: '100%', padding: '13px', fontSize: 15, borderRadius: 10, marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Verifying...' : 'Verify & Continue →'}
        </button>

        <button onClick={autofill}
          style={{ width: '100%', padding: '10px', fontSize: 13, borderRadius: 8, background: '#F3F4F6', color: '#374151', border: '0.5px solid #E5E7EB', cursor: 'pointer', marginBottom: 20 }}>
          Demo: Auto-fill code
        </button>

        <div style={{ fontSize: 13, color: '#6B7280' }}>
          Didn't receive it?{' '}
          <span style={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => alert('Code resent!')}>Resend code</span>
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: '#9CA3AF' }}>
          ← <span style={{ cursor: 'pointer', color: '#6B7280' }} onClick={() => navigate('/login')}>Back to login</span>
        </div>
      </div>
    </div>
  )
}
