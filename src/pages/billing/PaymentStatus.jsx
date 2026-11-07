import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getPaymentStatus } from '../../services/billingService'

export default function PaymentStatus() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId')
  const role = localStorage.getItem('role') || 'recruiter'
  const homePath = role === 'ngo' ? '/ngo' : '/recruiter'

  const [status, setStatus] = useState('pending') // 'pending' | 'paid' | 'failed' | 'expired' | 'unavailable'
  const pollTimerRef = useRef(null)

  useEffect(() => {
    if (!orderId) {
      setStatus('failed')
      return
    }

    let isMounted = true

    const checkStatus = async () => {
      const res = await getPaymentStatus(orderId)
      if (!isMounted) return

      if (res.unavailable) {
        setStatus('unavailable')
        return
      }

      const currentStatus = res?.data?.status
      if (currentStatus === 'paid') {
        setStatus('paid')
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      } else if (currentStatus === 'failed') {
        setStatus('failed')
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      } else if (currentStatus === 'expired') {
        setStatus('expired')
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      } else {
        setStatus('pending')
      }
    }

    // Initial check
    checkStatus()

    // Poll every 4 seconds for pending orders
    pollTimerRef.current = setInterval(checkStatus, 4000)

    return () => {
      isMounted = false
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [orderId])

  return (
    <Layout>
      <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
        <div className="cv-card" style={{ padding: 40 }}>
          {status === 'pending' && (
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  border: '3px solid var(--mist)',
                  borderTopColor: 'var(--navy)',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--navy)', margin: '0 0 10px 0' }}>
                Confirming your payment
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                Please do not refresh or close this window while we verify the transaction with your bank.
              </p>
              {orderId && (
                <div style={{ fontSize: 12, color: 'var(--ink2)', fontFamily: 'monospace' }}>
                  Reference: {orderId}
                </div>
              )}
            </div>
          )}

          {status === 'paid' && (
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#047857',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--navy)', margin: '0 0 10px 0' }}>
                Payment successful
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 28px 0', lineHeight: 1.6 }}>
                Your subscription is now active. Your receipt and invoice have been registered.
              </p>
              <button
                type="button"
                onClick={() => navigate(homePath)}
                className="cv-pill"
                style={{ width: '100%' }}
              >
                Go to dashboard
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#DC2626',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--navy)', margin: '0 0 10px 0' }}>
                Payment could not be completed
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 28px 0', lineHeight: 1.6 }}>
                No charges were confirmed. You may retry with another payment method or try again.
              </p>
              <button
                type="button"
                onClick={() => navigate('/billing/plans')}
                className="cv-pill"
                style={{ width: '100%' }}
              >
                Try again
              </button>
            </div>
          )}

          {status === 'expired' && (
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--mist)',
                  color: 'var(--navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--navy)', margin: '0 0 10px 0' }}>
                Payment session has expired
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 28px 0', lineHeight: 1.6 }}>
                The payment window for this session has closed. Please initiate a new order.
              </p>
              <button
                type="button"
                onClick={() => navigate('/billing/plans')}
                className="cv-pill"
                style={{ width: '100%' }}
              >
                Try again
              </button>
            </div>
          )}

          {status === 'unavailable' && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--navy)', margin: '0 0 10px 0' }}>
                Service unavailable
              </h2>
              <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 28px 0', lineHeight: 1.6 }}>
                Payment verification service is currently being set up. Please contact support or check your subscription status later.
              </p>
              <button
                type="button"
                onClick={() => navigate(homePath)}
                className="cv-soft"
                style={{ width: '100%' }}
              >
                Return to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

