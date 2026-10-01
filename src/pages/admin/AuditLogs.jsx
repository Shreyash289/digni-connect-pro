import { useCallback, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { LiveBadge } from './UserManagement'
import { listAuditLogs, subscribeToTables, describeAuditAction, formatDateTime } from '../../lib/admin'

const th = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }

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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
            📋 Audit Logs
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Track all user activities and system changes</p>
        </div>
        <LiveBadge live={live} />
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '0.5px solid #E5E7EB',
          fontSize: 13,
          fontFamily: 'Inter'
        }}>
          <option value="all">All Activities</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={th}>User</th>
                <th style={th}>Action</th>
                <th style={th}>Target</th>
                <th style={th}>Timestamp</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>Loading activity…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>No activity recorded yet.</td></tr>
              )}
              {filtered.map((log) => {
                const ok = log.status !== 'failed'
                return (
                  <tr key={log.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>
                      {log.actor_name}
                      {log.actor_email && log.actor_email !== log.actor_name && (
                        <div style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>{log.actor_email}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{describeAuditAction(log)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{log.target_label ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>{formatDateTime(log.created_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: ok ? '#D1FAE5' : '#FEE2E2',
                        color: ok ? '#059669' : '#DC2626',
                        borderRadius: 6,
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
