import { useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, ErrorBanner, Loading, Tag, btn, formatDate } from '../../components/ui'
import DocumentReviewList from '../../components/DocumentReviewList'
import { useLiveQuery } from '../../lib/live'
import { getAdminOverview, setNgoStatus, setRecruiterStatus, setSurvivorStatus } from '../../lib/careers'

function Section({ title, subtitle, count, tint = '#FFFBEB', children }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #E5E7EB', background: tint }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>{title}{count !== undefined ? ` (${count})` : ''}</h3>
        {subtitle && <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

const Empty = ({ text }) => <div style={{ padding: 20, fontSize: 13, color: '#9CA3AF' }}>✅ {text}</div>
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '0.5px solid #F3F4F6', flexWrap: 'wrap' }

export default function AdminDashboard() {
  const { data, loading, error, reload, live } = useLiveQuery(getAdminOverview, {
    tables: ['ngos', 'recruiters', 'survivors', 'job_applications', 'survivor_documents'],
  })
  const [busy, setBusy] = useState(null)

  const act = async (key, fn) => {
    setBusy(key)
    try {
      await fn()
      await reload()
    } catch (err) {
      window.alert(err.message || 'Something went wrong.')
    } finally {
      setBusy(null)
    }
  }

  const reject = (key, label, fn) => {
    const reason = window.prompt(`Reason for rejecting ${label}? (shown to them)`, '')
    if (reason === null) return
    act(key, () => fn(reason))
  }

  const actions = (key, onApprove, onReject) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button style={btn('success', { opacity: busy === key ? 0.6 : 1 })} disabled={busy === key} onClick={onApprove}>Approve</button>
      <button style={btn('danger', { opacity: busy === key ? 0.6 : 1 })} disabled={busy === key} onClick={onReject}>Reject</button>
    </div>
  )

  if (loading || !data) {
    return <Layout><PageHeader title="Admin Command Center" live={live} /><ErrorBanner message={error} />{!error && <Loading />}</Layout>
  }

  const { stats, pending_ngos: ngos, pending_recruiters: recruiters, pending_survivors: survivors, top_skills: skills, ngo_partners: partners } = data
  const rate = stats.survivors ? Math.round((stats.placed / stats.survivors) * 100) : 0
  const C = 2 * Math.PI * 40
  const maxSkill = Math.max(1, ...skills.map((s) => s.count))

  return (
    <Layout>
      <PageHeader title="Admin Command Center" subtitle="Platform oversight, approvals and verification" live={live} />
      <ErrorBanner message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Survivors', value: stats.survivors, color: '#2563EB', bg: '#EFF6FF', icon: '👥' },
          { label: 'Placed', value: stats.placed, color: '#059669', bg: '#F0FDF4', icon: '✅' },
          { label: 'Active NGOs', value: stats.active_ngos, color: '#7C3AED', bg: '#F5F3FF', icon: '🤝' },
          { label: 'Recruiters', value: stats.recruiters, color: '#D97706', bg: '#FFFBEB', icon: '🔎' },
          { label: 'Pending reviews', value: stats.pending, color: '#DC2626', bg: '#FEF2F2', icon: '⏳' },
        ].map((m) => (
          <div key={m.label} className="stat-card" style={{ background: m.bg, border: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          <Section title="🤝 NGO registrations" subtitle="Approving an NGO lets it add survivors and verify documents" count={ngos.length}>
            {ngos.length === 0 ? <Empty text="No NGOs waiting for approval." /> : ngos.map((n) => (
              <div key={n.id} style={row}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>{n.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {[n.contact_email, n.contact_phone, [n.city, n.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {n.registration_number ? `Reg. ${n.registration_number} · ` : ''}{n.website ? `${n.website} · ` : ''}submitted {formatDate(n.created_at)}
                  </div>
                  {n.description && <div style={{ fontSize: 12, color: '#374151', marginTop: 4, maxWidth: 520 }}>{n.description}</div>}
                </div>
                {actions(`ngo:${n.id}`,
                  () => act(`ngo:${n.id}`, () => setNgoStatus(n.id, 'approved')),
                  () => reject(`ngo:${n.id}`, n.name, (r) => setNgoStatus(n.id, 'rejected', r)))}
              </div>
            ))}
          </Section>

          <Section title="🔎 Recruiter verification" subtitle="Verified recruiters are marked as trusted employers" count={recruiters.length}>
            {recruiters.length === 0 ? <Empty text="No recruiters waiting for verification." /> : recruiters.map((r) => (
              <div key={r.id} style={row}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>{r.company_name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{[r.email, r.company_website].filter(Boolean).join(' · ')} · joined {formatDate(r.created_at)}</div>
                </div>
                {actions(`rec:${r.id}`,
                  () => act(`rec:${r.id}`, () => setRecruiterStatus(r.id, 'approved')),
                  () => act(`rec:${r.id}`, () => setRecruiterStatus(r.id, 'rejected')))}
              </div>
            ))}
          </Section>

          <Section title="👤 Survivor profiles awaiting verification" count={survivors.length}>
            {survivors.length === 0 ? <Empty text="All survivor profiles reviewed." /> : survivors.map((s) => (
              <div key={s.id} style={row}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>
                    {s.full_name || s.anonymous_id} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>{s.anonymous_id}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {s.ngo_name ?? 'Self-registered'}{s.city || s.state ? ` · ${[s.city, s.state].filter(Boolean).join(', ')}` : ''} · profile {s.profile_completion}%
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>{s.skills.slice(0, 4).map((x) => <Tag key={x}>{x}</Tag>)}</div>
                </div>
                {actions(`sv:${s.id}`,
                  () => act(`sv:${s.id}`, () => setSurvivorStatus(s.id, 'approved')),
                  () => reject(`sv:${s.id}`, 'this profile', (r) => setSurvivorStatus(s.id, 'rejected', r)))}
              </div>
            ))}
          </Section>

          <Section title="📄 Documents awaiting verification" tint="#EFF6FF">
            <DocumentReviewList compact />
          </Section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 14 }}>Placement Rate</h4>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                {rate > 0 && <circle cx="50" cy="50" r="40" fill="none" stroke="#059669" strokeWidth="10" strokeDasharray={`${C * rate / 100} ${C}`} strokeLinecap="round" />}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>{rate}%</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>Placed</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>{stats.placed} of {stats.survivors} survivors employed</div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 12 }}>NGO Partners</h4>
            {partners.length === 0 ? <div style={{ fontSize: 12, color: '#9CA3AF' }}>No approved NGOs yet.</div> : partners.map((n) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 12, borderBottom: '0.5px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0C1F3F' }}>{n.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{n.survivors} survivor{n.survivors === 1 ? '' : 's'}{n.city ? ` · ${n.city}` : ''}</div>
                </div>
                <span style={{ color: '#059669', fontWeight: 600 }}>{n.placed} placed</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 12 }}>Top Survivor Skills</h4>
            {skills.length === 0 ? <div style={{ fontSize: 12, color: '#9CA3AF' }}>No skills recorded yet.</div> : skills.map((s) => (
              <div key={s.skill} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0C1F3F' }}>{s.skill}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{s.count}</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(s.count / maxSkill) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
