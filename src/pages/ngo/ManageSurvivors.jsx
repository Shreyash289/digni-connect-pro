import { useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, ErrorBanner, EmptyState, Loading, Tag, btn, fieldInput, formatDate } from '../../components/ui'
import { NgoGate, SurvivorFormModal } from '../../components/ngo'
import { useLiveQuery } from '../../lib/live'
import { listNgoSurvivors, SURVIVOR_STATUS } from '../../lib/careers'

export default function ManageSurvivors() {
  return (
    <Layout>
      <NgoGate>{() => <SurvivorList />}</NgoGate>
    </Layout>
  )
}

function SurvivorList() {
  const { data, loading, error, reload, live } = useLiveQuery(listNgoSurvivors, {
    tables: ['survivors', 'job_applications', 'survivor_documents'],
  })
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null) // null | 'new' | survivor

  const survivors = data ?? []
  const q = query.trim().toLowerCase()
  const filtered = survivors.filter((s) =>
    (statusFilter === 'all' || s.status === statusFilter) &&
    (!q || [s.full_name, s.anonymous_id, s.city, s.state, ...(s.skills ?? [])].some((v) => v?.toLowerCase().includes(q))))

  return (
    <>
      <PageHeader
        title="👥 Manage Survivors"
        subtitle="Add the survivors your organisation supports and keep their profiles up to date"
        live={live}
        action={<button style={btn('primary', { padding: '9px 16px', fontSize: 13 })} onClick={() => setEditing('new')}>➕ Add New Survivor</button>}
      />

      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input style={{ ...fieldInput, flex: '1 1 240px' }} placeholder="🔍  Search by name, ID, city or skill" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={{ ...fieldInput, width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(SURVIVOR_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState
          title={survivors.length ? 'No survivors match this filter' : 'No survivors added yet'}
          hint={survivors.length ? null : 'Add the survivors your organisation supports. CAREVIA verifies each profile.'}
          action={!survivors.length && <button style={btn('primary')} onClick={() => setEditing('new')}>Add a survivor</button>}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                  {['Name', 'Skills', 'Profile', 'Recruiters', 'Activity', 'Status', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const st = SURVIVOR_STATUS[s.status] ?? SURVIVOR_STATUS.submitted
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{s.full_name || '—'}</div>
                        <div style={{ fontSize: 11, color: '#8A97B5' }}>{s.anonymous_id} · added {formatDate(s.created_at)}{s.has_login ? ' · has own login' : ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 220 }}>
                          {(s.skills ?? []).slice(0, 3).map((x) => <Tag key={x}>{x}</Tag>)}
                          {!(s.skills ?? []).length && <span style={{ fontSize: 11, color: '#8A97B5' }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', minWidth: 110 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{s.profile_completion}%</div>
                        <div className="progress-track" style={{ height: 4 }}><div className="progress-fill" style={{ width: `${s.profile_completion}%` }} /></div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: s.consent_share_with_recruiters ? 'var(--navy)' : '#8A97B5' }}>
                        {s.consent_share_with_recruiters ? '✓ Visible' : 'Hidden'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>
                        {s.applications} applied · {s.interviews} interviews
                        {s.pending_documents > 0 && <div style={{ color: '#D97706' }}>{s.pending_documents} doc(s) to verify</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', background: st.bg, color: st.color, borderRadius: 6, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{st.label}</span>
                        {s.status === 'rejected' && s.rejection_reason && (
                          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4, maxWidth: 180 }}>{s.rejection_reason}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button style={btn('ghost')} onClick={() => setEditing(s)}>Edit</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <SurvivorFormModal survivor={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />
      )}
    </>
  )
}
