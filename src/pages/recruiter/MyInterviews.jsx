import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, InterviewModal, btn, fieldInput, toLocalInput, interviewTypeLabel,
} from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { listMyInterviews, updateInterview, formatDateTime } from '../../lib/careers'

const STATUS = {
  scheduled: { bg: '#EFF6FF', color: '#2563EB', label: 'Scheduled' },
  completed: { bg: '#F0FDF4', color: '#059669', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
}

export default function MyInterviews() {
  const { data, loading, error, reload, live, setData } = useLiveQuery(listMyInterviews, { tables: ['interviews'] })
  const [filterStatus, setFilterStatus] = useState('all')
  const [rescheduling, setRescheduling] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [busyId, setBusyId] = useState(null)

  const interviews = data ?? []
  const filtered = filterStatus === 'all' ? interviews : interviews.filter((i) => i.status === filterStatus)
  const isPast = (i) => new Date(i.scheduled_at) < new Date()

  const patch = async (i, fields, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusyId(i.id)
    try {
      await updateInterview(i.id, fields)
      setData((rows) => rows?.map((r) => (r.id === i.id ? { ...r, ...fields } : r)))
      reload()
    } catch (err) {
      window.alert(err.message || 'Could not update the interview.')
    } finally {
      setBusyId(null)
    }
  }

  const saveText = (i, field) => {
    const key = `${i.id}:${field}`
    if (drafts[key] === undefined || drafts[key] === (i[field] ?? '')) return
    patch(i, { [field]: drafts[key].trim() || null })
    setDrafts(({ [key]: _, ...rest }) => rest)
  }

  const textArea = (i, field, placeholder) => (
    <textarea
      value={drafts[`${i.id}:${field}`] ?? i[field] ?? ''}
      onChange={(e) => setDrafts((d) => ({ ...d, [`${i.id}:${field}`]: e.target.value }))}
      onBlur={() => saveText(i, field)}
      placeholder={placeholder}
      style={{ ...fieldInput, fontSize: 12, minHeight: 56, resize: 'vertical' }}
    />
  )

  return (
    <Layout>
      <PageHeader title="📅 My Interviews" subtitle="Schedule and manage survivor interviews" live={live} />

      <StatGrid stats={[
        { label: 'Total interviews', value: interviews.length, color: '#2563EB', bg: '#EFF6FF' },
        { label: 'Upcoming', value: interviews.filter((i) => i.status === 'scheduled' && !isPast(i)).length, color: '#D97706', bg: '#FEF3C7' },
        { label: 'Completed', value: interviews.filter((i) => i.status === 'completed').length, color: '#059669', bg: '#F0FDF4' },
      ]} />

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <select style={{ ...fieldInput, width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All interviews</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState title="No interviews found" hint="Schedule an interview from Applicants, Search Talent or your Shortlist." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
          {filtered.map((i) => {
            const st = STATUS[i.status] ?? STATUS.scheduled
            const busy = busyId === i.id
            const link = i.video_link && /^https?:\/\//i.test(i.video_link) ? i.video_link : null
            return (
              <div key={i.id} className="card" style={{ padding: 20, opacity: busy ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 2 }}>{i.display_name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{i.job_title ?? 'General interview'}</div>
                  </div>
                  <span style={{ padding: '4px 10px', background: st.bg, color: st.color, borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                    {st.label}{i.status === 'scheduled' && isPast(i) ? ' · past' : ''}
                  </span>
                </div>

                <div style={{ marginBottom: 14, padding: 12, background: '#F9FAFB', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{formatDateTime(i.scheduled_at)}</div>
                  <div style={{ fontSize: 12, color: '#2563EB', marginTop: 2 }}>{interviewTypeLabel(i.interview_type)}</div>
                  {i.video_link && !link && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{i.video_link}</div>}
                </div>

                {i.status === 'scheduled' && link && (
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{
                    display: 'block', padding: '9px 12px', background: '#EFF6FF', color: '#2563EB', textDecoration: 'none',
                    borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'center', border: '0.5px solid #BFDBFE', marginBottom: 14,
                  }}>🔗 Join meeting</a>
                )}

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>Private notes</div>
                  {textArea(i, 'notes', 'Questions to ask, things to check…')}
                </div>

                {i.status === 'completed' && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>Feedback</div>
                    {textArea(i, 'feedback', 'How did it go?')}
                  </div>
                )}

                {i.status === 'scheduled' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button disabled={busy} style={btn('success', { flex: 1 })} onClick={() => patch(i, { status: 'completed' })}>Mark done</button>
                    <button disabled={busy} style={btn('ghost', { flex: 1 })} onClick={() => setRescheduling(i)}>Reschedule</button>
                    <button disabled={busy} style={btn('danger', { flex: 1 })}
                      onClick={() => patch(i, { status: 'cancelled' }, `Cancel the interview with ${i.display_name}?`)}>Cancel</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {rescheduling && (
        <InterviewModal
          title="Reschedule interview"
          candidateName={rescheduling.display_name}
          initial={{
            when: toLocalInput(rescheduling.scheduled_at),
            interviewType: rescheduling.interview_type,
            videoLink: rescheduling.video_link ?? '',
            notes: rescheduling.notes ?? '',
          }}
          onClose={() => setRescheduling(null)}
          onSubmit={async (v) => {
            if (new Date(v.scheduledAt) < new Date()) throw new Error('Pick a date and time in the future.')
            await updateInterview(rescheduling.id, {
              scheduled_at: v.scheduledAt,
              interview_type: v.interviewType,
              video_link: v.videoLink || null,
              notes: v.notes || null,
            })
            reload()
          }}
        />
      )}
    </Layout>
  )
}
