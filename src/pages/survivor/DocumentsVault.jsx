import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { resumeService } from '../../services/resumeService'
import { supabase } from '../../integrations/supabase/client'

export default function DocumentsVault() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const userEmail = localStorage.getItem('email') || ''
  const isDemoUser = !userId || userEmail.includes('demo')

  // Existing documents state
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      name: 'Aadhaar_Card_Verification.pdf',
      type: 'Government ID',
      uploadDate: '2025-06-01',
      size: '2.4 MB',
      verified: true
    },
    {
      id: 'doc-2',
      name: 'Class10_Certificate.pdf',
      type: 'Education Proof',
      uploadDate: '2025-06-02',
      size: '1.8 MB',
      verified: true
    },
    {
      id: 'doc-3',
      name: 'NGO_Verification_Letter.pdf',
      type: 'Support Verification',
      uploadDate: '2025-06-05',
      size: '3.1 MB',
      verified: false
    },
    {
      id: 'doc-4',
      name: 'Resume_Meena_Rajeshwari.pdf',
      type: 'Resume',
      uploadDate: '2025-06-10',
      size: '1.2 MB',
      verified: true
    }
  ])

  const [dragActive, setDragActive] = useState(false)

  // Resume section state
  const [uploadedResumes, setUploadedResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeNotice, setResumeNotice] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (userId && !isDemoUser) {
      fetchResumes(userId)
    }
  }, [userId, isDemoUser])

  const fetchResumes = async (uid) => {
    setLoadingResumes(true)
    const { data, error, unavailable } = await resumeService.listResumes(uid)
    if (unavailable) {
      console.warn('Resume table unavailable')
    } else if (error) {
      console.warn('Error fetching resumes:', error)
    } else if (data) {
      setUploadedResumes(data)
    }
    setLoadingResumes(false)
  }

  // Existing document handlers
  const deleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to remove this document?')) {
      setDocuments(documents.filter((doc) => doc.id !== docId))
      alert('Document removed')
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
    alert('File upload received (demo)')
  }

  // Resume File Selection & Validation
  const handleResumeFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeNotice(null)
    const validExtensions = ['.pdf', '.doc', '.docx']
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(fileExt)) {
      setResumeNotice({
        type: 'error',
        text: 'Invalid file format. Please upload a PDF, DOC, or DOCX file.'
      })
      setSelectedFile(null)
      return
    }

    // 10MB file size limit
    if (file.size > 10 * 1024 * 1024) {
      setResumeNotice({
        type: 'error',
        text: 'File size exceeds limit (10 MB maximum).'
      })
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  // Resume Upload Handler
  const handleUploadResume = async () => {
    if (!selectedFile) return

    if (isDemoUser) {
      setResumeNotice({
        type: 'info',
        text: 'Sign in with your account to save files online. You can also build your resume with the online builder.'
      })
      return
    }

    setUploadingResume(true)
    setResumeNotice(null)

    const path = `${userId}/${Date.now()}_${selectedFile.name}`
    const { data: uploadData, error: uploadErr, unavailable: uploadUnavailable } =
      await resumeService.uploadResumeDocument(selectedFile, path)

    if (uploadUnavailable) {
      setResumeNotice({
        type: 'warning',
        text: 'Storage service for resume uploads is currently unavailable on the backend.'
      })
      setUploadingResume(false)
      return
    }

    if (uploadErr) {
      setResumeNotice({
        type: 'error',
        text: `Upload failed: ${uploadErr}`
      })
      setUploadingResume(false)
      return
    }

    // Record header in database if supported
    await resumeService.saveResume({
      survivor_id: userId,
      title: selectedFile.name,
      file_path: uploadData?.path || path,
      updated_at: new Date().toISOString()
    })

    setResumeNotice({
      type: 'success',
      text: 'Resume successfully uploaded!'
    })
    setSelectedFile(null)
    setUploadingResume(false)

    // Refresh resume list
    fetchResumes(userId)
  }

  const getResumeUrl = (filePath) => {
    if (!filePath) return null
    try {
      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath)
      return data?.publicUrl || null
    } catch {
      return null
    }
  }

  const statItems = [
    { label: 'Total files in vault', value: documents.length },
    { label: 'Verified by partner', value: documents.filter((d) => d.verified).length },
    { label: 'Pending review', value: documents.filter((d) => !d.verified).length }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>Documents vault</h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Encrypted, role-verified storage for identity proofs, credentials, and resumes
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        {statItems.map((stat, idx) => {
          const cardClass = idx === 0 ? 'card-light' : idx % 2 === 1 ? 'card-dark' : 'card'
          return (
            <div key={stat.label} className={cardClass} style={{ padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 12 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 40, fontWeight: 300, lineHeight: 1 }}>{stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Dedicated Resume Management Section */}
      <div className="card" style={{ padding: 28, marginBottom: 28, borderLeft: '4px solid var(--navy)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h3 style={{ color: 'var(--navy)', margin: '0 0 4px 0', fontSize: 18 }}>
              Resumes & CVs
            </h3>
            <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
              Manage your career documents, upload existing PDFs, or build a professional resume online.
            </p>
          </div>

          <button
            onClick={() => navigate('/survivor/resume')}
            className="btn-primary"
            style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create or Edit Resume
          </button>
        </div>

        {/* Upload Resume Form */}
        <div
          style={{
            background: 'var(--mist)',
            borderRadius: 'var(--r-card)',
            padding: 20,
            marginBottom: 20
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>
            Upload Resume File
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 14 }}>
            Supported formats: PDF, DOC, DOCX (up to 10 MB)
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeFileSelect}
              style={{ display: 'none' }}
              id="resume-file-input"
            />
            <label
              htmlFor="resume-file-input"
              className="btn-soft"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Choose File
            </label>

            <span style={{ fontSize: 13, color: selectedFile ? 'var(--navy)' : 'var(--ink2)', fontWeight: selectedFile ? 500 : 400 }}>
              {selectedFile ? selectedFile.name : 'No file selected'}
            </span>

            {selectedFile && (
              <button
                onClick={handleUploadResume}
                disabled={uploadingResume}
                className="btn-pill"
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </button>
            )}
          </div>

          {/* Resume Upload Banners */}
          {resumeNotice && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 'var(--r-subtle)',
                fontSize: 13,
                background:
                  resumeNotice.type === 'error'
                    ? '#fff5f5'
                    : resumeNotice.type === 'success'
                    ? '#f0fff4'
                    : resumeNotice.type === 'warning'
                    ? '#fffaf0'
                    : '#edf2f7',
                color:
                  resumeNotice.type === 'error'
                    ? '#c53030'
                    : resumeNotice.type === 'success'
                    ? '#276749'
                    : resumeNotice.type === 'warning'
                    ? '#9c4221'
                    : 'var(--navy)'
              }}
            >
              {resumeNotice.text}
            </div>
          )}
        </div>

        {/* Uploaded Resumes List */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>
            Uploaded Resumes
          </div>

          {loadingResumes ? (
            <div style={{ fontSize: 13, color: 'var(--ink2)', padding: 12 }}>
              Loading resumes...
            </div>
          ) : uploadedResumes.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                border: '1px dashed var(--line)',
                borderRadius: 'var(--r-card)',
                background: '#ffffff'
              }}
            >
              <p style={{ color: 'var(--ink2)', fontSize: 14, margin: '0 0 12px 0' }}>
                No resumes uploaded yet.
              </p>
              <Link
                to="/survivor/resume"
                className="btn-soft"
                style={{ textDecoration: 'none', display: 'inline-flex', padding: '8px 16px', fontSize: 13 }}
              >
                Build your resume
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {uploadedResumes.map((res, index) => {
                const isLatest = index === 0
                const fileUrl = getResumeUrl(res.file_path)

                return (
                  <div
                    key={res.id || index}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--r-card)',
                      border: '1px solid var(--line)',
                      background: isLatest ? 'var(--mist)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>
                          {res.title || res.file_path || 'Uploaded Resume'}
                        </span>
                        {isLatest && (
                          <span
                            className="badge"
                            style={{ background: 'var(--navy)', color: '#ffffff', fontSize: 11 }}
                          >
                            Latest Resume
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                        Uploaded {res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-soft"
                          style={{ textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}
                        >
                          View / Download
                        </a>
                      ) : (
                        <button
                          disabled
                          className="btn-soft"
                          style={{ fontSize: 12, padding: '6px 12px', opacity: 0.6, cursor: 'not-allowed' }}
                          title="File URL unavailable"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drag & drop upload area for identity & general docs */}
      <div
        className="card"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          padding: 36,
          textAlign: 'center',
          border: dragActive ? '2px dashed var(--royal)' : '1px dashed var(--line)',
          background: dragActive ? 'var(--mist)' : 'var(--card)',
          cursor: 'pointer',
          marginBottom: 28
        }}
      >
        <h3 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Upload new verification document
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 18 }}>
          Drag and drop files here or click to browse (PDF, PNG, JPG up to 5MB)
        </p>
        <button className="btn-pill" onClick={() => alert('Browse files demo triggered')}>
          Browse files
        </button>
      </div>

      {/* Stored Documents List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>Stored documents</h3>
          <span className="badge">{documents.length} files</span>
        </div>

        {documents.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>No documents uploaded</h3>
            <p style={{ color: 'var(--ink2)', fontSize: 14, marginBottom: 20 }}>
              Upload your identification documents to proceed with profile verification.
            </p>
            <button className="btn-pill" onClick={() => alert('Browse files demo triggered')}>
              Upload document
            </button>
          </div>
        ) : (
          <div>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--navy)',
                      marginBottom: 2
                    }}
                  >
                    {doc.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                    {doc.type} · {doc.size} · Uploaded on {doc.uploadDate}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    className="badge"
                    style={{
                      background: doc.verified ? 'var(--navy)' : 'var(--mist)',
                      color: doc.verified ? '#ffffff' : 'var(--navy)'
                    }}
                  >
                    {doc.verified ? 'Verified' : 'Pending review'}
                  </span>
                  <button className="btn-soft" onClick={() => alert(`Downloading ${doc.name}`)}>
                    Download
                  </button>
                  <button className="btn-soft" onClick={() => deleteDocument(doc.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}