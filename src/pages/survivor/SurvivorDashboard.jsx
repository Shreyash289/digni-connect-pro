import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ErrorBanner, Loading, LiveBadge, StatusPill, Tag, btn } from '../../components/ui'
import { supabase } from '../../integrations/supabase/client'
import { useLiveQuery } from '../../lib/live'
import {
  getMySurvivor, listMyApplications, listMySurvivorInterviews, listOpenJobs, applyToJob,
  JOURNEY, journeyStage, SURVIVOR_STATUS, formatSalary, jobLocation, formatDateTime, timeAgo,
} from '../../lib/careers'

async function loadDashboard() {
  const survivor = await getMySurvivor()
  const [apps, interviews, jobs, docs] = await Promise.all([
    listMyApplications(),
    listMySurvivorInterviews(),
    listOpenJobs(),
    supabase.from('survivor_documents').select('id', { count: 'exact', head: true })
      .eq('survivor_id', survivor.id).is('deleted_at', null),
  ])
  if (docs.error) throw docs.error
  return { survivor, apps, interviews, jobs, docCount: docs.count ?? 0 }
}

export default function SurvivorDashboard() {
  const navigate = useNavigate()
  const { data, loading, error, reload, live } = useLiveQuery(loadDashboard, {
    tables: ['survivors', 'job_applications', 'interviews', 'jobs', 'survivor_documents'],
  })
  const [applyingId, setApplyingId] = useState(null)

  if (loading || !data) {
    return <Layout><ErrorBanner message={error} />{!error && <Loading label="Loading your dashboard…" />}</Layout>
  }

  const { survivor: s, apps, interviews, jobs, docCount } = data
  const firstName = (s.full_name || '').trim().split(' ')[0]
  const completion = s.profile_completion ?? 0
  const upcoming = interviews.filter((i) => i.status === 'scheduled' && new Date(i.scheduled_at) >= new Date())
  const counts = {
    completion,
    applications: apps.length,
    interviews: interviews.filter((i) => i.status !== 'cancelled').length + apps.filter((a) => a.status === 'interview_scheduled').length,
    offers: apps.filter((a) => ['offered', 'hired'].includes(a.status)).length,
    hired: apps.filter((a) => a.status === 'hired').length,
  }
  const stage = journeyStage(counts)
  const status = SURVIVOR_STATUS[s.status] ?? SURVIVOR_STATUS.submitted

  const checklist = [
    { label: 'Name & age', done: !!s.full_name?.trim() && !!s.age },
    { label: 'Location', done: !!(s.city || s.state) },
    { label: 'Languages', done: (s.languages ?? []).length > 0 },
    { label: 'Skills added', done: (s.skills ?? []).length > 0 },
    { label: 'Education', done: !!s.education_level },
    { label: 'Work experience', done: (s.work_history ?? []).length > 0 || !!s.total_experience },
    { label: 'About you', done: (s.bio ?? '').trim().length > 20 },
    { label: 'Visible to recruiters', done: !!s.consent_share_with_recruiters },
    { label: 'Documents uploaded', done: docCount > 0, link: '/survivor/docs' },
  ]

  // Recommend open jobs that share skills with the survivor's profile
  const mySkills = new Set((s.skills ?? []).map((x) => x.toLowerCase()))
  const recommended = jobs
    .filter((j) => !j.application_status)
    .map((j) => ({ ...j, match: (j.required_skills ?? []).filter((x) => mySkills.has(x.toLowerCase())).length }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 4)

  const apply = async (job) => {
    setApplyingId(job.id)
    try {
      await applyToJob(job.id)
      await reload()
    } catch (err) {
      window.alert(err.message || 'Could not apply.')
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#0D9488', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Welcome back</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
            Hello{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {s.ngo_name ? <span>Backed by <strong>{s.ngo_name}</strong></span> : <span>Self-registered</span>}
            {(s.city || s.state) && <span>· {[s.city, s.state].filter(Boolean).join(', ')}</span>}
            <span style={{ padding: '2px 8px', background: status.bg, color: status.color, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{status.label}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <LiveBadge live={live} />
          <button className="btn-primary" onClick={() => navigate('/survivor/profile')}>✏️ Edit Profile</button>
        </div>
      </div>

      <ErrorBanner message={error} />
      {s.status === 'rejected' && (
        <ErrorBanner message={`Your profile needs changes${s.rejection_reason ? `: ${s.rejection_reason}` : '.'} Edit your profile to send it for review again.`} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Profile Complete', value: `${completion}%`, color: '#2563EB', bg: '#EFF6FF', icon: '👤', to: '/survivor/profile' },
          { label: 'Jobs Applied', value: apps.length, color: '#0D9488', bg: '#F0FDFA', icon: '💼', to: '/survivor/applications' },
          { label: 'Upcoming Interviews', value: upcoming.length, color: '#7C3AED', bg: '#F5F3FF', icon: '🗣️', to: '/survivor/applications' },
          { label: 'Current Stage', value: `Stage ${stage}/${JOURNEY.length}`, color: '#D97706', bg: '#FFFBEB', icon: '📈' },
        ].map((x) => (
          <div key={x.label} className="stat-card" onClick={() => x.to && navigate(x.to)}
            style={{ background: x.bg, border: 'none', cursor: x.to ? 'pointer' : 'default' }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{x.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: x.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{x.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>{x.label}</div>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20, background: '#F0FDFA', border: '0.5px solid #99F6E4' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F766E', margin: '0 0 10px' }}>📅 Your upcoming interviews</h3>
          {upcoming.slice(0, 3).map((i) => (
            <div key={i.id} style={{ fontSize: 13, color: '#0C1F3F', padding: '6px 0' }}>
              <strong>{formatDateTime(i.scheduled_at)}</strong> — {i.company_name}{i.job_title ? ` · ${i.job_title}` : ''}
            </div>
          ))}
          <Link to="/survivor/applications" style={{ fontSize: 12, fontWeight: 600, color: '#0F766E' }}>See details →</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Profile Completion</h3>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>{completion}%</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 20 }}>
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          {checklist.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: item.done ? '#059669' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: item.done ? '#fff' : '#9CA3AF', flexShrink: 0 }}>
                {item.done ? '✓' : '○'}
              </div>
              <span style={{ fontSize: 13, color: item.done ? '#374151' : '#9CA3AF' }}>{item.label}</span>
            </div>
          ))}
          {completion < 100 || docCount === 0 ? (
            <button className="btn-primary" onClick={() => navigate(completion < 100 ? '/survivor/profile' : '/survivor/docs')} style={{ width: '100%', marginTop: 12 }}>
              {completion < 100 ? 'Complete Profile' : 'Upload Documents'}
            </button>
          ) : (
            <div style={{ marginTop: 12, fontSize: 13, color: '#059669', fontWeight: 600 }}>✓ Your profile is complete</div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 20 }}>My Journey</h3>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 2, background: '#E5E7EB' }} />
            {JOURNEY.map((label, i) => {
              const done = i < stage
              const active = i === stage - 1
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: i < JOURNEY.length - 1 ? 20 : 0, position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? (active ? '#2563EB' : '#059669') : '#F3F4F6', border: active ? '3px solid #93C5FD' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: done ? '#fff' : '#9CA3AF', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>
                    {done && !active ? '✓' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? '#0C1F3F' : '#9CA3AF' }}>{label}</div>
                    {active && <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, marginTop: 2 }}>Current stage</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 14 }}>My Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(s.skills ?? []).map((x) => <span key={x} className="skill-tag">{x}</span>)}
          <span className="skill-tag" style={{ background: '#F3F4F6', color: '#6B7280', border: '0.5px dashed #D1D5DB', cursor: 'pointer' }} onClick={() => navigate('/survivor/profile')}>
            {(s.skills ?? []).length ? '+ Add more' : '+ Add your skills'}
          </span>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Recent Applications</h3>
            <Link to="/survivor/applications" style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
          </div>
          {apps.slice(0, 3).map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid #F3F4F6' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>{a.job_title}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{a.company_name} · updated {timeAgo(a.updated_at)}</div>
              </div>
              <StatusPill status={a.status} />
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Recommended Jobs</h3>
          <Link to="/survivor/jobs" style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
        </div>
        {recommended.length === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>
            {jobs.length ? "You've applied to every open job. New jobs will appear here automatically." : 'No open jobs right now. New jobs appear here as soon as recruiters publish them.'}
          </div>
        ) : recommended.map((job) => {
          const salary = formatSalary(job)
          return (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '0.5px solid #F3F4F6', flexWrap: 'wrap' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💼</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>{job.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{[job.company_name, jobLocation(job), salary].filter(Boolean).join(' · ')}</div>
                {job.match > 0 && <div style={{ marginTop: 4 }}><Tag>✓ Matches {job.match} of your skills</Tag></div>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{timeAgo(job.published_at)}</span>
                <button style={btn('success', { opacity: applyingId === job.id ? 0.6 : 1 })} disabled={applyingId === job.id} onClick={() => apply(job)}>
                  {applyingId === job.id ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
