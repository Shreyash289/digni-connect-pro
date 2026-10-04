import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, StatusPill, CandidateCard, CandidateProfileModal,
  InterviewModal, btn, fieldInput, formatDate,
} from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import {
  listApplicants, listMyJobs, setApplicationStatus, scheduleInterview, toggleSavedCandidate, formatDateTime, APPLICATION_STATUS,
} from '../../lib/careers'

export default function Applicants() {
  const [params, setParams] = useSearchParams()
  const jobId = params.get('job') || ''
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewing, setViewing] = useState(null)
  const [scheduling, setScheduling] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const { data, loading, error, reload, live } = useLiveQuery(
    async () => {
      const [apps, jobs] = await Promise.all([listApplicants(jobId), listMyJobs()])
      return { apps, jobs }
    },
    { tables: ['job_applications', 'interviews', 'saved_candidates', 'jobs'], deps: [jobId] },
  )
  const apps = data?.apps ?? []
  const jobs = data?.jobs ?? []
  const filtered = statusFilter === 'all' ? apps : apps.filter((a) => a.status === statusFilter)
  const count = (s) => apps.filter((a) => a.status === s).length

  const act = async (app, fn) => {
    setBusyId(app.application_id)
    try {
      await fn()
      await reload()
    } catch (err) {
      window.alert(err.message || 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const setStatus = (app, status) => {
    if (status === 'rejected' && !window.confirm(`Mark ${app.display_name} as not selected for "${app.job_title}"?`)) return
    act(app, () => setApplicationStatus(app.application_id, status))
  }

  const actionsFor = (app) => {
    const busy = busyId === app.application_id
    const b = (variant, label, onClick) => (
      <button key={label} disabled={busy} style={btn(variant, { opacity: busy ? 0.6 : 1 })} onClick={onClick}>{label}</button>
    )
    const out = []
    if (app.status === 'submitted') out.push(b('ghost', 'Mark reviewed', () => setStatus(app, 'reviewing')))
    if (['submitted', 'reviewing'].includes(app.status)) out.push(b('purple', 'Shortlist', () => setStatus(app, 'shortlisted')))
    if (['submitted', 'reviewing', 'shortlisted'].includes(app.status)) out.push(b('teal', 'Schedule interview', () => setScheduling(app)))
    if (app.status === 'interview_scheduled') out.push(b('success', 'Make offer', () => setStatus(app, 'offered')))
    if (app.status === 'offered') out.push(b('success', 'Mark hired', () => setStatus(app, 'hired')))
    if (!['rejected', 'hired'].includes(app.status)) out.push(b('danger', 'Reject', () => setStatus(app, 'rejected')))
    return out
  }

  return (
    <Layout>
      <PageHeader title="👥 Applicants" subtitle="Review who applied, shortlist them, and schedule interviews" live={live} />

      <StatGrid stats={[
        { label: 'Total applicants', value: apps.length, color: '#2563EB', bg: '#EFF6FF' },
        { label: 'New', value: count('submitted'), color: '#D97706', bg: '#FFFBEB' },
        { label: 'Shortlisted', value: count('shortlisted'), color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Interviewing', value: count('interview_scheduled'), color: '#0D9488', bg: '#F0FDFA' },
        { label: 'Offered / Hired', value: count('offered') + count('hired'), color: '#059669', bg: '#F0FDF4' },
      ]} />

      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <select style={{ ...fieldInput, width: 'auto', minWidth: 220 }} value={jobId}
          onChange={(e) => setParams(e.target.value ? { job: e.target.value } : {})}>
          <option value="">All jobs</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} ({j.applicant_count})</option>)}
        </select>
        <select style={{ ...fieldInput, width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(APPLICATION_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState
          title={apps.length ? 'No applicants match this filter' : 'No applications yet'}
          hint={apps.length ? null : 'Applications appear here the moment a survivor applies to one of your live jobs.'}
          action={!jobs.some((j) => j.status === 'published') && <Link to="/recruiter/jobs" style={btn('primary', { textDecoration: 'none' })}>Post a job</Link>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((app) => (
            <CandidateCard
              key={app.application_id}
              c={app}
              saving={busyId === app.application_id}
              onToggleSave={() => act(app, () => toggleSavedCandidate(app.id))}
              onView={() => setViewing(app)}
              footer={
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1F3F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job_title}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>Applied {formatDate(app.applied_at)}</div>
                    </div>
                    <StatusPill status={app.status} />
                  </div>
                  {app.interview_status === 'scheduled' && (
                    <div style={{ fontSize: 12, color: '#0F766E', background: '#F0FDFA', padding: '6px 10px', borderRadius: 6 }}>
                      📅 {formatDateTime(app.interview_at)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{actionsFor(app)}</div>
                </>
              }
            />
          ))}
        </div>
      )}

      {viewing && (
        <CandidateProfileModal
          c={apps.find((a) => a.application_id === viewing.application_id) ?? viewing}
          onClose={() => setViewing(null)}
          actions={actionsFor(apps.find((a) => a.application_id === viewing.application_id) ?? viewing)}
        />
      )}

      {scheduling && (
        <InterviewModal
          title={`Schedule interview — ${scheduling.job_title}`}
          candidateName={scheduling.display_name}
          onClose={() => setScheduling(null)}
          onSubmit={async (v) => {
            await scheduleInterview({ applicationId: scheduling.application_id, ...v })
            setViewing(null)
            await reload()
          }}
        />
      )}
    </Layout>
  )
}
