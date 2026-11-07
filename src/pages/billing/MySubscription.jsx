import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { plans } from '../../config/plans'
import {
  getMySubscription,
  listInvoices,
  getInvoiceDownloadUrl
} from '../../services/billingService'

export default function MySubscription() {
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoading(true)
      const subRes = await getMySubscription()
      const invRes = await listInvoices()

      if (!isMounted) return

      if (subRes.unavailable || invRes.unavailable) {
        setUnavailable(true)
      }

      if (subRes?.data) {
        setSubscription(subRes.data)
      }
      if (invRes?.data) {
        setInvoices(invRes.data)
      }

      setLoading(false)
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleDownloadInvoice = async (pdfPath) => {
    setDownloadError(null)
    const res = await getInvoiceDownloadUrl(pdfPath)
    if (res?.data?.signedUrl) {
      window.open(res.data.signedUrl, '_blank', 'noopener,noreferrer')
    } else {
      setDownloadError(res.error || 'Invoice download link could not be generated.')
    }
  }

  const matchedPlan = plans.find((p) => p.id === subscription?.plan_id)
  const planDisplayName = matchedPlan?.name || subscription?.plan_name || 'Active Membership'

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 28, fontWeight: 600 }}>
              Subscription & Invoicing
            </h2>
            <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
              Manage your organisation’s portal access, billing records, and tax invoices
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/billing/plans')}
            className="cv-pill"
          >
            Change plan
          </button>
        </div>

        {downloadError && (
          <div
            className="cv-card"
            style={{
              padding: '12px 18px',
              marginBottom: 20,
              borderLeft: '4px solid #DC2626',
              background: '#FEE2E2',
              color: '#991B1B',
              fontSize: 13
            }}
          >
            {downloadError}
          </div>
        )}

        {unavailable && (
          <div
            className="cv-card"
            style={{
              padding: '16px 20px',
              marginBottom: 24,
              borderLeft: '4px solid var(--royal)',
              background: '#EEF3FF'
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--navy)', fontWeight: 500 }}>
              Subscription and billing services are currently being configured. In-person or demo access remains active.
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="cv-card" style={{ marginBottom: 28, padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <span className="cv-badge" style={{ marginBottom: 8 }}>
                CURRENT SUBSCRIPTION
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
                {subscription ? planDisplayName : 'No active subscription'}
              </h3>
            </div>
            {subscription && (
              <span
                className="cv-badge"
                style={{
                  background: subscription.status === 'active' ? '#ECFDF5' : 'var(--mist)',
                  color: subscription.status === 'active' ? '#047857' : 'var(--ink)',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '6px 14px'
                }}
              >
                {(subscription.status || 'Active').toUpperCase()}
              </span>
            )}
          </div>

          {subscription ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, marginBottom: 4 }}>
                  START DATE
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                  {formatDate(subscription.starts_at || subscription.created_at)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, marginBottom: 4 }}>
                  EXPIRY DATE
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                  {subscription.ends_at ? formatDate(subscription.ends_at) : 'Lifetime'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, marginBottom: 4 }}>
                  BILLING CADENCE
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                  {matchedPlan?.durationMonths ? `${matchedPlan.durationMonths} Months` : 'One-time Lifetime'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '0 0 20px 0', lineHeight: 1.6 }}>
                You do not currently have a paid subscription on record. Explore our plans to unlock full candidate messaging, interview scheduling, and verification pipelines.
              </p>
              <button
                type="button"
                onClick={() => navigate('/billing/plans')}
                className="cv-pill"
              >
                View plans
              </button>
            </div>
          )}
        </div>

        {/* Invoice List */}
        <div className="cv-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', margin: '0 0 20px 0' }}>
            Tax invoices
          </h3>

          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--ink2)', padding: '16px 0' }}>
              Loading billing records...
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink2)' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 500 }}>INVOICE</th>
                    <th style={{ padding: '10px 12px', fontWeight: 500 }}>DATE</th>
                    <th style={{ padding: '10px 12px', fontWeight: 500 }}>AMOUNT</th>
                    <th style={{ padding: '10px 12px', fontWeight: 500, textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--navy)' }}>
                        {inv.number || `INV-${inv.id.slice(0, 8)}`}
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink)' }}>
                        {formatDate(inv.issued_at)}
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 500, color: 'var(--ink)' }}>
                        ₹{inv.amount}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        {inv.pdf_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(inv.pdf_path)}
                            className="cv-soft"
                            style={{ padding: '6px 14px', fontSize: 12 }}
                          >
                            Download PDF
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--ink2)' }}>Processing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink2)', fontSize: 13 }}>
              No invoices generated yet. Invoices appear here automatically following payment confirmation.
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

