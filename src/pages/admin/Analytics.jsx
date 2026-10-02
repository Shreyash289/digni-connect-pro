import Layout from '../../components/Layout'
import { PageHeader, ErrorBanner, Loading } from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { getAdminAnalytics, timeAgo } from '../../lib/careers'
import { listAuditLogs, describeAuditAction } from '../../lib/admin'

async function load() {
  const [stats, logs] = await Promise.all([getAdminAnalytics(), listAuditLogs(8)])
  return { stats, logs }
}

const SERIES = [
  { key: 'signups', label: 'Sign-ups', color: '#2563EB' },
  { key: 'applications', label: 'Applications', color: '#0D9488' },
  { key: 'placements', label: 'Placements', color: '#059669' },
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
    { label: 'Survivors', value: a.users_by_role.survivor, color: '#2563EB' },
    { label: 'Recruiters', value: a.users_by_role.recruiter, color: '#059669' },
    { label: 'NGO Partners', value: a.users_by_role.ngo_partner, color: '#D97706' },
    { label: 'Admins', value: a.users_by_role.admin, color: '#7C3AED' },
    { label: 'No role yet', value: a.users_by_role.none, color: '#9CA3AF' },
  ]
  const maxRole = Math.max(1, ...roles.map((r) => r.value))

  return (
    <Layout>
      <PageHeader title="📊 Analytics" subtitle="Platform insights and performance metrics" live={live} />
      <ErrorBanner message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: a.total_users, sub: `+${a.new_users_30d} in the last 30 days`, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Placements', value: a.placements, sub: `${a.survivors} survivors on the platform`, color: '#059669', bg: '#F0FDF4' },
          { label: 'Active Jobs', value: a.active_jobs, sub: `${a.applications} applications in total`, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Hire Rate', value: `${a.hire_rate}%`, sub: `${a.interviews} interviews held or scheduled`, color: '#7C3AED', bg: '#F5F3FF' },
        ].map((k) => (
          <div key={k.label} style={{ padding: 16, background: k.bg, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, fontFamily: 'Plus Jakarta Sans' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F' }}>📈 Last 6 months</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {SERIES.map((s) => (
                <span key={s.key} style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 6 }}>{m.month.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 16 }}>👥 Users by role</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {roles.map((r) => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0C1F3F' }}>{r.value}</span>
                </div>
                <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(r.value / maxRole) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 16 }}>🔔 Recent activity</div>
        {logs.length === 0 ? <div style={{ fontSize: 13, color: '#9CA3AF' }}>No activity recorded yet.</div> : (
          <div style={{ display: 'grid', gap: 10 }}>
            {logs.map((l) => (
              <div key={l.id} style={{ padding: 12, background: '#F9FAFB', borderRadius: 6, borderLeft: `3px solid ${l.status === 'failed' ? '#DC2626' : '#2563EB'}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1F3F' }}>
                  {l.actor_name} — {describeAuditAction(l)}{l.target_label ? `: ${l.target_label}` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{timeAgo(l.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
