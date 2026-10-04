import { useState } from 'react'
import Layout from '../../components/Layout'

export default function DocumentVerification() {
  const [documents, setDocuments] = useState([
    { id: 1, survivor: 'Meena Rajeshwari', type: 'Aadhaar Verification', status: 'Verified', date: '2025-06-01', size: '2.4 MB' },
    { id: 2, survivor: 'Priya Sundaram', type: 'Education Certificate', status: 'Pending', date: '2025-06-05', size: '1.8 MB' },
    { id: 3, survivor: 'Divya Kumar', type: 'Background Check Report', status: 'Rejected', date: '2025-06-03', size: '3.1 MB' },
  ])

  const [selectedDoc, setSelectedDoc] = useState(null)

  const verifyDoc = (id) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, status: 'Verified' } : d))
  }

  const rejectDoc = (id) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, status: 'Rejected' } : d))
  }

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Document verification
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Review, authenticate, and approve candidate identity and credential submissions
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Document list card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              Submitted verification queue
            </h3>
            <span className="badge">
              {documents.length} submissions
            </span>
          </div>

          <div>
            {documents.map(doc => (
              <div
                key={doc.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                  background: selectedDoc?.id === doc.id ? 'var(--mist)' : 'transparent'
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                    {doc.survivor}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                    {doc.type} · {doc.size} · Uploaded on {doc.date}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    className="badge"
                    style={{
                      background: doc.status === 'Verified' ? 'var(--navy)' : 'var(--mist)',
                      color: doc.status === 'Verified' ? '#ffffff' : 'var(--navy)'
                    }}
                  >
                    {doc.status}
                  </span>

                  <button
                    className="btn-soft"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    Preview
                  </button>

                  {doc.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-pill"
                        style={{ padding: '8px 16px', fontSize: 12 }}
                        onClick={() => verifyDoc(doc.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-soft"
                        onClick={() => rejectDoc(doc.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Preview Area */}
        {selectedDoc && (
          <div
            className="card"
            style={{
              borderRadius: '20px',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ color: 'var(--navy)', marginBottom: 4 }}>
                    {selectedDoc.type}
                  </h3>
                  <p style={{ color: 'var(--ink2)', fontSize: 13, margin: 0 }}>
                    Candidate: {selectedDoc.survivor}
                  </p>
                </div>
                <button
                  className="btn-soft"
                  onClick={() => setSelectedDoc(null)}
                  style={{ padding: '6px 12px' }}
                >
                  ✕
                </button>
              </div>

              {/* Preview Box */}
              <div
                style={{
                  height: 240,
                  borderRadius: '20px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  padding: 20,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
                  {selectedDoc.type} Document
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                  Encrypted secure file preview ({selectedDoc.size})
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 20 }}>
                Verification Status: <strong style={{ color: 'var(--navy)' }}>{selectedDoc.status}</strong> · Submitted: {selectedDoc.date}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <button
                className="btn-pill"
                style={{ flex: 1 }}
                onClick={() => {
                  verifyDoc(selectedDoc.id)
                  setSelectedDoc({ ...selectedDoc, status: 'Verified' })
                }}
              >
                Approve
              </button>
              <button
                className="btn-soft"
                onClick={() => {
                  rejectDoc(selectedDoc.id)
                  setSelectedDoc({ ...selectedDoc, status: 'Rejected' })
                }}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}