import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { PageHeader, StatGrid, ErrorBanner, EmptyState, Loading, StatusPill, btn, interviewTypeLabel } from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import {
  listMyApplications, listMySurvivorInterviews, withdrawApplication, EMPLOYMENT_TYPES, formatDate, formatDateTime,
} from '../../lib/careers'

const STATUS_MESSAGE = {
  submitted: 'Sent — waiting for the recruiter to review it.',
  reviewing: 'The recruiter is reviewing your application.',
  shortlisted: "Good news — you've been shortlisted!",
  interview_scheduled: "You're invited to an interview. Details below.",
  offered: "Congratulations — you've received an offer! The recruiter will be in touch.",
  hired: 'Congratulations on your new job! 🎉',
  rejected: "You weren't selected this time. Keep going — new jobs are posted every week.",
}

export default function MyApplications() {
  const { data, loading, error, reload, live } = useLiveQuery(
    async () => {
      const [apps, interviews] = await Promise.all([listMyApplications(), listMySurvivorInterviews()])
      return { apps, interviews }
    },
    { tables: ['job_applications', 'interviews'] },
  )
  const [busyId, setBusyId] = useState(null)
  const applications = data?.apps ?? []
  // Interviews arranged directly by a recruiter (not through an application)
  const otherInterviews = (data?.interviews ?? []).filter((i) => !i.application_id && i.status === 'scheduled')

  const count = (...s) => applications.filter((a) => s.includes(a.status)).length

  const withdraw = async (app) => {
    if (!window.confirm(`Withdraw your application for "${app.job_title}"?`)) return
    setBusyId(app.id)
    try {
      await withdrawApplication(app.id)
      await reload()
    } catch (err) {
      window.alert(err.message || 'Could not withdraw the application.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Layout>
      <PageHeader title="My Applications" subtitle="Track your job applications and interview status" live={live} />

      <StatGrid stats={[
        { label: 'Total', value: applications.length, color: '#2563EB', bg: '#EFF6FF' },
        { label: 'In progress', value: count('submitted', 'reviewing', 'shortlisted'), color: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Interview', value: count('interview_scheduled'), color: '#0D9488', bg: '#F0FDFA' },
        { label: 'Offered / Hired', value: count('offered', 'hired'), color: '#059669', bg: '#F0FDF4' },
      ]} />

      <ErrorBanner message={error} />

      {otherInterviews.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20, background: '#F0FDFA', border: '0.5px solid #99F6E4' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F766E', margin: '0 0 12px' }}>📅 Interview invitations</h3>
          {otherInterviews.map((i) => <InterviewBox key={i.id} i={{ ...i, interview_at: i.scheduled_at, interview_link: i.video_link }} title={`${i.company_name}${i.job_title ? ` — ${i.job_title}` : ''}`} />)}
        </div>
      )}

      {loading ? <Loading /> : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          hint="Apply to jobs from the Job Board and they'll show up here."
          action={<Link to="/survivor/jobs" style={btn('primary', { textDecoration: 'none' })}>Browse jobs</Link>}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', background: '#FFFBEB' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>
              📋 Your Applications ({applications.length})
            </h3>
          </div>
          {applications.map((app) => (
            <div key={app.id} style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', background: ['offered', 'hired'].includes(app.status) ? '#F0FDF4' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 2 }}>{app.job_title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                    {[app.company_name, app.location, EMPLOYMENT_TYPES[app.employment_type]].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9CA3AF' }}>
                    <span>Applied: {formatDate(app.created_at)}</span>
                    <span>•</span>
                    <span>Updated: {formatDate(app.updated_at)}</span>
                    {app.job_status === 'closed' && <><span>•</span><span>Job closed</span></>}
                  </div>
                </div>
                <StatusPill status={app.status} />
              </div>

              <div style={{ fontSize: 12, color: '#374151', marginBottom: 10, padding: '8px 12px', background: '#F3F4F6', borderRadius: 6 }}>
                💬 {app.status_note || STATUS_MESSAGE[app.status] || 'Status updated.'}
              </div>

              {app.interview_id && app.interview_status === 'scheduled' && (
                <InterviewBox i={app} title="Your interview" />
              )}
              {app.interview_id && app.interview_status === 'cancelled' && app.status === 'interview_scheduled' && (
                <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>The interview was cancelled. The recruiter may reschedule.</div>
              )}

              {['submitted', 'reviewing'].includes(app.status) && (
                <button style={btn('danger', { opacity: busyId === app.id ? 0.6 : 1 })} disabled={busyId === app.id} onClick={() => withdraw(app)}>
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

function InterviewBox({ i, title }) {
  const link = i.interview_link && /^https?:\/\//i.test(i.interview_link) ? i.interview_link : null
  return (
    <div style={{ padding: 12, background: '#fff', border: '0.5px solid #99F6E4', borderRadius: 8, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{formatDateTime(i.interview_at)}</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
        {interviewTypeLabel(i.interview_type)}{i.interview_link && !link ? ` · ${i.interview_link}` : ''}
      </div>
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ ...btn('teal'), display: 'inline-block', marginTop: 8, textDecoration: 'none' }}>
          🔗 Join meeting
        </a>
      )}
    </div>
  )
}
