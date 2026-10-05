import { useCallback, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, fieldInput } from '../../components/ui'
import { listAuditLogs, subscribeToTables, describeAuditAction, formatDateTime } from '../../lib/admin'

const th = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [live, setLive] = useState(false)

  const load = useCallback(async () => {
    try {
      setLogs(await listAuditLogs(500))
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load audit logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    return subscribeToTables('admin-audit-logs', ['audit_logs'], load,
      (status) => setLive(status === 'SUBSCRIBED'))
  }, [load])

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.status === filter)

  return (
    <Layout>
      <PageHeader title="Audit logs" subtitle="Track all user activities and system changes" live={live} />

      {/* Filter */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...fieldInput, width: 'auto' }}>
          <option value="all">All Activities</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 999, fontSize: 13, color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                <th style={th}>User</th>
                <th style={th}>Action</th>
                <th style={th}>Target</th>
                <th style={th}>Timestamp</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>Loading activity…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink2)' }}>No activity recorded yet.</td></tr>
              )}
              {filtered.map((log) => {
                const ok = log.status !== 'failed'
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                      {log.actor_name}
                      {log.actor_email && log.actor_email !== log.actor_name && (
                        <div style={{ fontSize: 11, fontWeight: 400, color: '#8A97B5' }}>{log.actor_email}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink2)' }}>{describeAuditAction(log)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink2)' }}>{log.target_label ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink2)' }}>{formatDateTime(log.created_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: ok ? 'var(--mist)' : '#FEE2E2',
                        color: ok ? 'var(--navy)' : '#DC2626',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        {ok ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
