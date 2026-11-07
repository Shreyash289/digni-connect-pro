import Layout from '../../components/Layout'
import { PageHeader, ErrorBanner, Loading, StatTiles } from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { getAdminAnalytics, timeAgo } from '../../lib/careers'
import { listAuditLogs, describeAuditAction } from '../../lib/admin'

async function load() {
  const [stats, logs] = await Promise.all([getAdminAnalytics(), listAuditLogs(8)])
  return { stats, logs }
}

const SERIES = [
  { key: 'signups', label: 'Sign-ups', color: 'var(--royal)' },
  { key: 'applications', label: 'Applications', color: 'var(--royal)' },
  { key: 'placements', label: 'Placements', color: 'var(--navy)' },
]

export default function Analytics() {
  const { data, loading, error, live } = useLiveQuery(load, {
    tables: ['audit_logs', 'job_applications', 'jobs', 'user_roles'],
  })

  if (loading || !data) {
    return <Layout><PageHeader title="📊 Analytics" live={live} /><ErrorBanner message={error} />{!error && <Loading />}</Layout>
  }

  const { stats: a, logs } = data
  const monthly = a.monthly ?? []
  const peak = Math.max(1, ...monthly.flatMap((m) => SERIES.map((s) => m[s.key])))
  const roles = [
    { label: 'Survivors', value: a.users_by_role.survivor, color: 'var(--royal)' },
    { label: 'Recruiters', value: a.users_by_role.recruiter, color: 'var(--navy)' },
    { label: 'NGO Partners', value: a.users_by_role.ngo_partner, color: '#D97706' },
    { label: 'Admins', value: a.users_by_role.admin, color: 'var(--royal)' },
    { label: 'No role yet', value: a.users_by_role.none, color: '#8A97B5' },
  ]
  const maxRole = Math.max(1, ...roles.map((r) => r.value))

  return (
    <Layout>
      <PageHeader title="Analytics" subtitle="Platform insights and performance metrics" live={live} />
      <ErrorBanner message={error} />

      <StatTiles stats={[
        { label: 'Total users', value: a.total_users, note: `+${a.new_users_30d} in the last 30 days` },
        { label: 'Placements', value: a.placements, note: `${a.survivors} survivors on the platform` },
        { label: 'Active jobs', value: a.active_jobs, note: `${a.applications} applications in total` },
        { label: 'Hire rate', value: `${a.hire_rate}%`, note: `${a.interviews} interviews held or scheduled` },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>📈 Last 6 months</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {SERIES.map((s) => (
                <span key={s.key} style={{ fontSize: 11, color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
            {monthly.map((m) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
                  {SERIES.map((s) => (
                    <div key={s.key} title={`${m.month} · ${s.label}: ${m[s.key]}`}
                      style={{ width: '28%', height: `${(m[s.key] / peak) * 100}%`, minHeight: m[s.key] ? 3 : 0, background: s.color, borderRadius: '3px 3px 0 0' }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#8A97B5', marginTop: 6 }}>{m.month.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>👥 Users by role</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {roles.map((r) => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{r.value}</span>
                </div>
                <div style={{ height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(r.value / maxRole) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>🔔 Recent activity</div>
        {logs.length === 0 ? <div style={{ fontSize: 13, color: '#8A97B5' }}>No activity recorded yet.</div> : (
          <div style={{ display: 'grid', gap: 10 }}>
            {logs.map((l) => (
              <div key={l.id} style={{ padding: 12, background: 'var(--bg)', borderRadius: 6, borderLeft: `3px solid ${l.status === 'failed' ? '#DC2626' : 'var(--royal)'}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>
                  {l.actor_name} — {describeAuditAction(l)}{l.target_label ? `: ${l.target_label}` : ''}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 2 }}>{timeAgo(l.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
