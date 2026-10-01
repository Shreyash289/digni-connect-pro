import { useRef, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, btn, fieldInput, fieldLabel } from '../../components/ui'
import { supabase } from '../../integrations/supabase/client'
import { useLiveQuery } from '../../lib/live'
import { getMySurvivor, formatDate } from '../../lib/careers'

const BUCKET = 'survivor-documents'
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']

const DOC_TYPES = [
  { value: 'id_proof', label: 'ID Proof', icon: '🆔' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'bgv', label: 'Background Verification', icon: '🛡️' },
  { value: 'resume', label: 'Resume', icon: '📄' },
  { value: 'photo', label: 'Photograph', icon: '📸' },
  { value: 'other', label: 'Other', icon: '📁' },
]
const typeInfo = (v) => DOC_TYPES.find((t) => t.value === v) ?? { value: v, label: v, icon: '📁' }

const STATUS = {
  verified: { label: '✓ Verified', bg: '#D1FAE5', color: '#059669' },
  pending: { label: '⏳ Pending review', bg: '#FEF3C7', color: '#D97706' },
  rejected: { label: '✕ Rejected', bg: '#FEE2E2', color: '#DC2626' },
}

const formatSize = (b) => (b == null ? '' : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

async function loadDocuments() {
  const survivor = await getMySurvivor()
  const { data, error } = await supabase
    .from('survivor_documents')
    .select('id, doc_type, file_name, storage_path, mime_type, size_bytes, status, created_at')
    .eq('survivor_id', survivor.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return { survivorId: survivor.id, documents: data ?? [] }
}

export default function DocumentsVault() {
  const { data, loading, error, reload, live } = useLiveQuery(loadDocuments, { tables: ['survivor_documents'] })
  const [docType, setDocType] = useState('id_proof')
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const fileInput = useRef(null)

  const documents = data?.documents ?? []

  const upload = async (files) => {
    const list = Array.from(files ?? [])
    if (!list.length || !data?.survivorId) return
    setUploadError('')

    const bad = list.find((f) => !ACCEPT.includes(f.type) || f.size > MAX_BYTES)
    if (bad) {
      setUploadError(!ACCEPT.includes(bad.type)
        ? `"${bad.name}" isn't a PDF, JPG or PNG.`
        : `"${bad.name}" is larger than 5 MB.`)
      return
    }

    setUploading(true)
    try {
      for (const file of list) {
        const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(-120)
        const path = `self/${data.survivorId}/${crypto.randomUUID()}-${safeName}`
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
        if (upErr) throw upErr
        const { error: regErr } = await supabase.rpc('register_my_document', {
          _doc_type: docType, _file_name: file.name, _storage_path: path, _mime_type: file.type, _size_bytes: file.size,
        })
        if (regErr) {
          await supabase.storage.from(BUCKET).remove([path])
          throw regErr
        }
      }
      await reload()
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const download = async (doc) => {
    setBusyId(doc.id)
    try {
      const { data: signed, error: err } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60, { download: doc.file_name })
      if (err) throw err
      window.open(signed.signedUrl, '_blank', 'noopener')
    } catch (err) {
      window.alert(err.message || 'Could not download the file.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (doc) => {
    if (!window.confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return
    setBusyId(doc.id)
    try {
      const { data: path, error: err } = await supabase.rpc('delete_my_document', { _document_id: doc.id })
      if (err) throw err
      await supabase.storage.from(BUCKET).remove([path])
      await reload()
    } catch (err) {
      window.alert(err.message || 'Could not delete the document.')
    } finally {
      setBusyId(null)
    }
  }

  const onDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const grouped = DOC_TYPES
    .map((t) => ({ ...t, docs: documents.filter((d) => d.doc_type === t.value) }))
    .concat([{ value: '_unknown', label: 'Other', icon: '📁', docs: documents.filter((d) => !DOC_TYPES.some((t) => t.value === d.doc_type)) }])
    .filter((g) => g.docs.length)

  return (
    <Layout>
      <PageHeader title="📂 Document Vault" subtitle="Upload and manage your documents securely" live={live} />

      <div
        className="card"
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={(e) => { onDrag(e); setDragActive(false); upload(e.dataTransfer.files) }}
        style={{
          padding: 32, textAlign: 'center', marginBottom: 24, transition: 'all 0.2s',
          border: dragActive ? '2px dashed #2563EB' : '2px dashed #E5E7EB',
          background: dragActive ? '#EFF6FF' : '#F9FAFB',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          {uploading ? 'Uploading…' : 'Drag & drop your documents here'}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>or click to browse (PDF, JPG, PNG · max 5 MB)</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={fieldLabel}>Document type</label>
            <select style={{ ...fieldInput, width: 220 }} value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          <button
            style={btn('primary', { padding: '10px 20px', fontSize: 13, opacity: uploading || !data ? 0.6 : 1 })}
            disabled={uploading || !data}
            onClick={() => fileInput.current?.click()}
          >
            Browse Files
          </button>
          <input ref={fileInput} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
            onChange={(e) => upload(e.target.files)} />
        </div>
      </div>

      <ErrorBanner message={uploadError || error} />

      <StatGrid stats={[
        { label: 'Total documents', value: documents.length, color: '#059669', bg: '#F0FDF4' },
        { label: 'Verified', value: documents.filter((d) => d.status === 'verified').length, color: '#2563EB', bg: '#EFF6FF' },
        { label: 'Pending review', value: documents.filter((d) => d.status === 'pending').length, color: '#D97706', bg: '#FEF3C7' },
      ]} />

      {loading ? <Loading /> : grouped.length === 0 ? (
        <EmptyState title="No documents uploaded yet" hint="Upload your ID, certificates or resume. Each one is reviewed and verified before employers rely on it." />
      ) : grouped.map((g) => (
        <div key={g.value} className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #E5E7EB', background: '#F9FAFB' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>{g.icon} {g.label}</h3>
          </div>
          {g.docs.map((doc) => {
            const st = STATUS[doc.status] ?? STATUS.pending
            const busy = busyId === doc.id
            return (
              <div key={doc.id} style={{ padding: '14px 20px', borderBottom: '0.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ fontSize: 24 }}>{typeInfo(doc.doc_type).icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F', wordBreak: 'break-all' }}>{doc.file_name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{[formatSize(doc.size_bytes), `Uploaded ${formatDate(doc.created_at)}`].filter(Boolean).join(' • ')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '4px 10px', background: st.bg, color: st.color, borderRadius: 6, fontSize: 10, fontWeight: 600 }}>{st.label}</span>
                  <button style={btn('ghost')} disabled={busy} onClick={() => download(doc)}>Download</button>
                  <button style={btn('danger')} disabled={busy} onClick={() => remove(doc)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      <div style={{ marginTop: 24, padding: 16, background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: 8 }}>
        <div style={{ fontSize: 12, color: '#1E40AF', fontWeight: 500 }}>🔒 <strong>Private & secure</strong></div>
        <div style={{ fontSize: 11, color: '#1E40AF', marginTop: 4 }}>
          Files are stored in a private bucket. Only you, your NGO partner and CAREVIA admins can open them. Recruiters never see your documents.
        </div>
      </div>
    </Layout>
  )
}
