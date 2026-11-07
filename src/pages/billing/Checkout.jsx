import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { plans } from '../../config/plans'
import {
  createOrder,
  openCheckout,
  getPaymentStatus,
  getBillingProfile,
  saveBillingProfile
} from '../../services/billingService'
import ConsentForm from '../../components/ConsentForm'
import { saveConsent } from '../../services/consentService'

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const planId = searchParams.get('plan') || '12m'
  const selectedPlan = plans.find((p) => p.id === planId) || plans[0]

  const [method, setMethod] = useState('upi') // 'upi' | 'netbanking' | 'qr' | 'card'
  const [upiId, setUpiId] = useState('')
  const [billingProfile, setBillingProfile] = useState({
    org_name: '',
    gstin: '',
    address: '',
    contact_name: '',
    phone: ''
  })

  const [loading, setLoading] = useState(false)
  const [actionNotice, setActionNotice] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [qrTimeRemaining, setQrTimeRemaining] = useState(300) // 5 minutes in seconds
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [consentValid, setConsentValid] = useState(false)
  const [consentData, setConsentData] = useState(null)

  const pollIntervalRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  // Load existing billing profile
  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      const res = await getBillingProfile()
      if (isMounted && res?.data) {
        setBillingProfile((prev) => ({
          ...prev,
          org_name: res.data.org_name || '',
          gstin: res.data.gstin || '',
          address: res.data.address || '',
          contact_name: res.data.contact_name || '',
          phone: res.data.phone || ''
        }))
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  // QR countdown & status polling
  useEffect(() => {
    if (qrData && currentOrderId) {
      setQrTimeRemaining(300)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = setInterval(() => {
        setQrTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = setInterval(async () => {
        const statusRes = await getPaymentStatus(currentOrderId)
        if (statusRes?.data?.status === 'paid') {
          clearInterval(pollIntervalRef.current)
          clearInterval(countdownIntervalRef.current)
          navigate(`/billing/status?orderId=${currentOrderId}`)
        } else if (statusRes?.data?.status === 'failed' || statusRes?.data?.status === 'expired') {
          clearInterval(pollIntervalRef.current)
          clearInterval(countdownIntervalRef.current)
          navigate(`/billing/status?orderId=${currentOrderId}`)
        }
      }, 4000)
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [qrData, currentOrderId, navigate])

  const handleInputChange = (field, value) => {
    setBillingProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentInitiation = async () => {
    setActionNotice(null)
    setLoading(true)

    // Save billing profile
    if (billingProfile.org_name) {
      await saveBillingProfile(billingProfile)
    }

    // Save consent record
    if (consentData) {
      await saveConsent(consentData)
    }

    const orderRes = await createOrder(selectedPlan.id, method)
    if (orderRes.unavailable || orderRes.error) {
      setActionNotice(orderRes.error || 'Payments are being set up. Please check back soon.')
      setLoading(false)
      return
    }

    const order = orderRes.data
    if (method === 'qr') {
      if (order?.qr?.imageUrl || order?.qr?.imageBase64) {
        setQrData(order.qr)
        setCurrentOrderId(order.orderId)
      } else {
        setActionNotice('Payments are being set up. Please check back soon.')
      }
      setLoading(false)
      return
    }

    // Hosted checkout handoff
    const checkoutRes = await openCheckout(order)
    if (checkoutRes.unavailable) {
      setActionNotice('Payments are being set up. Please check back soon.')
    }
    setLoading(false)
  }

  const isPriceComingSoon = selectedPlan?.price === null
  const formattedMinutes = String(Math.floor(qrTimeRemaining / 60)).padStart(2, '0')
  const formattedSeconds = String(qrTimeRemaining % 60).padStart(2, '0')

  const getPayButtonText = (defaultLabel) => {
    if (isPriceComingSoon) return 'Pricing coming soon'
    if (!consentValid) return 'Consent required before payment'
    if (loading) return 'Processing...'
    return defaultLabel
  }

  return (
    <Layout>
      <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => navigate('/billing/plans')}
            className="cv-soft"
            style={{ marginBottom: 16 }}
          >
            ← Back to plans
          </button>
          <h2 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 28, fontWeight: 600 }}>
            Checkout & Billing
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
            Review your plan details and select a secure payment method
          </p>
        </div>

        {actionNotice && (
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
              {actionNotice}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'start'
          }}
        >
          {/* Left Column: Summary, Billing Form, Consent & Payment Methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Order summary card */}
            <div className="cv-card">
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', margin: '0 0 16px 0' }}>
                Order summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{selectedPlan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                    {selectedPlan.durationMonths ? `${selectedPlan.durationMonths} months access` : 'Lifetime access'}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {isPriceComingSoon ? 'Price to be announced' : `₹${selectedPlan.price}`}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13, color: 'var(--ink2)' }}>
                <span>GST (18%)</span>
                <span>Calculated at payment</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>
                <span>Total</span>
                <span>{isPriceComingSoon ? 'Price to be announced' : `₹${selectedPlan.price}`}</span>
              </div>
            </div>

            {/* Billing details form */}
            <div className="cv-card">
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', margin: '0 0 16px 0' }}>
                Billing details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4 }}>
                    Organisation name
                  </label>
                  <input
                    type="text"
                    className="cv-input"
                    value={billingProfile.org_name}
                    onChange={(e) => handleInputChange('org_name', e.target.value)}
                    placeholder="Company or Foundation name"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4 }}>
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    className="cv-input"
                    value={billingProfile.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4 }}>
                    Registered address
                  </label>
                  <input
                    type="text"
                    className="cv-input"
                    value={billingProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street, City, State, PIN"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4 }}>
                      Contact name
                    </label>
                    <input
                      type="text"
                      className="cv-input"
                      value={billingProfile.contact_name}
                      onChange={(e) => handleInputChange('contact_name', e.target.value)}
                      placeholder="Primary contact"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 4 }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="cv-input"
                      value={billingProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Granular Consent Form for Billing & Invoicing */}
            <ConsentForm
              role="recruiter"
              mode="compact"
              onConsentChange={(c) => {
                setConsentValid(c.isValid)
                setConsentData(c)
              }}
            />

            {/* Payment method picker */}
            <div className="cv-card">
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', margin: '0 0 16px 0' }}>
                Payment method
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { id: 'upi', label: 'UPI' },
                  { id: 'netbanking', label: 'Net banking' },
                  { id: 'qr', label: 'QR code' },
                  { id: 'card', label: 'Card' }
                ].map((item) => {
                  const isSelected = method === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setMethod(item.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 16,
                        border: isSelected ? '2px solid var(--navy)' : '1px solid var(--line)',
                        background: isSelected ? '#EEF3FF' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? 'var(--navy)' : 'var(--ink)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{item.label}</span>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          border: isSelected ? '4px solid var(--navy)' : '1px solid var(--line)',
                          background: '#fff'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Payment Action per selected method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="cv-card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', margin: '0 0 16px 0' }}>
                Complete payment
              </h3>

              {method === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
                      UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      className="cv-input"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@bank / mobile@upi"
                    />
                    <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4 }}>
                      Enter your registered Virtual Payment Address
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isPriceComingSoon || loading || !consentValid}
                    onClick={handlePaymentInitiation}
                    className="cv-pill"
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    {getPayButtonText('Pay with UPI')}
                  </button>
                </div>
              )}

              {method === 'netbanking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                    Select your bank on our secure payment gateway partner screen. All major Indian banks supported.
                  </p>
                  <button
                    type="button"
                    disabled={isPriceComingSoon || loading || !consentValid}
                    onClick={handlePaymentInitiation}
                    className="cv-pill"
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    {getPayButtonText('Pay with net banking')}
                  </button>
                </div>
              )}

              {method === 'qr' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
                  {!qrData ? (
                    <>
                      <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                        Generate a one-time dynamic QR code to scan with Google Pay, PhonePe, Paytm, or any UPI app.
                      </p>
                      <button
                        type="button"
                        disabled={isPriceComingSoon || loading || !consentValid}
                        onClick={handlePaymentInitiation}
                        className="cv-pill"
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        {getPayButtonText('Generate QR')}
                      </button>
                    </>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          padding: 16,
                          borderRadius: 20,
                          border: '1px solid var(--line)',
                          background: '#fff',
                          display: 'inline-block'
                        }}
                      >
                        {qrData.imageUrl ? (
                          <img
                            src={qrData.imageUrl}
                            alt="Scan QR to pay"
                            style={{ width: 180, height: 180, display: 'block' }}
                          />
                        ) : qrData.imageBase64 ? (
                          <img
                            src={`data:image/png;base64,${qrData.imageBase64}`}
                            alt="Scan QR to pay"
                            style={{ width: 180, height: 180, display: 'block' }}
                          />
                        ) : (
                          <div style={{ padding: 40, fontSize: 13, color: 'var(--ink2)' }}>
                            QR code unavailable
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                        Scan with any UPI app
                      </div>
                      <div style={{ fontSize: 12, color: qrTimeRemaining < 60 ? '#DC2626' : 'var(--ink2)' }}>
                        Expires in {formattedMinutes}:{formattedSeconds}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {method === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                    Credit & Debit cards (Visa, Mastercard, RuPay) are verified on our PCI-DSS compliant partner page.
                  </p>
                  <button
                    type="button"
                    disabled={isPriceComingSoon || loading || !consentValid}
                    onClick={handlePaymentInitiation}
                    className="cv-pill"
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    {getPayButtonText('Pay securely')}
                  </button>
                </div>
              )}

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: '1px solid var(--line)',
                  fontSize: 12,
                  color: 'var(--ink2)',
                  lineHeight: 1.5
                }}
              >
                Payments are processed securely by our payment partner. CAREVIA does not store your card or bank details.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
