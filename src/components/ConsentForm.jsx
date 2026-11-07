import { useState, useEffect } from 'react'
import {
  CONSENT_VERSION,
  saveConsent,
  getConsent,
  withdrawConsent,
  requestDataExport,
  requestErasure
} from '../services/consentService'

export { CONSENT_VERSION }

/**
 * ConsentForm
 *
 * Implements granular consent notice and preferences in alignment with
 * DPDP Act 2023 design considerations.
 * Note: Legal copy is marked [LEGAL TEXT TO BE REVIEWED] and does not constitute
 * a claim of statutory certification or legal advice.
 */
export default function ConsentForm({
  role = 'survivor',
  mode = 'form', // 'form' | 'review' | 'compact'
  onConsentChange,
  onSubmit,
  submitLabel = 'Confirm & continue'
}) {
  // Unticked by default — never pre-ticked, never bundled
  const [consents, setConsents] = useState({
    basic_processing: false,
    share_profile: false,
    ai_processing: false,
    billing_tax: false,
    updates_reminders: false
  })

  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const isRecruiterOrNgo = role === 'recruiter' || role === 'ngo'

  // Determine if required consent is satisfied
  // Rule: basic_processing is always required.
  // billing_tax is required for recruiter/ngo before payment or billing registration.
  const isRequiredSatisfied = isRecruiterOrNgo
    ? consents.basic_processing && consents.billing_tax
    : consents.basic_processing

  // Inform parent when consent state changes
  useEffect(() => {
    if (onConsentChange) {
      onConsentChange({
        ...consents,
        isValid: isRequiredSatisfied,
        version: CONSENT_VERSION
      })
    }
  }, [consents, isRequiredSatisfied, onConsentChange])

  // Load existing consent preferences if in review mode
  useEffect(() => {
    if (mode === 'review') {
      let isMounted = true
      const loadConsent = async () => {
        const res = await getConsent()
        if (isMounted && res?.data) {
          setConsents({
            basic_processing: Boolean(res.data.basic_processing),
            share_profile: Boolean(res.data.share_profile),
            ai_processing: Boolean(res.data.ai_processing),
            billing_tax: Boolean(res.data.billing_tax),
            updates_reminders: Boolean(res.data.updates_reminders)
          })
        }
      }
      loadConsent()
      return () => {
        isMounted = false
      }
    }
  }, [mode])

  const toggleConsent = (key) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!isRequiredSatisfied) return

    setBusy(true)
    setFeedback(null)

    const res = await saveConsent(consents)
    setBusy(false)

    if (res.unavailable) {
      setFeedback({ type: 'notice', text: 'Consent preferences recorded locally. Backend sync is being configured.' })
    } else if (res.error) {
      setFeedback({ type: 'error', text: res.error })
    } else {
      setFeedback({ type: 'success', text: 'Consent preferences saved successfully.' })
    }

    if (onSubmit) {
      onSubmit(consents)
    }
  }

  const handleWithdraw = async () => {
    setBusy(true)
    setFeedback(null)
    const res = await withdrawConsent()
    setBusy(false)

    if (res.unavailable) {
      setConsents((prev) => ({
        ...prev,
        share_profile: false,
        ai_processing: false,
        updates_reminders: false
      }))
      setFeedback({ type: 'notice', text: 'Non-essential consent revoked locally. Backend synchronization will finalize upon service setup.' })
    } else if (res.error) {
      setFeedback({ type: 'error', text: res.error })
    } else {
      setConsents((prev) => ({
        ...prev,
        share_profile: false,
        ai_processing: false,
        updates_reminders: false
      }))
      setFeedback({ type: 'success', text: 'Optional consent successfully withdrawn. Profile visibility and AI processing have been paused.' })
    }
  }

  const handleDataExport = async () => {
    setBusy(true)
    setFeedback(null)
    const res = await requestDataExport()
    setBusy(false)

    if (res.unavailable) {
      setFeedback({ type: 'notice', text: 'Data export intake registered. Compliance export services are currently being configured.' })
    } else if (res.error) {
      setFeedback({ type: 'error', text: res.error })
    } else {
      setFeedback({ type: 'success', text: 'Data export request submitted. A secure download package will be prepared for your account.' })
    }
  }

  const handleErasure = async () => {
    setBusy(true)
    setFeedback(null)
    const res = await requestErasure()
    setBusy(false)

    if (res.unavailable) {
      setFeedback({ type: 'notice', text: 'Erasure request logged. Verification and deletion pipelines are currently being configured.' })
    } else if (res.error) {
      setFeedback({ type: 'error', text: res.error })
    } else {
      setFeedback({ type: 'success', text: 'Erasure request received. Your case has been flagged for statutory data sanitization.' })
    }
  }

  return (
    <div className="cv-card" style={{ padding: mode === 'compact' ? 20 : 28 }}>
      {/* Header & Notice */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
            {mode === 'review' ? 'Privacy & Consent Preferences' : 'Data Privacy & Processing Consent'}
          </h3>
          <span className="cv-badge" style={{ fontSize: 11, padding: '4px 10px' }}>
            Version: {CONSENT_VERSION}
          </span>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid var(--line)',
            borderRadius: 16,
            padding: 16,
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--ink)'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
            [LEGAL TEXT TO BE REVIEWED: Data Processing Notice]
          </div>
          <p style={{ margin: '0 0 6px 0', color: 'var(--ink2)' }}>
            <strong>What we collect:</strong> Contact info, profile details, uploaded documents, and platform activity necessary to facilitate employment pathways.
          </p>
          <p style={{ margin: '0 0 6px 0', color: 'var(--ink2)' }}>
            <strong>Why:</strong> To establish account access, facilitate verified survivor-recruiter interactions, and fulfill administrative services.
          </p>
          <p style={{ margin: '0 0 6px 0', color: 'var(--ink2)' }}>
            <strong>Who can access:</strong> Only verified NGO partners and vetted recruiters based strictly on your granular selections below.
          </p>
          <p style={{ margin: '0 0 6px 0', color: 'var(--ink2)' }}>
            <strong>Retention:</strong> Data is retained for the active lifecycle of your account or until erasure is requested.
          </p>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--ink2)' }}>
            Grievance Contact: [LEGAL TEXT TO BE REVIEWED: Grievance Officer, grievance@carevia.org | CareVia Foundation, New Delhi, India]
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            marginBottom: 18,
            fontSize: 13,
            lineHeight: 1.5,
            background: feedback.type === 'error' ? '#FEE2E2' : feedback.type === 'success' ? '#ECFDF5' : '#EEF3FF',
            color: feedback.type === 'error' ? '#991B1B' : feedback.type === 'success' ? '#065F46' : 'var(--navy)',
            borderLeft: `4px solid ${feedback.type === 'error' ? '#DC2626' : feedback.type === 'success' ? '#047857' : 'var(--royal)'}`
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Granular Checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {/* 1. Required: Account & Basic Processing */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            padding: '10px 12px',
            borderRadius: 12,
            background: consents.basic_processing ? '#EEF3FF' : 'transparent',
            transition: 'background 0.15s ease'
          }}
        >
          <input
            type="checkbox"
            checked={consents.basic_processing}
            onChange={() => toggleConsent('basic_processing')}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer' }}
          />
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
            <span>I agree to CAREVIA processing my personal data to provide my account and portal features.</span>{' '}
            <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 11, textTransform: 'uppercase' }}>(Required)</span>
          </div>
        </label>

        {/* 2. Survivors only: Profile sharing */}
        {role === 'survivor' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              padding: '10px 12px',
              borderRadius: 12,
              background: consents.share_profile ? '#EEF3FF' : 'transparent',
              transition: 'background 0.15s ease'
            }}
          >
            <input
              type="checkbox"
              checked={consents.share_profile}
              onChange={() => toggleConsent('share_profile')}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
              <span>I agree to share my profile with verified NGO partners and recruiters.</span>{' '}
              <span style={{ color: 'var(--ink2)', fontSize: 11 }}>(Optional)</span>
            </div>
          </label>
        )}

        {/* 3. AI Features */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            padding: '10px 12px',
            borderRadius: 12,
            background: consents.ai_processing ? '#EEF3FF' : 'transparent',
            transition: 'background 0.15s ease'
          }}
        >
          <input
            type="checkbox"
            checked={consents.ai_processing}
            onChange={() => toggleConsent('ai_processing')}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer' }}
          />
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
            <span>I agree to my information being processed by AI features (AI Mentor) to give me guidance.</span>{' '}
            <span style={{ color: 'var(--ink2)', fontSize: 11 }}>(Optional)</span>
          </div>
        </label>

        {/* 4. Recruiters and NGOs only: Billing & Tax Compliance */}
        {isRecruiterOrNgo && (
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              padding: '10px 12px',
              borderRadius: 12,
              background: consents.billing_tax ? '#EEF3FF' : 'transparent',
              transition: 'background 0.15s ease'
            }}
          >
            <input
              type="checkbox"
              checked={consents.billing_tax}
              onChange={() => toggleConsent('billing_tax')}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
              <span>I agree to my organisation and billing details being processed for subscription, invoicing and tax compliance.</span>{' '}
              <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 11, textTransform: 'uppercase' }}>(Required for organizations)</span>
            </div>
          </label>
        )}

        {/* 5. Updates & Reminders */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            padding: '10px 12px',
            borderRadius: 12,
            background: consents.updates_reminders ? '#EEF3FF' : 'transparent',
            transition: 'background 0.15s ease'
          }}
        >
          <input
            type="checkbox"
            checked={consents.updates_reminders}
            onChange={() => toggleConsent('updates_reminders')}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--navy)', cursor: 'pointer' }}
          />
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
            <span>I agree to receive service updates and reminders.</span>{' '}
            <span style={{ color: 'var(--ink2)', fontSize: 11 }}>(Optional)</span>
          </div>
        </label>
      </div>

      {/* Links to Privacy Notice & Terms */}
      <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 20 }}>
        By selecting these preferences, you acknowledge our{' '}
        <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Placeholder: CAREVIA Privacy Notice') }} style={{ color: 'var(--royal)', textDecoration: 'underline' }}>
          Privacy Notice
        </a>{' '}
        and{' '}
        <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Placeholder: CAREVIA Terms of Service') }} style={{ color: 'var(--royal)', textDecoration: 'underline' }}>
          Terms of Service
        </a>.
      </div>

      {/* Your Data Rights Section */}
      <div
        style={{
          borderTop: '1px solid var(--line)',
          paddingTop: 18,
          marginBottom: 20
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>
          Your data rights
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink2)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
          You have statutory rights to access your records, request corrections, demand data erasure, withdraw consent freely at any time, and nominate a representative.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="button"
            disabled={busy}
            onClick={handleWithdraw}
            className="cv-soft"
            style={{ fontSize: 12, padding: '7px 16px' }}
          >
            Withdraw optional consent
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDataExport}
            className="cv-soft"
            style={{ fontSize: 12, padding: '7px 16px' }}
          >
            Request my data
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleErasure}
            className="cv-soft"
            style={{ fontSize: 12, padding: '7px 16px' }}
          >
            Request erasure
          </button>
        </div>
      </div>

      {/* Submit / Save action for form mode */}
      {mode !== 'compact' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            disabled={!isRequiredSatisfied || busy}
            onClick={handleSave}
            className="cv-pill"
          >
            {busy ? 'Saving...' : submitLabel}
          </button>
        </div>
      )}
    </div>
  )
}

