import { useState } from 'react'
import { formatDate, statusInfo } from '../lib/careers'

export function LiveBadge({ live }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999,
      background: live ? '#ECFDF5' : '#F3F4F6', color: live ? '#059669' : '#6B7280', fontSize: 11, fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: live ? '#10B981' : '#9CA3AF' }} />
      {live ? 'Live' : 'Connecting…'}
    </span>
  )
}

export function PageHeader({ title, subtitle, live, action }) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#6B7280' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {live !== undefined && <LiveBadge live={live} />}
        {action}
      </div>
    </div>
  )
}

export function StatGrid({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`, gap: 12, marginBottom: 24 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ padding: 16, background: s.bg, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{s.value}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#B91C1C' }}>
      {message}
    </div>
  )
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#6B7280' }}>{title}</div>
      {hint && <div style={{ fontSize: 12 }}>{hint}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return <div className="card" style={{ padding: 32, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>{label}</div>
}

export function StatusPill({ status }) {
  const s = statusInfo(status)
  return (
    <span style={{ padding: '4px 10px', background: s.bg, color: s.color, borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

export function Tag({ children }) {
  return (
    <span style={{ fontSize: 11, background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: 100 }}>{children}</span>
  )
}

export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(12,31,63,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={onClose}
    >
      <div className="card" style={{ width, maxWidth: '100%', padding: 28, maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const fieldLabel = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }
export const fieldInput = {
  width: '100%', padding: '9px 12px', borderRadius: 6, border: '0.5px solid #D1D5DB',
  fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box', background: '#fff',
}

export function btn(variant = 'primary', extra = {}) {
  const v = {
    primary: { background: '#2563EB', color: '#fff', border: 'none' },
    success: { background: '#059669', color: '#fff', border: 'none' },
    purple: { background: '#7C3AED', color: '#fff', border: 'none' },
    teal: { background: '#0D9488', color: '#fff', border: 'none' },
    ghost: { background: '#F3F4F6', color: '#374151', border: '0.5px solid #E5E7EB' },
    danger: { background: '#FEE2E2', color: '#DC2626', border: '0.5px solid #FECACA' },
    outlinePurple: { background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' },
  }[variant]
  return { padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', ...v, ...extra }
}

const initials = (name) =>
  String(name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export function Avatar({ name }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 10, background: '#EDE9FE', color: '#6D28D9', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans'
    }}>
      {initials(name)}
    </div>
  )
}

const place = (c) => [c.city, c.state].filter(Boolean).join(', ')

// Card used in search, shortlist and applicants lists
export function CandidateCard({ c, onView, onToggleSave, saving, footer }) {
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
        <Avatar name={c.display_name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F' }}>{c.display_name}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            {[c.age ? `${c.age} yrs` : null, place(c) || null].filter(Boolean).join(' · ') || 'Location not shared'}
          </div>
        </div>
        {onToggleSave && (
          <button
            onClick={onToggleSave}
            disabled={saving}
            title={c.is_saved ? 'Remove from shortlist' : 'Add to shortlist'}
            style={{
              padding: '6px 10px', borderRadius: 8, cursor: saving ? 'wait' : 'pointer', fontSize: 14,
              border: `1px solid ${c.is_saved ? '#7C3AED' : '#E5E7EB'}`, background: c.is_saved ? '#F5F3FF' : '#fff'
            }}
          >
            {c.is_saved ? '🔖' : '📌'}
          </button>
        )}
      </div>

      {c.preferred_roles?.length > 0 && (
        <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', marginBottom: 8 }}>{c.preferred_roles.join(', ')}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {c.skills?.length ? c.skills.slice(0, 6).map((s) => <Tag key={s}>{s}</Tag>) : <span style={{ fontSize: 11, color: '#9CA3AF' }}>No skills listed yet</span>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Profile completeness</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{c.profile_completion ?? 0}%</span>
        </div>
        <div className="progress-track" style={{ height: 4 }}>
          <div className="progress-fill" style={{ width: `${c.profile_completion ?? 0}%` }} />
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {footer}
        {onView && <button style={btn('primary', { width: '100%', padding: '8px' })} onClick={onView}>View Profile</button>}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 13 }}>
      <span style={{ color: '#6B7280', minWidth: 130 }}>{label}</span>
      <span style={{ fontWeight: 500, color: '#0C1F3F' }}>{value}</span>
    </div>
  )
}

export function CandidateProfileModal({ c, onClose, actions }) {
  const work = Array.isArray(c.work_history) ? c.work_history : []
  const certs = Array.isArray(c.certifications) ? c.certifications : []
  return (
    <Modal title={c.display_name} onClose={onClose} width={560}>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: -12, marginBottom: 16 }}>Candidate ID {c.anonymous_id}</div>
      <Row label="Age" value={c.age ? `${c.age} years` : null} />
      <Row label="Location" value={place(c)} />
      <Row label="Preferred roles" value={c.preferred_roles?.join(', ')} />
      <Row label="Education" value={c.education_level} />
      <Row label="Experience" value={c.total_experience} />
      <Row label="Languages" value={c.languages?.join(', ')} />
      <Row label="Certifications" value={certs.map((x) => x?.name).filter(Boolean).join(', ')} />

      {c.bio && (
        <div style={{ margin: '14px 0', fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#F9FAFB', padding: 12, borderRadius: 8 }}>{c.bio}</div>
      )}

      <div style={{ margin: '16px 0' }}>
        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {c.skills?.length ? c.skills.map((s) => <Tag key={s}>{s}</Tag>) : <span style={{ fontSize: 12, color: '#9CA3AF' }}>None listed</span>}
        </div>
      </div>

      {work.length > 0 && (
        <div style={{ margin: '16px 0' }}>
          <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Work history</div>
          {work.map((w, i) => (
            <div key={i} style={{ fontSize: 13, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#0C1F3F' }}>{[w.role, w.company].filter(Boolean).join(' · ')}</div>
              {w.description && <div style={{ color: '#6B7280', fontSize: 12 }}>{w.description}</div>}
            </div>
          ))}
        </div>
      )}

      {c.cover_note && (
        <div style={{ margin: '16px 0', padding: 12, background: '#EFF6FF', borderRadius: 8, fontSize: 13, color: '#1E3A8A' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Cover note</div>
          {c.cover_note}
        </div>
      )}

      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>{actions}</div>}

      <div style={{ marginTop: 16, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '0.5px solid #FECACA' }}>
        <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>⚠️ Privacy protection active</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          Full name and contact details are never shown. Use interviews on CAREVIA to connect.
        </div>
      </div>
    </Modal>
  )
}

function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 3600 * 1000)
  d.setMinutes(0, 0, 0)
  d.setHours(10)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Used for both scheduling and rescheduling. `onSubmit` receives
// { scheduledAt (ISO), interviewType, videoLink, notes }.
export function InterviewModal({ title, candidateName, initial, onSubmit, onClose }) {
  const [form, setForm] = useState({
    when: initial?.when ?? defaultDateTime(),
    interviewType: initial?.interviewType ?? 'virtual',
    videoLink: initial?.videoLink ?? '',
    notes: initial?.notes ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.when) return setError('Pick a date and time.')
    setBusy(true)
    setError('')
    try {
      await onSubmit({
        scheduledAt: new Date(form.when).toISOString(),
        interviewType: form.interviewType,
        videoLink: form.videoLink.trim(),
        notes: form.notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save the interview.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose} width={460}>
      {candidateName && <div style={{ fontSize: 13, color: '#6B7280', marginTop: -10, marginBottom: 16 }}>with {candidateName}</div>}
      <ErrorBanner message={error} />
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <label style={fieldLabel}>Date & time</label>
          <input type="datetime-local" style={fieldInput} value={form.when} onChange={(e) => set('when', e.target.value)} />
        </div>
        <div>
          <label style={fieldLabel}>Interview type</label>
          <select style={fieldInput} value={form.interviewType} onChange={(e) => set('interviewType', e.target.value)}>
            <option value="virtual">Video call</option>
            <option value="phone">Phone call</option>
            <option value="in_person">In person</option>
          </select>
        </div>
        <div>
          <label style={fieldLabel}>{form.interviewType === 'in_person' ? 'Address' : 'Meeting link'} (shown to the candidate)</label>
          <input style={fieldInput} value={form.videoLink} onChange={(e) => set('videoLink', e.target.value)}
            placeholder={form.interviewType === 'in_person' ? 'Office address' : 'https://meet.google.com/…'} />
        </div>
        <div>
          <label style={fieldLabel}>Private notes (only you see these)</label>
          <textarea style={{ ...fieldInput, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <button style={btn('ghost')} onClick={onClose}>Cancel</button>
        <button style={btn('teal', { opacity: busy ? 0.6 : 1 })} disabled={busy} onClick={submit}>
          {busy ? 'Saving…' : 'Save interview'}
        </button>
      </div>
    </Modal>
  )
}

export function toLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const interviewTypeLabel = (t) => ({ virtual: 'Video call', phone: 'Phone call', in_person: 'In person' }[t] ?? t)

export { formatDate }
