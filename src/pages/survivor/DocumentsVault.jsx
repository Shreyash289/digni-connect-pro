import { useState } from 'react'
import Layout from '../../components/Layout'

export default function DocumentsVault() {
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      name: 'Aadhaar_Card.pdf',
      type: 'ID Proof',
      uploadDate: '2025-06-01',
      size: '2.4 MB',
      verified: true,
      icon: '🆔'
    },
    {
      id: 'doc-2',
      name: 'Education_Certificate.pdf',
      type: 'Education',
      uploadDate: '2025-06-02',
      size: '1.8 MB',
      verified: true,
      icon: '🎓'
    },
    {
      id: 'doc-3',
      name: 'BGV_Report.pdf',
      type: 'Background Verification',
      uploadDate: '2025-06-05',
      size: '3.1 MB',
      verified: false,
      icon: '✅'
    },
    {
      id: 'doc-4',
      name: 'Resume.pdf',
      type: 'Resume',
      uploadDate: '2025-06-10',
      size: '1.2 MB',
      verified: true,
      icon: '📄'
    }
  ])

  const [dragActive, setDragActive] = useState(false)

  const deleteDocument = (docId) => {
    if (window.confirm('Delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== docId))
      alert('Document deleted')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    // Mock: just show alert
    alert('✅ File uploaded! (Mock)')
    
    // In real app: process file here
  }

  const groupedDocs = {
    'ID Proof': documents.filter(d => d.type === 'ID Proof'),
    'Education': documents.filter(d => d.type === 'Education'),
    'Background Verification': documents.filter(d => d.type === 'Background Verification'),
    'Resume': documents.filter(d => d.type === 'Resume'),
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📂 Document Vault
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Upload and manage your documents securely</p>
      </div>

      {/* Upload Section */}
      <div 
        className="card"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          padding: 40,
          textAlign: 'center',
          border: dragActive ? '2px dashed #2563EB' : '2px dashed #E5E7EB',
          background: dragActive ? '#EFF6FF' : '#F9FAFB',
          cursor: 'pointer',
          transition: 'all 0.3s',
          marginBottom: 24
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          Drag & drop your documents here
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
          or click to browse (PDF, JPG, PNG - Max 5MB)
        </div>
        <button style={{
          padding: '10px 20px',
          background: '#2563EB',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Browse Files
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Total Documents</div>
        </div>
        <div style={{ padding: 16, background: '#EFF6FF', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>
            {documents.filter(d => d.verified).length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Verified</div>
        </div>
        <div style={{ padding: 16, background: '#FEF3C7', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', fontFamily: 'Plus Jakarta Sans' }}>
            {documents.filter(d => !d.verified).length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Pending Review</div>
        </div>
      </div>

      {/* Documents by Category */}
      {Object.entries(groupedDocs).map(([category, docs]) => (
        docs.length > 0 && (
          <div key={category} className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', background: '#F9FAFB' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>
                {docs[0].icon} {category}
              </h3>
            </div>

            <div>
              {docs.map(doc => (
                <div key={doc.id} style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{ fontSize: 24 }}>{doc.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F', marginBottom: 2 }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>
                        {doc.size} • Uploaded {doc.uploadDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {doc.verified && (
                      <div style={{
                        padding: '4px 10px',
                        background: '#D1FAE5',
                        color: '#059669',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        ✓ Verified
                      </div>
                    )}
                    {!doc.verified && (
                      <div style={{
                        padding: '4px 10px',
                        background: '#FEF3C7',
                        color: '#D97706',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        ⏳ Pending
                      </div>
                    )}
                    <button style={{
                      padding: '6px 12px',
                      background: '#F3F4F6',
                      color: '#6B7280',
                      border: '0.5px solid #E5E7EB',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Download
                    </button>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: '0.5px solid #FECACA',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No documents uploaded yet</div>
          <div style={{ fontSize: 12 }}>Upload your documents to share with employers</div>
        </div>
      )}

      {/* Security Notice */}
      <div style={{ marginTop: 24, padding: 16, background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 8 }}>
        <div style={{ fontSize: 12, color: '#1E40AF', fontWeight: 500 }}>
          🔒 <strong>Encrypted & Secure</strong>
        </div>
        <div style={{ fontSize: 11, color: '#1E40AF', marginTop: 4 }}>
          Your documents are encrypted and only visible to you and approved employers. They are never shared without your permission.
        </div>
      </div>
    </Layout>
  )
}