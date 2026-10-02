import { useState } from 'react'
import { PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, btn, fieldInput, formatDate } from './ui'
import { useLiveQuery } from '../lib/live'
import { listReviewableDocuments, reviewDocument, openDocument, DOC_STATUS, DOC_TYPES } from '../lib/careers'

const th = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }

// Shared by NGO "Document Verification" and the admin dashboard.
// The RPC returns only the documents the current user may review.
export default function DocumentReviewList({ title = '📄 Document Verification', subtitle, compact = false }) {
  const { data, loading, error, reload, live, setData } = useLiveQuery(() => listReviewableDocuments(null), {
    tables: ['survivor_documents'],
  })
  const [filter, setFilter] = useState(compact ? 'pending' : 'all')
  const [busyId, setBusyId] = useState(null)

  const docs = data ?? []
  const filtered = filter === 'all' ? docs : docs.filter((d) => d.status === filter)

  const act = async (doc, fn, optimistic) => {
    setBusyId(doc.id)
    try {
      await fn()
      if (optimistic) setData((rows) => rows?.map((r) => (r.id === doc.id ? { ...r, ...optimistic } : r)))
      reload()
    } catch (err) {
      window.alert(err.message || 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const table = (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
              <th style={th}>Survivor</th><th style={th}>Document</th><th style={th}>Status</th><th style={th}>Uploaded</th><th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const st = DOC_STATUS[doc.status] ?? DOC_STATUS.pending
              const busy = busyId === doc.id
              return (
                <tr key={doc.id} style={{ borderBottom: '0.5px solid #E5E7EB', opacity: busy ? 0.6 : 1 }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{doc.survivor_name || doc.anonymous_id}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{doc.ngo_name ?? 'Self-registered'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, color: '#374151' }}>{DOC_TYPES[doc.doc_type] ?? doc.doc_type}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', wordBreak: 'break-all' }}>{doc.file_name}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', background: st.bg, color: st.color, borderRadius: 6, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{formatDate(doc.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={btn('ghost')} disabled={busy} onClick={() => act(doc, () => openDocument(doc.storage_path))}>View</button>
                      {doc.status !== 'verified' && (
                        <button style={btn('success')} disabled={busy} onClick={() => act(doc, () => reviewDocument(doc.id, 'verified'), { status: 'verified' })}>✓ Verify</button>
                      )}
                      {doc.status !== 'rejected' && (
                        <button style={btn('danger')} disabled={busy} onClick={() => act(doc, () => reviewDocument(doc.id, 'rejected'), { status: 'rejected' })}>✕ Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (compact) {
    return loading ? <Loading /> : filtered.length === 0
      ? <div style={{ padding: 20, fontSize: 13, color: '#9CA3AF' }}>✅ No documents waiting for verification.</div>
      : table
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} live={live} />
      <StatGrid stats={[
        { label: 'Waiting for review', value: docs.filter((d) => d.status === 'pending').length, color: '#D97706', bg: '#FFFBEB' },
        { label: 'Verified', value: docs.filter((d) => d.status === 'verified').length, color: '#059669', bg: '#F0FDF4' },
        { label: 'Rejected', value: docs.filter((d) => d.status === 'rejected').length, color: '#DC2626', bg: '#FEF2F2' },
      ]} />
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <select style={{ ...fieldInput, width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All documents</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <ErrorBanner message={error} />
      {loading ? <Loading /> : filtered.length === 0
        ? <EmptyState title={docs.length ? 'No documents match this filter' : 'No documents yet'} hint={docs.length ? null : 'Documents survivors upload to their vault appear here for verification.'} />
        : table}
    </>
  )
}
