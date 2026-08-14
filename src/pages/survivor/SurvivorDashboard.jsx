import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { JOBS, STAGES } from '../../data/mockData'

const [survivors] = useState([])
export default function SurvivorDashboard() {
  const navigate = useNavigate()
  const [appliedJobs, setAppliedJobs] = useState([1])

  const apply = (id) => { if (!appliedJobs.includes(id)) setAppliedJobs([...appliedJobs, id]) }

  return (
    <Layout>
      {/* Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, color: '#0D9488', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Welcome back</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>Hello, Meena 👋</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Backed by <strong>{profile.ngo}</strong> · {profile.location}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/survivor/profile')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Profile Complete', value: `${profile.completeness}%`, color: '#2563EB', bg: '#EFF6FF', icon: '👤' },
          { label: 'Jobs Applied', value: profile.jobsApplied, color: '#0D9488', bg: '#F0FDFA', icon: '💼' },
          { label: 'Interviews', value: profile.interviews, color: '#7C3AED', bg: '#F5F3FF', icon: '🗣️' },
          { label: 'Current Stage', value: `Stage ${profile.stage}/5`, color: '#D97706', bg: '#FFFBEB', icon: '📈' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg, border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: s.color, fontWeight: 700, background: '#fff', padding: '2px 8px', borderRadius: 100 }}>Live</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Profile completion */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Profile Completion</h3>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>{profile.completeness}%</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 20 }}>
            <div className="progress-fill" style={{ width: `${profile.completeness}%` }} />
          </div>
          {[
            { label: 'Personal Details', done: true },
            { label: 'Education & Certifications', done: true },
            { label: 'Skills Added', done: true },
            { label: 'Work Experience', done: true },
            { label: 'Documents Uploaded', done: false },
            { label: 'Photo Added', done: false },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: item.done ? '#059669' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: item.done ? '#fff' : '#9CA3AF', flexShrink: 0 }}>
                {item.done ? '✓' : '○'}
              </div>
              <span style={{ fontSize: 13, color: item.done ? '#374151' : '#9CA3AF' }}>{item.label}</span>
            </div>
          ))}
          <button className="btn-primary" onClick={() => navigate('/survivor/profile')} style={{ width: '100%', marginTop: 12 }}>
            Complete Profile
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 20 }}>My Journey</h3>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 2, background: '#E5E7EB' }} />
            <div style={{ position: 'absolute', left: 15, top: 16, width: 2, height: `${((profile.stage - 1) / (STAGES.length - 1)) * 100}%`, background: 'linear-gradient(180deg, #2563EB, #0D9488)', transition: 'height 0.8s ease' }} />

            {STAGES.map((stage, i) => {
              const done = i < profile.stage
              const active = i === profile.stage - 1
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: i < STAGES.length - 1 ? 24 : 0, position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? (active ? '#2563EB' : '#059669') : '#F3F4F6', border: active ? '3px solid #93C5FD' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: done ? '#fff' : '#9CA3AF', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>
                    {done && !active ? '✓' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? '#0C1F3F' : '#9CA3AF' }}>{stage}</div>
                    {active && <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, marginTop: 2 }}>Current stage</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 14 }}>My Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {profile.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          <span className="skill-tag" style={{ background: '#F3F4F6', color: '#6B7280', border: '0.5px dashed #D1D5DB', cursor: 'pointer' }} onClick={() => navigate('/survivor/profile')}>+ Add more</span>
        </div>
      </div>

      {/* Job Board preview */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Recommended Jobs</h3>
          <span style={{ fontSize: 13, color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>View all →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {JOBS.slice(0, 4).map(job => (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '0.5px solid #F3F4F6' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💼</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>{job.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{job.company} · {job.location} · {job.salary}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{job.posted}</span>
                {appliedJobs.includes(job.id)
                  ? <span className="badge badge-approved">Applied ✓</span>
                  : <button className="btn-success" onClick={() => apply(job.id)}>Apply</button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
