import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { PageHeader, StatGrid, ErrorBanner, Loading, StatusPill, btn } from '../../components/ui'
import { useLiveQuery } from '../../lib/live'
import { getMyRecruiter, listMyJobs, listApplicants, listMyInterviews, listSavedCandidates, formatDateTime, formatDate } from '../../lib/careers'

export default function RecruiterDashboard() {
  const { data, loading, error, live } = useLiveQuery(
    async () => {
      const [recruiter, jobs, apps, interviews, saved] = await Promise.all([
        getMyRecruiter(), listMyJobs(), listApplicants(null), listMyInterviews(), listSavedCandidates(),
      ])
      return { recruiter, jobs, apps, interviews, saved }
    },
    { tables: ['jobs', 'job_applications', 'interviews', 'saved_candidates'] },
  )

  const upcoming = (data?.interviews ?? []).filter((i) => i.status === 'scheduled' && new Date(i.scheduled_at) >= new Date())

  return (
    <Layout>
      <PageHeader
        title={data?.recruiter ? `Welcome, ${data.recruiter.company_name}` : 'Recruiter Dashboard'}
        subtitle="Your hiring activity on CAREVIA"
        live={live}
        action={<Link to="/recruiter/jobs" style={btn('primary', { textDecoration: 'none', padding: '9px 16px', fontSize: 13 })}>+ Post a job</Link>}
      />
      <ErrorBanner message={error} />

      {loading || !data ? <Loading /> : (
        <>
          <StatGrid stats={[
            { label: 'Live jobs', value: data.jobs.filter((j) => j.status === 'published').length, color: 'var(--navy)', bg: 'var(--mist)' },
            { label: 'Applicants', value: data.apps.length, color: 'var(--royal)', bg: 'var(--mist)' },
            { label: 'New applications', value: data.apps.filter((a) => a.status === 'submitted').length, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Shortlisted', value: data.saved.length, color: 'var(--royal)', bg: 'var(--mist)' },
            { label: 'Upcoming interviews', value: upcoming.length, color: 'var(--royal)', bg: 'var(--mist)' },
          ]} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Latest applications</h3>
                <Link to="/recruiter/applicants" style={{ fontSize: 12, color: 'var(--royal)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
              </div>
              {data.apps.length === 0 ? (
                <div style={{ fontSize: 13, color: '#8A97B5' }}>No applications yet. Publish a job to start receiving them.</div>
              ) : data.apps.slice(0, 6).map((a) => (
                <div key={a.application_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--mist)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{a.display_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{a.job_title} · {formatDate(a.applied_at)}</div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Upcoming interviews</h3>
                <Link to="/recruiter/interviews" style={{ fontSize: 12, color: 'var(--royal)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
              </div>
              {upcoming.length === 0 ? (
                <div style={{ fontSize: 13, color: '#8A97B5' }}>Nothing scheduled.</div>
              ) : upcoming.slice(0, 6).map((i) => (
                <div key={i.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--mist)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{i.display_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{i.job_title ?? 'General interview'} · {formatDateTime(i.scheduled_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
