import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { learningService } from '../../services/learningService'

const LOCAL_STORAGE_SKILLS_KEY = 'carevia_survivor_skills_draft'

export default function SurvivorSkills() {
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [isDemoUser, setIsDemoUser] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)

  const userId = localStorage.getItem('userId')
  const userEmail = localStorage.getItem('email') || ''

  useEffect(() => {
    const isDemo = !userId || userEmail.includes('demo')
    setIsDemoUser(isDemo)

    // Check localStorage draft first
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSkills(parsed)
          setDraftRestored(true)
        }
      } catch (err) {
        console.error('Error loading local skills draft', err)
      }
    }

    if (userId && !isDemo) {
      loadServerSkills(userId)
    } else {
      setLoading(false)
    }
  }, [userId, userEmail])

  const loadServerSkills = async (uid) => {
    setLoading(true)
    const { data, error, unavailable } = await learningService.getSurvivorSkills(uid)

    if (unavailable) {
      setStatusMessage({
        type: 'warning',
        text: 'Skills database service is currently unavailable. Using local skills draft.'
      })
    } else if (error) {
      console.warn('Error loading skills:', error)
    } else if (data && data.length > 0) {
      // Format array of skill records into skill strings
      const skillList = data.map((item) => (typeof item === 'string' ? item : item.skill_name || item.name || '')).filter(Boolean)
      if (skillList.length > 0) {
        setSkills(skillList)
      }
    }
    setLoading(false)
  }

  // Save to LocalStorage whenever skills change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SKILLS_KEY, JSON.stringify(skills))
  }, [skills])

  const handleAddSkill = (e) => {
    if (e) e.preventDefault()
    const trimmed = skillInput.trim()
    if (!trimmed) return

    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...skills, trimmed]
      setSkills(updated)
      setStatusMessage({ type: 'info', text: 'Skill added to list.' })
    } else {
      setStatusMessage({ type: 'warning', text: 'This skill is already in your profile.' })
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove)
    setSkills(updated)
    setStatusMessage({ type: 'info', text: 'Skill removed.' })
  }

  const handleSaveSkills = async () => {
    if (isDemoUser) {
      setStatusMessage({
        type: 'info',
        text: 'Sign in with your account to save online. Your skills are saved in your browser.'
      })
      return
    }

    setSaving(true)
    setStatusMessage(null)

    const payload = skills.map((skillName) => ({
      survivor_id: userId,
      skill_name: skillName,
      updated_at: new Date().toISOString()
    }))

    const { data, error, unavailable } = await learningService.saveSurvivorSkills(payload)

    if (unavailable) {
      setStatusMessage({
        type: 'warning',
        text: 'Backend skills service is unavailable. Skills are preserved locally in your browser.'
      })
    } else if (error) {
      setStatusMessage({
        type: 'error',
        text: `Failed to save skills: ${error}`
      })
    } else {
      setStatusMessage({
        type: 'success',
        text: 'Skills successfully saved to your profile!'
      })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink2)' }}>
          Loading your skills profile...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 24 }}>
            Skills Profile
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
            Manage your professional competencies to get tailored job matches and course recommendations.
          </p>
        </div>

        <button
          onClick={handleSaveSkills}
          disabled={saving}
          className="btn-primary"
          style={{ padding: '9px 22px' }}
        >
          {saving ? 'Saving...' : 'Save Skills'}
        </button>
      </div>

      {/* Intro Explanation Card */}
      <div className="card-light" style={{ padding: 20, marginBottom: 24, borderRadius: 'var(--r-card)' }}>
        <h4 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 15 }}>
          Why Skills Matter
        </h4>
        <p style={{ color: 'var(--ink)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          Your skills are automatically cross-referenced with recruiter searches, job requirements, and CareVia course recommendations to help you find the best career growth opportunities.
        </p>
      </div>

      {/* Notification Banners */}
      {statusMessage && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 'var(--r-card)',
            fontSize: 13,
            background:
              statusMessage.type === 'error'
                ? '#fff5f5'
                : statusMessage.type === 'success'
                ? '#f0fff4'
                : statusMessage.type === 'warning'
                ? '#fffaf0'
                : 'var(--mist)',
            color:
              statusMessage.type === 'error'
                ? '#c53030'
                : statusMessage.type === 'success'
                ? '#276749'
                : statusMessage.type === 'warning'
                ? '#9c4221'
                : 'var(--navy)',
            border: `1px solid ${
              statusMessage.type === 'error'
                ? '#feb2b2'
                : statusMessage.type === 'success'
                ? '#9ae6b4'
                : statusMessage.type === 'warning'
                ? '#fbd38d'
                : 'var(--line)'
            }`
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {isDemoUser && (
        <div style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 'var(--r-card)', background: 'rgba(11, 27, 63, 0.04)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--royal)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span><strong>Demo Mode:</strong> Sign in with your account to save online. Your added skills are saved in your browser session.</span>
        </div>
      )}

      {/* Add Skill Form */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--navy)', margin: '0 0 14px 0', fontSize: 16 }}>
          Add a New Skill
        </h3>
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Type a skill (e.g. Communication, Data Entry, Accounting)..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            style={{ flex: '1 1 280px' }}
          />
          <button type="submit" className="btn-pill" style={{ padding: '10px 24px' }}>
            Add Skill
          </button>
        </form>
      </div>

      {/* Current Skills List */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 16 }}>
            Your Saved Skills
          </h3>
          <span className="badge">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {skills.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--ink2)' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: 14 }}>
              No skills added to your profile yet.
            </p>
            <p style={{ margin: 0, fontSize: 13 }}>
              Use the form above to type and add your key skills and qualifications.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  background: 'var(--mist)',
                  color: 'var(--navy)',
                  padding: '8px 16px',
                  borderRadius: 'var(--r-pill)',
                  fontSize: 14,
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid var(--line)'
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink2)',
                    padding: 0,
                    fontSize: 16,
                    lineHeight: 1
                  }}
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
