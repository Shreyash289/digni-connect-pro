import { useState } from 'react'
import Layout from '../../components/Layout'

export default function ManageSurvivors() {
  const [survivors, setSurvivors] = useState([])

  const approveSurvivor = (id) => {
    setSurvivors(survivors.map(s => s.id === id ? { ...s, status: 'Approved' } : s))
  }

  const rejectSurvivor = (id) => {
    setSurvivors(survivors.filter(s => s.id !== id))
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          👥 Manage Survivors
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Review and approve survivor registrations</p>
      </div>

      <button style={{ 
        marginBottom: 20,
        padding: '12px 20px', 
        background: '#EFF6FF', 
        border: '0.5px solid #BFDBFE', 
        borderRadius: 8, 
        cursor: 'pointer', 
        fontSize: 13, 
        fontWeight: 600, 
        color: '#2563EB' 
      }} onClick={() => alert('Add survivor form - backend integration needed')}>
        ➕ Add New Survivor
      </button>

      {survivors.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No survivors to manage</div>
          <div style={{ fontSize: 12 }}>Add new survivors to see them here</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {survivors.map(survivor => (
                  <tr key={survivor.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{survivor.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{survivor.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: survivor.status === 'Approved' ? '#D1FAE5' : '#FEF3C7',
                        color: survivor.status === 'Approved' ? '#059669' : '#D97706',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        {survivor.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {survivor.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => approveSurvivor(survivor.id)} style={{
                            padding: '6px 10px',
                            background: '#D1FAE5',
                            color: '#059669',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}>✓ Approve</button>
                          <button onClick={() => rejectSurvivor(survivor.id)} style={{
                            padding: '6px 10px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}>✕ Reject</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}