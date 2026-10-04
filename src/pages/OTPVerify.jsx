import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logoNavy from '../assets/carevia-logo-navy.png'

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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
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
            Enter the 6-digit verification passcode sent to your inbox
          </p>
        </div>

        {/* FORM CARD */}
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
            Check your email
          </h3>
          <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 4 }}>
            We sent a 6-digit verification code to
          </p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--royal)', marginBottom: 24 }}>
            {email}
          </p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => (refs.current[i] = el)}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                style={{
                  width: 44,
                  height: 52,
                  padding: 0,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 500,
                  borderRadius: 'var(--r-input)'
                }}
              />
            ))}
          </div>

          {error && <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</div>}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn-pill"
            style={{ width: '100%', padding: '13px', fontSize: 14, marginBottom: 12, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verifying...' : 'Verify and continue'}
          </button>

          <button
            onClick={autofill}
            className="btn-soft"
            style={{ width: '100%', padding: '10px', fontSize: 13, marginBottom: 20 }}
          >
            Auto-fill demo code
          </button>

          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
            Didn't receive it?{' '}
            <span
              style={{ color: 'var(--royal)', fontWeight: 500, cursor: 'pointer' }}
              onClick={() => alert('Code resent!')}
            >
              Resend code
            </span>
          </div>

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--ink2)' }}>
            <span style={{ cursor: 'pointer', color: 'var(--royal)', fontWeight: 500 }} onClick={() => navigate('/login')}>
              ← Back to sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
