import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { JOBS, STAGES } from '../../data/mockData'
import { learningService } from '../../services/learningService'
import { resumeService } from '../../services/resumeService'

const profile = {
  name: 'Meena Rajeshwari',
  stage: 3,
  completeness: 85,
  jobsApplied: 4,
  interviews: 2,
  skills: ['Data Entry', 'MS Office', 'Tailoring'],
  ngo: 'Asha Foundation',
  location: 'Chennai, Tamil Nadu'
}

export default function SurvivorDashboard() {
  const navigate = useNavigate()
  const [appliedJobs, setAppliedJobs] = useState([1])
  const [userSkills, setUserSkills] = useState(profile.skills)
  const [hasResumeDraft, setHasResumeDraft] = useState(false)
  const [hasServerResume, setHasServerResume] = useState(false)

  const userId = localStorage.getItem('userId')

  useEffect(() => {
    // 1. Check local resume draft
    const savedResumeDraft = localStorage.getItem('carevia_survivor_resume_draft')
    if (savedResumeDraft) {
      try {
        const parsed = JSON.parse(savedResumeDraft)
        if (parsed?.personal?.fullName || parsed?.skills?.length > 0) {
          setHasResumeDraft(true)
        }
      } catch {
        // ignore
      }
    }

    // 2. Check local skills draft or load from server if authenticated
    const savedSkillsDraft = localStorage.getItem('carevia_survivor_skills_draft')
    if (savedSkillsDraft) {
      try {
        const parsed = JSON.parse(savedSkillsDraft)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUserSkills(parsed)
        }
      } catch {
        // ignore
      }
    }

    if (userId) {
      loadServerData(userId)
    }
  }, [userId])

  const loadServerData = async (uid) => {
    // Check server skills
    const skillsRes = await learningService.getSurvivorSkills(uid)
    if (skillsRes.data && skillsRes.data.length > 0) {
      const serverSkillsList = skillsRes.data
        .map((item) => (typeof item === 'string' ? item : item.skill_name || item.name || ''))
        .filter(Boolean)
      if (serverSkillsList.length > 0) {
        setUserSkills(serverSkillsList)
      }
    }

    // Check server resume
    const resumeRes = await resumeService.getSurvivorResume(uid)
    if (resumeRes.data) {
      setHasServerResume(true)
    }
  }

  const apply = (id) => {
    if (!appliedJobs.includes(id)) setAppliedJobs([...appliedJobs, id])
  }

  const statItems = [
    { label: 'Profile completion', value: `${profile.completeness}%` },
    { label: 'Jobs applied', value: profile.jobsApplied },
    { label: 'Interviews scheduled', value: profile.interviews },
    { label: 'Current journey stage', value: `Stage ${profile.stage}/5` }
  ]

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
            Hello, {profile.name}
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
            Supported by {profile.ngo} · {profile.location}
          </p>
        </div>
        <button className="btn-pill" onClick={() => navigate('/survivor/profile')}>
          Edit profile
        </button>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statItems.map((stat, idx) => {
          const cardClass = idx === 0 ? 'card-light' : idx % 2 === 1 ? 'card-dark' : 'card'
          return (
            <div key={stat.label} className={cardClass} style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 12 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 40, fontWeight: 300, lineHeight: 1 }}>
                {stat.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Phase 6 Quick Entry Points Grid: Resume, Skills, Courses */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: 'var(--navy)', marginBottom: 14, fontSize: 18 }}>
          Career & Learning Tools
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* 1. Resume Builder Card */}
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--navy)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="badge" style={{ background: 'var(--mist)', color: 'var(--navy)', fontSize: 11 }}>
                  Resume
                </span>
                {(hasResumeDraft || hasServerResume) && (
                  <span className="badge" style={{ background: 'var(--navy)', color: '#ffffff', fontSize: 11 }}>
                    {hasServerResume ? 'Saved Online' : 'Draft Ready'}
                  </span>
                )}
              </div>
              <h4 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 16 }}>
                Resume Builder
              </h4>
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Create, edit, and export your professional resume to PDF.
              </p>
            </div>
            <button
              className="btn-soft"
              onClick={() => navigate('/survivor/resume')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Build & Export Resume
            </button>
          </div>

          {/* 2. Skills Manager Card */}
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--royal)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="badge" style={{ background: 'var(--mist)', color: 'var(--navy)', fontSize: 11 }}>
                  Competencies
                </span>
                <span className="badge" style={{ fontSize: 11 }}>
                  {userSkills.length} skills
                </span>
              </div>
              <h4 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 16 }}>
                Skills Profile
              </h4>
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Manage your competencies for job and course matching.
              </p>
            </div>
            <button
              className="btn-soft"
              onClick={() => navigate('/survivor/skills')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Manage Skills
            </button>
          </div>

          {/* 3. Courses / Learning Recommender Card */}
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--navy)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="badge" style={{ background: 'var(--mist)', color: 'var(--navy)', fontSize: 11 }}>
                  Learning
                </span>
              </div>
              <h4 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 16 }}>
                Courses & Recommender
              </h4>
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Explore targeted modules and skill-based recommendations.
              </p>
            </div>
            <button
              className="btn-soft"
              onClick={() => navigate('/survivor/courses')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Profile completion card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>Profile completion</h3>
            <span className="badge">{profile.completeness}% complete</span>
          </div>

          <div style={{ height: 8, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: '100%', width: `${profile.completeness}%`, background: 'var(--royal)', borderRadius: 'var(--r-pill)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Personal details', done: true },
              { label: 'Education and certifications', done: true },
              { label: 'Skills and capabilities', done: true },
              { label: 'Work experience', done: true },
              { label: 'Documents uploaded', done: false },
              { label: 'Verification review', done: false }
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 'var(--r-pill)',
                    background: item.done ? 'var(--navy)' : 'var(--mist)',
                    color: item.done ? '#ffffff' : 'var(--ink2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 500,
                    flexShrink: 0
                  }}
                >
                  {item.done ? '✓' : ''}
                </div>
                <span style={{ color: item.done ? 'var(--ink)' : 'var(--ink2)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <button className="btn-pill" onClick={() => navigate('/survivor/profile')} style={{ width: '100%' }}>
            Complete profile steps
          </button>
        </div>

        {/* Progress Tracker Card */}
        <div className="card">
          <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>My journey</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STAGES.map((stage, i) => {
              const isDone = i < profile.stage
              const isActive = i === profile.stage - 1
              return (
                <div
                  key={stage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 'var(--r-card)',
                    background: isActive ? 'var(--mist)' : 'transparent',
                    border: isActive ? '1px solid var(--line)' : '1px solid transparent'
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--r-pill)',
                      background: isDone ? 'var(--navy)' : isActive ? 'var(--royal)' : 'var(--mist)',
                      color: isDone || isActive ? '#ffffff' : 'var(--ink2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 500,
                      flexShrink: 0
                    }}
                  >
                    {isDone && !isActive ? '✓' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: isActive ? 500 : 400, color: 'var(--ink)' }}>
                      {stage}
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 11, color: 'var(--royal)', fontWeight: 500 }}>
                        Current stage in progress
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Skills Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>Verified skills</h3>
          <button className="btn-soft" onClick={() => navigate('/survivor/skills')}>
            Add more skills
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {userSkills.map((s) => (
            <span key={s} className="badge" style={{ padding: '6px 14px', fontSize: 13 }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended Jobs List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>Recommended opportunities</h3>
          <button className="btn-soft" onClick={() => navigate('/survivor/jobs')}>
            View all jobs
          </button>
        </div>
        <div>
          {JOBS.slice(0, 4).map((job) => (
            <div
              key={job.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--line)',
                gap: 16,
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
                  {job.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                  {job.company} · {job.location} · {job.salary}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="badge">{job.posted}</span>
                {appliedJobs.includes(job.id) ? (
                  <span className="badge" style={{ background: 'var(--navy)', color: '#ffffff' }}>Applied</span>
                ) : (
                  <button className="btn-pill" onClick={() => apply(job.id)}>
                    Apply now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
