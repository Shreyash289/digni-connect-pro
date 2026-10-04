import { useState } from 'react'
import Layout from '../../components/Layout'

export default function AuditLogs() {
  const [logs] = useState([
    { id: 1, user: 'Admin System', action: 'Approved survivor profile', target: 'Meena Rajeshwari', timestamp: '2025-06-15 10:30 AM', status: 'Success' },
    { id: 2, user: 'Recruiter Co', action: 'Viewed candidate profile', target: 'Priya Sundaram', timestamp: '2025-06-15 09:45 AM', status: 'Success' },
    { id: 3, user: 'Asha Foundation', action: 'Added candidate intake', target: 'Divya Kumar', timestamp: '2025-06-14 04:20 PM', status: 'Success' },
    { id: 4, user: 'Admin System', action: 'Exported quarterly report', target: 'Q2 Compliance Summary', timestamp: '2025-06-14 03:15 PM', status: 'Success' },
    { id: 5, user: 'Recruiter Co', action: 'Authentication attempt', target: 'Session token validation', timestamp: '2025-06-13 08:00 PM', status: 'Failed' },
    { id: 6, user: 'Admin System', action: 'Updated security permissions', target: 'Recruiter role policy', timestamp: '2025-06-13 02:30 PM', status: 'Success' },
  ])

  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter)

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          System audit logs
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Immutable compliance record of user actions, verifications, and system events
        </p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
            Filter by status:
          </label>
          <select 
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: 200, cursor: 'pointer' }}
          >
            <option value="all">All activities</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Compact table inside .card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>
            Activity audit record
          </h3>
          <span className="badge">
            {filtered.length} entries
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--navy)' }}>Actor</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--navy)' }}>Event Action</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--navy)' }}>Target Resource</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--navy)' }}>Timestamp</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--navy)' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--navy)' }}>{log.user}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--ink)' }}>{log.action}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--ink)' }}>{log.target}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--ink2)' }}>{log.timestamp}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      className="badge"
                      style={{
                        background: log.status === 'Success' ? 'var(--mist)' : 'var(--mist)',
                        color: log.status === 'Success' ? 'var(--navy)' : 'var(--ink2)'
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}