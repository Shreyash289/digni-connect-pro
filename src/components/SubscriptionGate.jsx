import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './Layout'
import { supabase } from '../integrations/supabase/client'
import { getMySubscription } from '../services/billingService'

const DEMO_EMAILS = [
  'survivor@demo.carevia',
  'recruiter@demo.carevia',
  'ngo@demo.carevia',
  'admin@demo.carevia'
]

export default function SubscriptionGate({ children }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let isMounted = true

    const verifyAccess = async () => {
      try {
        // Demo mode bypass is UI only; real enforcement is database row-level security.
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user
        const localEmail = localStorage.getItem('email')
        const currentEmail = user?.email || localEmail

        // 1. Not signed in via Supabase or using demo accounts -> allow demo access
        if (!user || DEMO_EMAILS.includes(currentEmail?.toLowerCase())) {
          // Demo mode bypass is UI only; real enforcement is database row-level security.
          if (isMounted) {
            setAllowed(true)
            setLoading(false)
          }
          return
        }

        // 2. Signed in via Supabase: check active subscription
        const subRes = await getMySubscription()

        if (!isMounted) return

        // 3. Subscription lookup unavailable (backend tables missing) -> allow access and warn
        if (subRes.unavailable) {
          console.warn('[SubscriptionGate] Subscription table/function unavailable. Permitting access in degraded mode.')
          setAllowed(true)
          setLoading(false)
          return
        }

        // 4. Check if subscription is active
        if (subRes?.data && subRes.data.status === 'active') {
          setAllowed(true)
        } else {
          setAllowed(false)
        }
      } catch (err) {
        console.warn('[SubscriptionGate] Unexpected error during verification, permitting access:', err)
        if (isMounted) setAllowed(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    verifyAccess()

    return () => {
      isMounted = false
    }
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 540, margin: '60px auto' }}>
          <div className="cv-card" style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: '45%', height: 22, borderRadius: 8, background: 'var(--mist)' }} />
            <div style={{ width: '85%', height: 14, borderRadius: 6, background: 'var(--mist)' }} />
            <div style={{ width: '70%', height: 14, borderRadius: 6, background: 'var(--mist)' }} />
            <div style={{ width: 140, height: 38, borderRadius: 999, background: 'var(--mist)', marginTop: 8 }} />
          </div>
        </div>
      </Layout>
    )
  }

  // Allowed: render child portal component
  if (allowed) {
    return children
  }

  // Locked state: signed in with real account but no active plan
  return (
    <Layout>
      <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
        <div className="cv-card" style={{ padding: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--mist)',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--navy)', margin: '0 0 10px 0' }}>
            Subscribe to access this portal
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 28px 0', lineHeight: 1.6 }}>
            Unlock verified candidate profiles, direct interview scheduling, and recruitment management features.
          </p>
          <button
            type="button"
            onClick={() => navigate('/billing/plans')}
            className="cv-pill"
            style={{ width: '100%' }}
          >
            View plans
          </button>
        </div>
      </div>
    </Layout>
  )
}

