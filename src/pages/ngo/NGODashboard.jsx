import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ErrorBanner, Modal, Tag, PageHeader, StatTiles } from '../../components/ui'
import { NgoGate, OrgForm, SurvivorFormModal } from '../../components/ngo'
import { useLiveQuery } from '../../lib/live'
import { listNgoSurvivors, JOURNEY, journeyStage, SURVIVOR_STATUS } from '../../lib/careers'

export default function NGODashboard() {
  return (
    <Layout>
      <NgoGate>{(org, reloadOrg) => <Dashboard org={org} reloadOrg={reloadOrg} />}</NgoGate>
    </Layout>
  )
}

const stageOf = (s) => journeyStage({
  completion: s.profile_completion, applications: s.applications, interviews: s.interviews, offers: s.offers, hired: s.hired,
})

function Dashboard({ org, reloadOrg }) {
  const navigate = useNavigate()
  const { data, loading, error, reload, live } = useLiveQuery(listNgoSurvivors, {
    tables: ['survivors', 'job_applications', 'interviews', 'survivor_documents'],
  })
  const [adding, setAdding] = useState(false)
  const [editingOrg, setEditingOrg] = useState(false)

  const survivors = data ?? []
  const placed = survivors.filter((s) => s.hired > 0).length
  const inProgress = survivors.filter((s) => !s.hired && (s.applications > 0 || s.interviews > 0)).length
  const pendingDocs = survivors.reduce((n, s) => n + s.pending_documents, 0)
  const awaitingReview = survivors.filter((s) => ['submitted', 'under_review'].includes(s.status)).length
  const rate = survivors.length ? Math.round((placed / survivors.length) * 100) : 0
  const C = 2 * Math.PI * 40

  return (
    <>
      <PageHeader
        title="NGO dashboard"
        subtitle={<>{org.name}{org.city || org.state ? ` · ${[org.city, org.state].filter(Boolean).join(', ')}` : ''} · <span className="badge">✓ Verified partner</span></>}
        live={live}
        action={<button className="btn-pill" onClick={() => setAdding(true)}>+ Add survivor</button>}
      />

      <ErrorBanner message={error} />

      <StatTiles stats={[
        { label: 'Total survivors', value: survivors.length, onClick: () => navigate('/ngo/survivors') },
        { label: 'Successfully placed', value: placed, onClick: () => navigate('/ngo/progress') },
        { label: 'In progress', value: inProgress, onClick: () => navigate('/ngo/progress') },
        { label: 'Documents to verify', value: pendingDocs, onClick: () => navigate('/ngo/documents') },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>My Survivors</h3>
            <Link to="/ngo/survivors" style={{ fontSize: 13, color: 'var(--royal)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <div style={{ padding: 24, fontSize: 13, color: 'var(--ink2)' }}>Loading…</div> : survivors.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8A97B5', fontSize: 13 }}>
              No survivors yet. <span style={{ color: 'var(--royal)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAdding(true)}>Add your first survivor →</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Name', 'Skills', 'Stage', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {survivors.slice(0, 6).map((s) => {
                    const stage = stageOf(s)
                    const st = SURVIVOR_STATUS[s.status] ?? SURVIVOR_STATUS.submitted
                    return (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--mist)' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)' }}>{s.full_name || s.anonymous_id}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{[s.city, s.state].filter(Boolean).join(', ') || '—'}</div>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(s.skills ?? []).slice(0, 2).map((x) => <Tag key={x}>{x}</Tag>)}
                            {!(s.skills ?? []).length && <span style={{ fontSize: 11, color: '#8A97B5' }}>—</span>}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12 }}>
                          <span style={{ fontWeight: 600, color: 'var(--royal)' }}>Stage {stage}</span>
                          <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{JOURNEY[stage - 1]}</div>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ padding: '3px 9px', background: st.bg, color: st.color, borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>Placement Rate</h4>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line)" strokeWidth="10" />
                {rate > 0 && <circle cx="50" cy="50" r="40" fill="none" stroke="var(--navy)" strokeWidth="10" strokeDasharray={`${C * rate / 100} ${C}`} strokeLinecap="round" />}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', }}>{rate}%</div>
                <div style={{ fontSize: 10, color: 'var(--ink2)' }}>Placed</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', textAlign: 'center' }}>{placed} of {survivors.length} survivors employed</div>
            {awaitingReview > 0 && (
              <div style={{ fontSize: 11, color: '#D97706', textAlign: 'center', marginTop: 8 }}>{awaitingReview} profile{awaitingReview > 1 ? 's' : ''} awaiting CAREVIA verification</div>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Quick Actions</h4>
            {[
              { icon: '➕', label: 'Add new survivor', action: () => setAdding(true) },
              { icon: '📄', label: `Verify documents${pendingDocs ? ` (${pendingDocs})` : ''}`, action: () => navigate('/ngo/documents') },
              { icon: '📈', label: 'Track progress', action: () => navigate('/ngo/progress') },
              { icon: '🏢', label: 'Edit organisation details', action: () => setEditingOrg(true) },
            ].map((a) => (
              <div key={a.label} onClick={a.action} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--mist)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {adding && <SurvivorFormModal onClose={() => setAdding(false)} onSaved={reload} />}
      {editingOrg && (
        <Modal title="Organisation details" onClose={() => setEditingOrg(false)} width={640}>
          <OrgForm org={org} onCancel={() => setEditingOrg(false)} onSaved={() => { setEditingOrg(false); reloadOrg() }} />
        </Modal>
      )}
    </>
  )
}
