import { useState } from 'react'
import Layout from '../../components/Layout'

export default function DocumentVerification() {
  const [documents, setDocuments] = useState([
    { id: 1, survivor: 'Meena K', type: 'Aadhaar', status: 'Verified', date: '2025-06-01' },
    { id: 2, survivor: 'Priya S', type: 'Certificate', status: 'Pending', date: '2025-06-05' },
    { id: 3, survivor: 'Divya R', type: 'Resume', status: 'Rejected', date: '2025-06-03' },
  ])

  const verifyDoc = (id) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, status: 'Verified' } : d))
  }

  const rejectDoc = (id) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, status: 'Rejected' } : d))
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📄 Document Verification
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Review and verify survivor documents</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Survivor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Document</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{doc.survivor}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{doc.type}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: doc.status === 'Verified' ? '#D1FAE5' : doc.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                      color: doc.status === 'Verified' ? '#059669' : doc.status === 'Pending' ? '#D97706' : '#DC2626',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{doc.date}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {doc.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => verifyDoc(doc.id)} style={{
                          padding: '6px 10px',
                          background: '#D1FAE5',
                          color: '#059669',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>✓ Verify</button>
                        <button onClick={() => rejectDoc(doc.id)} style={{
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
                      <span style={{ fontSize: 11, color: doc.status === 'Verified' ? '#059669' : '#DC2626', fontWeight: 600 }}>
                        {doc.status === 'Verified' ? '✓ Verified' : '✕ Rejected'}
                      </span>
                    )}
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