import { useState } from 'react'
import Layout from '../../components/Layout'

export default function AuditLogs() {
  const [logs] = useState([
    { id: 1, user: 'Admin', action: 'Approved survivor profile', target: 'Meena K', timestamp: '2025-06-15 10:30 AM', status: 'Success' },
    { id: 2, user: 'Recruiter Co', action: 'Viewed survivor profile', target: 'Priya S', timestamp: '2025-06-15 09:45 AM', status: 'Success' },
    { id: 3, user: 'NGO Partner', action: 'Added new survivor', target: 'Divya R', timestamp: '2025-06-14 04:20 PM', status: 'Success' },
    { id: 4, user: 'Admin', action: 'Exported analytics report', target: 'Q2 Report', timestamp: '2025-06-14 03:15 PM', status: 'Success' },
    { id: 5, user: 'Recruiter Co', action: 'Failed login attempt', target: 'Invalid password', timestamp: '2025-06-13 08:00 PM', status: 'Failed' },
    { id: 6, user: 'Admin', action: 'Disabled user account', target: 'Old Recruiter', timestamp: '2025-06-13 02:30 PM', status: 'Success' },
  ])

  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter)

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📋 Audit Logs
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Track all user activities and system changes</p>
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
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Action</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Target</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{log.user}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{log.action}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{log.target}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>{log.timestamp}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: log.status === 'Success' ? '#D1FAE5' : '#FEE2E2',
                      color: log.status === 'Success' ? '#059669' : '#DC2626',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
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