import { useState } from 'react'
import { formatDate, statusInfo } from '../lib/careers'

// Visual language follows the redesign: tokens in styles/theme.css
// (--navy, --royal, --mist, --line, --ink2, pill buttons, rounded cards).

export function LiveBadge({ live }) {
  return (
    <span className="badge" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      background: live ? 'var(--navy)' : 'var(--mist)', color: live ? '#fff' : 'var(--ink2)',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: live ? '#7CE0A6' : 'var(--sky)' }} />
      {live ? 'Live' : 'Connecting…'}
    </span>
  )
}

export function PageHeader({ title, subtitle, live, action }) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          {typeof title === 'string' ? title.replace(/^\p{Extended_Pictographic}️?\s*/u, '') : title}
        </h2>
        {subtitle && <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {live !== undefined && <LiveBadge live={live} />}
        {action}
      </div>
    </div>
  )
}

// Same tile rhythm as the redesigned dashboards: light gradient, navy, white…
const TILE_CLASSES = ['card-light', 'card-dark', 'card']
export function StatTiles({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={TILE_CLASSES[i % TILE_CLASSES.length]}
          onClick={s.onClick}
          style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: s.onClick ? 'pointer' : 'default', minHeight: 104 }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginBottom: 10 }}>{s.label}</div>
          <div style={{ fontSize: 34, fontWeight: 300, lineHeight: 1 }}>{s.value}</div>
          {s.note && <div style={{ fontSize: 11, opacity: 0.8, marginTop: 8 }}>{s.note}</div>}
        </div>
      ))}
    </div>
  )
}
// Kept for existing callers; colour hints are ignored in favour of the redesign's tiles
export const StatGrid = StatTiles

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div style={{ marginBottom: 16, padding: '10px 16px', background: '#FDECEC', border: '1px solid #F7C8C8', borderRadius: 16, fontSize: 13, color: '#B42318' }}>
      {message}
    </div>
  )
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--navy)' }}>{title}</div>
      {hint && <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{hint}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return <div className="card" style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>{label}</div>
}

export function StatusPill({ status }) {
  const s = statusInfo(status)
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

export function Tag({ children }) {
  return <span className="badge" style={{ fontSize: 11 }}>{children}</span>
}

export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,34,80,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}
      onClick={onClose}
    >
      <div className="card" style={{ width, maxWidth: '100%', padding: 28, maxHeight: '88vh', overflowY: 'auto', borderRadius: 'var(--r-card)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12 }}>
          <h3 style={{ fontSize: 18, color: 'var(--navy)', margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" className="btn-soft" style={{ padding: '6px 12px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const fieldLabel = { fontSize: 12, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 6 }
export const fieldInput = {
  width: '100%', padding: '10px 14px', borderRadius: 'var(--r-input)', border: '1px solid var(--line)',
  fontSize: 13, fontFamily: 'var(--font)', boxSizing: 'border-box', background: '#fff', color: 'var(--ink)',
}

// Pill buttons in the redesign palette. Variant names are kept from the
// earlier pages; they now map onto navy / royal / mist / soft-red pills.
export function btn(variant = 'primary', extra = {}) {
  const v = {
    primary: { background: 'var(--navy)', color: '#fff' },
    success: { background: 'var(--royal)', color: '#fff' },
    purple: { background: 'var(--royal)', color: '#fff' },
    teal: { background: 'var(--royal)', color: '#fff' },
    ghost: { background: 'var(--mist)', color: 'var(--ink)' },
    danger: { background: '#FDECEC', color: '#B42318' },
    outlinePurple: { background: 'var(--mist)', color: 'var(--royal)' },
  }[variant] ?? {}
  return {
    padding: '8px 16px', borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font)', border: 0, ...v, ...extra,
  }
}

const initials = (name) =>
  String(name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export function Avatar({ name }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: '50%', background: 'var(--mist)', color: 'var(--navy)', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600,
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
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{c.display_name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
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
              border: `1px solid ${c.is_saved ? 'var(--royal)' : 'var(--line)'}`, background: c.is_saved ? 'var(--mist)' : '#fff'
            }}
          >
            {c.is_saved ? '🔖' : '📌'}
          </button>
        )}
      </div>

      {c.preferred_roles?.length > 0 && (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--royal)', marginBottom: 8 }}>{c.preferred_roles.join(', ')}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {c.skills?.length ? c.skills.slice(0, 6).map((s) => <Tag key={s}>{s}</Tag>) : <span style={{ fontSize: 11, color: '#8A97B5' }}>No skills listed yet</span>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#8A97B5' }}>Profile completeness</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{c.profile_completion ?? 0}%</span>
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
      <span style={{ color: 'var(--ink2)', minWidth: 130 }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--navy)' }}>{value}</span>
    </div>
  )
}

export function CandidateProfileModal({ c, onClose, actions }) {
  const work = Array.isArray(c.work_history) ? c.work_history : []
  const certs = Array.isArray(c.certifications) ? c.certifications : []
  return (
    <Modal title={c.display_name} onClose={onClose} width={560}>
      <div style={{ fontSize: 12, color: '#8A97B5', marginTop: -12, marginBottom: 16 }}>Candidate ID {c.anonymous_id}</div>
      <Row label="Age" value={c.age ? `${c.age} years` : null} />
      <Row label="Location" value={place(c)} />
      <Row label="Preferred roles" value={c.preferred_roles?.join(', ')} />
      <Row label="Education" value={c.education_level} />
      <Row label="Experience" value={c.total_experience} />
      <Row label="Languages" value={c.languages?.join(', ')} />
      <Row label="Certifications" value={certs.map((x) => x?.name).filter(Boolean).join(', ')} />

      {c.bio && (
        <div style={{ margin: '14px 0', fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, background: 'var(--bg)', padding: 12, borderRadius: 8 }}>{c.bio}</div>
      )}

      <div style={{ margin: '16px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--ink2)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {c.skills?.length ? c.skills.map((s) => <Tag key={s}>{s}</Tag>) : <span style={{ fontSize: 12, color: '#8A97B5' }}>None listed</span>}
        </div>
      </div>

      {work.length > 0 && (
        <div style={{ margin: '16px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--ink2)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Work history</div>
          {work.map((w, i) => (
            <div key={i} style={{ fontSize: 13, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{[w.role, w.company].filter(Boolean).join(' · ')}</div>
              {w.description && <div style={{ color: 'var(--ink2)', fontSize: 12 }}>{w.description}</div>}
            </div>
          ))}
        </div>
      )}

      {c.cover_note && (
        <div style={{ margin: '16px 0', padding: 12, background: 'var(--mist)', borderRadius: 8, fontSize: 13, color: 'var(--navy)' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Cover note</div>
          {c.cover_note}
        </div>
      )}

      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>{actions}</div>}

      <div style={{ marginTop: 16, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
        <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>⚠️ Privacy protection active</div>
        <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>
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
      {candidateName && <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: -10, marginBottom: 16 }}>with {candidateName}</div>}
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
