import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ErrorBanner, Loading, LiveBadge, StatusPill, Tag, StatTiles, btn } from '../../components/ui'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
            Hello{firstName ? `, ${firstName}` : ''}
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {s.ngo_name ? <span>Supported by {s.ngo_name}</span> : <span>Self-registered</span>}
            {(s.city || s.state) && <span>· {[s.city, s.state].filter(Boolean).join(', ')}</span>}
            <span className="badge" style={{ background: status.bg, color: status.color }}>{status.label}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <LiveBadge live={live} />
          <button className="btn-pill" onClick={() => navigate('/survivor/profile')}>Edit profile</button>
        </div>
      </div>

      <ErrorBanner message={error} />
      {s.status === 'rejected' && (
        <ErrorBanner message={`Your profile needs changes${s.rejection_reason ? `: ${s.rejection_reason}` : '.'} Edit your profile to send it for review again.`} />
      )}

      <StatTiles stats={[
        { label: 'Profile completion', value: `${completion}%`, onClick: () => navigate('/survivor/profile') },
        { label: 'Jobs applied', value: apps.length, onClick: () => navigate('/survivor/applications') },
        { label: 'Interviews scheduled', value: upcoming.length, onClick: () => navigate('/survivor/applications') },
        { label: 'Current journey stage', value: `Stage ${stage}/${JOURNEY.length}` },
      ]} />

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--navy)', marginBottom: 14, fontSize: 18 }}>Career & Learning Tools</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { tag: 'Resume', title: 'Resume builder', text: 'Create a printable resume from your profile and save it to your account.', to: '/survivor/resume', cta: 'Open resume' },
            { tag: 'Skills', title: `${(s.skills ?? []).length} skill${(s.skills ?? []).length === 1 ? '' : 's'} on your profile`, text: 'Add the skills recruiters search for. They appear in Talent Search instantly.', to: '/survivor/skills', cta: 'Manage skills' },
            { tag: 'Learning', title: 'Courses for you', text: 'Free and low-cost courses matched to your skills.', to: '/survivor/courses', cta: 'Browse courses' },
          ].map((t) => (
            <div key={t.tag} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--navy)' }}>
              <div>
                <span className="badge" style={{ fontSize: 11, marginBottom: 10 }}>{t.tag}</span>
                <h3 style={{ color: 'var(--navy)', margin: '10px 0 6px' }}>{t.title}</h3>
                <p style={{ color: 'var(--ink2)', fontSize: 13, margin: 0 }}>{t.text}</p>
              </div>
              <button className="btn-soft" style={{ marginTop: 16, alignSelf: 'flex-start' }} onClick={() => navigate(t.to)}>{t.cta} →</button>
            </div>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="card-dark" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, color: '#fff', margin: '0 0 10px' }}>Your upcoming interviews</h3>
          {upcoming.slice(0, 3).map((i) => (
            <div key={i.id} style={{ fontSize: 13, color: '#D3DDF6', padding: '6px 0' }}>
              <strong style={{ color: '#fff' }}>{formatDateTime(i.scheduled_at)}</strong> — {i.company_name}{i.job_title ? ` · ${i.job_title}` : ''}
            </div>
          ))}
          <Link to="/survivor/applications" style={{ fontSize: 12, fontWeight: 600, color: 'var(--sky)' }}>See details →</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', }}>Profile Completion</h3>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--royal)', }}>{completion}%</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 20 }}>
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          {checklist.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: item.done ? 'var(--navy)' : 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: item.done ? '#fff' : '#8A97B5', flexShrink: 0 }}>
                {item.done ? '✓' : '○'}
              </div>
              <span style={{ fontSize: 13, color: item.done ? 'var(--ink)' : '#8A97B5' }}>{item.label}</span>
            </div>
          ))}
          {completion < 100 || docCount === 0 ? (
            <button className="btn-primary" onClick={() => navigate(completion < 100 ? '/survivor/profile' : '/survivor/docs')} style={{ width: '100%', marginTop: 12 }}>
              {completion < 100 ? 'Complete Profile' : 'Upload Documents'}
            </button>
          ) : (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>✓ Your profile is complete</div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>My Journey</h3>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 2, background: 'var(--line)' }} />
            {JOURNEY.map((label, i) => {
              const done = i < stage
              const active = i === stage - 1
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: i < JOURNEY.length - 1 ? 20 : 0, position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? (active ? 'var(--royal)' : 'var(--navy)') : 'var(--mist)', border: active ? '3px solid var(--sky)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: done ? '#fff' : '#8A97B5', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>
                    {done && !active ? '✓' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? 'var(--navy)' : '#8A97B5' }}>{label}</div>
                    {active && <div style={{ fontSize: 11, color: 'var(--royal)', fontWeight: 600, marginTop: 2 }}>Current stage</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>My Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(s.skills ?? []).map((x) => <span key={x} className="skill-tag">{x}</span>)}
          <span className="skill-tag" style={{ background: 'var(--mist)', color: 'var(--ink2)', border: '0.5px dashed var(--line)', cursor: 'pointer' }} onClick={() => navigate('/survivor/profile')}>
            {(s.skills ?? []).length ? '+ Add more' : '+ Add your skills'}
          </span>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', }}>Recent Applications</h3>
            <Link to="/survivor/applications" style={{ fontSize: 13, color: 'var(--royal)', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
          </div>
          {apps.slice(0, 3).map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--mist)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{a.job_title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{a.company_name} · updated {timeAgo(a.updated_at)}</div>
              </div>
              <StatusPill status={a.status} />
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', }}>Recommended Jobs</h3>
          <Link to="/survivor/jobs" style={{ fontSize: 13, color: 'var(--royal)', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
        </div>
        {recommended.length === 0 ? (
          <div style={{ fontSize: 13, color: '#8A97B5' }}>
            {jobs.length ? "You've applied to every open job. New jobs will appear here automatically." : 'No open jobs right now. New jobs appear here as soon as recruiters publish them.'}
          </div>
        ) : recommended.map((job) => {
          const salary = formatSalary(job)
          return (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--mist)', flexWrap: 'wrap' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💼</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{job.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{[job.company_name, jobLocation(job), salary].filter(Boolean).join(' · ')}</div>
                {job.match > 0 && <div style={{ marginTop: 4 }}><Tag>✓ Matches {job.match} of your skills</Tag></div>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--ink2)' }}>{timeAgo(job.published_at)}</span>
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
