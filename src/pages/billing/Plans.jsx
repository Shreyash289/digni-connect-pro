import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { plans } from '../../config/plans'
import { getMySubscription } from '../../services/billingService'

export default function Plans() {
  const navigate = useNavigate()
  const [activePlanId, setActivePlanId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const checkSub = async () => {
      const res = await getMySubscription()
      if (isMounted && res?.data?.status === 'active') {
        setActivePlanId(res.data.plan_id)
      }
      if (isMounted) setLoading(false)
    }
    checkSub()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Layout>
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span className="cv-badge" style={{ marginBottom: 12 }}>
            MEMBERSHIP
          </span>
          <h2 style={{ color: 'var(--navy)', margin: '0 0 8px 0', fontSize: 32, fontWeight: 600 }}>
            Choose your plan
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 15 }}>
            Transparent portal access for verified employers and social impact partners
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 24,
            alignItems: 'stretch'
          }}
        >
          {plans.map((plan) => {
            const isDark = plan.id === '12m' || plan.id === 'life'
            const isCurrent = activePlanId === plan.id
            const priceLabel = plan.price ? `₹${plan.price}` : 'Price to be announced'
            const durationLabel = plan.durationMonths ? `${plan.durationMonths} months access` : 'Lifetime access'
            const isComingSoon = plan.price === null

            return (
              <div
                key={plan.id}
                className={`cv-tile ${isDark ? 'dark' : 'light'}`}
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  border: plan.highlight ? '2px solid var(--royal)' : undefined
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: isDark ? 'var(--sky)' : 'var(--royal)'
                      }}
                    >
                      {durationLabel}
                    </span>
                    {plan.highlight && (
                      <span
                        className="cv-badge"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.18)' : 'var(--navy)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 10px'
                        }}
                      >
                        Most popular
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className="cv-badge"
                        style={{
                          background: '#047857',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 10px'
                        }}
                      >
                        Current plan
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: isDark ? '#fff' : 'var(--navy)' }}>
                    {plan.name}
                  </h3>

                  <div style={{ margin: '16px 0 24px 0' }}>
                    <div style={{ fontSize: 26, fontWeight: 600, color: isDark ? '#fff' : 'var(--ink)' }}>
                      {priceLabel}
                    </div>
                    {plan.price && (
                      <div style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--ink2)', marginTop: 4 }}>
                        Taxes calculated at checkout
                      </div>
                    )}
                  </div>

                  {plan.features && plan.features.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: isDark ? 'rgba(255,255,255,0.9)' : 'var(--ink)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'var(--sky)' : 'var(--royal)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--ink2)', margin: '20px 0' }}>
                      Complete candidate discovery, verification tools, and portal workflows.
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="cv-soft"
                      style={{ width: '100%', opacity: 0.8 }}
                    >
                      Active plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isComingSoon}
                      onClick={() => navigate(`/billing/checkout?plan=${plan.id}`)}
                      className={isDark ? 'cv-pill' : 'cv-pill'}
                      style={{
                        width: '100%',
                        background: isDark ? '#fff' : 'var(--navy)',
                        color: isDark ? 'var(--navy)' : '#fff'
                      }}
                    >
                      {isComingSoon ? 'Pricing coming soon' : 'Choose plan'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

