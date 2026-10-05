import { useState } from 'react'
import { ErrorBanner, Loading, Modal, btn, fieldInput, fieldLabel } from './ui'
import { useLiveQuery } from '../lib/live'
import { getMyOrg, saveMyOrg, saveNgoSurvivor, SKILL_SUGGESTIONS } from '../lib/careers'

const split = (s) => String(s ?? '').split(',').map((x) => x.trim()).filter(Boolean)

// Renders `children(org)` once the NGO is approved; otherwise walks the
// partner through registering and shows where approval stands.
export function NgoGate({ children }) {
  const { data: org, loading, error, reload } = useLiveQuery(getMyOrg, { tables: ['ngos'] })
  const [editing, setEditing] = useState(false)

  if (loading) return <Loading />
  if (error) return <ErrorBanner message={error} />

  if (!org) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>Register your organisation</h2>
        <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 20 }}>
          Tell us about your NGO. Once CAREVIA verifies it, you can add survivors, track their progress and verify documents.
        </p>
        <div className="card" style={{ padding: 24 }}>
          <OrgForm onSaved={reload} />
        </div>
      </div>
    )
  }

  if (org.status !== 'approved') {
    const rejected = org.status === 'rejected'
    const suspended = org.status === 'suspended'
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24, marginBottom: 20, background: rejected || suspended ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${rejected || suspended ? '#FECACA' : '#FDE68A'}` }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
            {rejected ? '✕ Registration needs changes' : suspended ? '⛔ Organisation suspended' : '⏳ Awaiting CAREVIA approval'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
            {rejected
              ? <>An admin reviewed <strong>{org.name}</strong> and asked for changes{org.rejection_reason ? `: “${org.rejection_reason}”` : '.'} Update the details below to resubmit.</>
              : suspended
                ? <>Access for <strong>{org.name}</strong> is paused. Please contact the CAREVIA team.</>
                : <><strong>{org.name}</strong> has been submitted. This page will unlock by itself the moment an admin approves it.</>}
          </div>
        </div>
        {!suspended && (
          <div className="card" style={{ padding: 24 }}>
            {editing || rejected ? <OrgForm org={org} onSaved={() => { setEditing(false); reload() }} /> : (
              <button style={btn('ghost')} onClick={() => setEditing(true)}>Edit organisation details</button>
            )}
          </div>
        )}
      </div>
    )
  }

  return children(org, reload)
}

export function OrgForm({ org, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: org?.name ?? '',
    registration_number: org?.registration_number ?? '',
    contact_email: org?.contact_email ?? '',
    contact_phone: org?.contact_phone ?? '',
    website: org?.website ?? '',
    address: org?.address ?? '',
    city: org?.city ?? '',
    state: org?.state ?? '',
    focus_areas: (org?.focus_areas ?? []).join(', '),
    description: org?.description ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await saveMyOrg({ ...form, focus_areas: split(form.focus_areas) })
      await onSaved?.()
    } catch (err) {
      setError(err.message || 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const field = (key, label, props = {}) => (
    <div style={props.full ? { gridColumn: '1 / -1' } : undefined}>
      <label style={fieldLabel}>{label}</label>
      {props.textarea
        ? <textarea style={{ ...fieldInput, minHeight: 80, resize: 'vertical' }} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={props.placeholder} />
        : <input style={fieldInput} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={props.placeholder} type={props.type ?? 'text'} />}
    </div>
  )

  return (
    <>
      <ErrorBanner message={error} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {field('name', 'Organisation name *')}
        {field('registration_number', 'Registration number')}
        {field('contact_email', 'Contact email *', { type: 'email' })}
        {field('contact_phone', 'Contact phone')}
        {field('website', 'Website', { placeholder: 'https://' })}
        {field('city', 'City')}
        {field('state', 'State')}
        {field('address', 'Address')}
        {field('focus_areas', 'Focus areas (comma separated)', { full: true, placeholder: 'Rehabilitation, Skill training, Placement' })}
        {field('description', 'About the organisation', { full: true, textarea: true })}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
        {onCancel && <button style={btn('ghost')} onClick={onCancel}>Cancel</button>}
        <button style={btn('primary', { padding: '9px 18px', opacity: busy ? 0.6 : 1 })} disabled={busy} onClick={submit}>
          {busy ? 'Saving…' : org ? 'Save changes' : 'Submit for approval'}
        </button>
      </div>
    </>
  )
}

export function SurvivorFormModal({ survivor, onClose, onSaved }) {
  const s = survivor ?? {}
  const [form, setForm] = useState({
    full_name: s.full_name ?? '',
    age: s.age ? String(s.age) : '',
    phone: s.phone ?? '',
    email: s.email ?? '',
    city: s.city ?? '',
    state: s.state ?? '',
    languages: (s.languages ?? []).join(', '),
    preferred_roles: (s.preferred_roles ?? []).join(', '),
    skills: s.skills ?? [],
    education_level: s.education_level ?? '',
    total_experience: s.total_experience ?? '',
    bio: s.bio ?? '',
    notes: s.notes ?? '',
    consent: !!s.consent_share_with_recruiters,
  })
  const [skillInput, setSkillInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleSkill = (x) => set('skills', form.skills.includes(x) ? form.skills.filter((y) => y !== x) : [...form.skills, x])

  const submit = async () => {
    if (!form.full_name.trim()) return setError('Full name is required.')
    setBusy(true)
    setError('')
    try {
      await saveNgoSurvivor(s.id, {
        full_name: form.full_name,
        age: form.age,
        phone: form.phone,
        email: form.email,
        city: form.city,
        state: form.state,
        languages: split(form.languages),
        preferred_roles: split(form.preferred_roles),
        skills: form.skills,
        education_level: form.education_level,
        total_experience: form.total_experience,
        bio: form.bio,
        notes: form.notes,
        work_history: s.work_history ?? [],
        certifications: s.certifications ?? [],
        availability: s.availability ?? '',
        accommodation_needs: s.accommodation_needs ?? '',
        consent_share_with_recruiters: form.consent,
      })
      await onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const input = (key, label, props = {}) => (
    <div style={props.full ? { gridColumn: '1 / -1' } : undefined}>
      <label style={fieldLabel}>{label}</label>
      {props.textarea
        ? <textarea style={{ ...fieldInput, minHeight: 70, resize: 'vertical' }} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={props.placeholder} />
        : <input style={fieldInput} type={props.type ?? 'text'} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={props.placeholder} />}
    </div>
  )

  return (
    <Modal title={survivor ? `Edit ${survivor.full_name || survivor.anonymous_id}` : 'Add a survivor'} onClose={onClose} width={680}>
      {survivor?.has_login && (
        <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', padding: '8px 12px', borderRadius: 6, marginBottom: 14 }}>
          This survivor manages their own account. Changes you save here also appear in their profile.
        </div>
      )}
      <ErrorBanner message={error} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {input('full_name', 'Full name *')}
        {input('age', 'Age', { type: 'number' })}
        {input('phone', 'Phone (private)')}
        {input('email', 'Email (private)', { type: 'email' })}
        {input('city', 'City')}
        {input('state', 'State')}
        {input('languages', 'Languages (comma separated)')}
        {input('preferred_roles', 'Preferred roles (comma separated)')}
        <div>
          <label style={fieldLabel}>Education</label>
          <select style={fieldInput} value={form.education_level} onChange={(e) => set('education_level', e.target.value)}>
            <option value="">Select…</option>
            {['Class 5 Pass', 'Class 8 Pass', 'Class 10 Pass', 'Class 12 Pass', 'Diploma', 'ITI Certificate', 'Graduate', 'Post Graduate'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Experience</label>
          <select style={fieldInput} value={form.total_experience} onChange={(e) => set('total_experience', e.target.value)}>
            <option value="">Select…</option>
            {['Less than 1 year', '1–2 years', '2–3 years', '3–5 years', '5+ years'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Skills</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {[...new Set([...SKILL_SUGGESTIONS, ...form.skills])].map((x) => (
              <span key={x} className={`skill-tag ${form.skills.includes(x) ? 'selected' : ''}`} style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => toggleSkill(x)}>
                {form.skills.includes(x) ? '✓ ' : ''}{x}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={fieldInput} value={skillInput} placeholder="Add another skill" onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && skillInput.trim()) { toggleSkill(skillInput.trim()); setSkillInput('') } }} />
            <button style={btn('ghost')} onClick={() => { if (skillInput.trim()) { toggleSkill(skillInput.trim()); setSkillInput('') } }}>Add</button>
          </div>
        </div>
        {input('bio', 'About (visible to recruiters)', { full: true, textarea: true })}
        {input('notes', 'Caseworker notes (private to your NGO)', { full: true, textarea: true })}
        <label style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
          <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} style={{ marginTop: 3 }} />
          <span>The survivor has agreed to be <strong>visible to recruiters</strong> in Talent Search (first name + last initial, skills and experience only).</span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <button style={btn('ghost')} onClick={onClose}>Cancel</button>
        <button style={btn('primary', { padding: '9px 18px', opacity: busy ? 0.6 : 1 })} disabled={busy} onClick={submit}>
          {busy ? 'Saving…' : survivor ? 'Save changes' : 'Add survivor'}
        </button>
      </div>
    </Modal>
  )
}
