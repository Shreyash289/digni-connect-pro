import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { resumeService } from '../../services/resumeService'

const LOCAL_STORAGE_KEY = 'carevia_survivor_resume_draft'

const DEFAULT_RESUME = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    summary: ''
  },
  skills: [],
  education: [],
  experience: [],
  certifications: []
}

export default function SurvivorResume() {
  const [resume, setResume] = useState(DEFAULT_RESUME)
  const [skillInput, setSkillInput] = useState('')
  const [draftRestored, setDraftRestored] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState(null)
  const [isDemoUser, setIsDemoUser] = useState(false)

  const userId = localStorage.getItem('userId')
  const userEmail = localStorage.getItem('email') || ''

  useEffect(() => {
    const isDemo = !userId || userEmail.includes('demo') || localStorage.getItem('role') === 'survivor' && !userId
    setIsDemoUser(isDemo)

    // Load local draft first
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        setResume(parsed)
        setDraftRestored(true)
      } catch (err) {
        console.error('Error parsing local draft', err)
      }
    } else {
      // Pre-fill email from logged in user if empty
      setResume((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          email: prev.personal.email || userEmail
        }
      }))
    }

    // Attempt to load from Supabase if authenticated
    if (userId && !isDemo) {
      loadSupabaseResume(userId)
    } else {
      setLoading(false)
    }
  }, [userId, userEmail])

  const loadSupabaseResume = async (uid) => {
    setLoading(true)
    const { data: resumeRecord, unavailable, error } = await resumeService.getSurvivorResume(uid)

    if (unavailable) {
      setStatusMessage({ type: 'warning', text: 'Backend storage for resumes is currently unavailable. Using local draft mode.' })
    } else if (error) {
      console.warn('Supabase resume query error:', error)
    } else if (resumeRecord) {
      const { data: resumeData } = await resumeService.getResumeData(resumeRecord.id)
      if (resumeData && resumeData.content) {
        setResume(resumeData.content)
      } else if (resumeRecord.content) {
        setResume(resumeRecord.content)
      }
    }
    setLoading(false)
  }

  // Save to LocalStorage automatically whenever resume updates
  useEffect(() => {
    if (JSON.stringify(resume) !== JSON.stringify(DEFAULT_RESUME)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resume))
    }
  }, [resume])

  const handlePersonalChange = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }))
  }

  // Skill Handlers
  const handleAddSkill = (e) => {
    if (e) e.preventDefault()
    const trimmed = skillInput.trim()
    if (!trimmed) return
    if (!resume.skills.includes(trimmed)) {
      setResume((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }))
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }))
  }

  // Education Handlers
  const handleAddEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now().toString(), institution: '', degree: '', startDate: '', endDate: '', description: '' }
      ]
    }))
  }

  const handleUpdateEducation = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }))
  }

  const handleRemoveEducation = (id) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id)
    }))
  }

  // Experience Handlers
  const handleAddExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '' }
      ]
    }))
  }

  const handleUpdateExperience = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }))
  }

  const handleRemoveExperience = (id) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id)
    }))
  }

  // Certification Handlers
  const handleAddCertification = () => {
    setResume((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { id: Date.now().toString(), name: '', issuer: '', date: '' }
      ]
    }))
  }

  const handleUpdateCertification = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }))
  }

  const handleRemoveCertification = (id) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id)
    }))
  }

  // Supabase Save Handler
  const handleSaveSupabase = async () => {
    if (isDemoUser) {
      setStatusMessage({
        type: 'info',
        text: 'Sign in with your account to save online. Your draft is saved locally.'
      })
      return
    }

    setSaving(true)
    setStatusMessage(null)

    // Save header record
    const { data: header, error: headerErr, unavailable } = await resumeService.saveResume({
      survivor_id: userId,
      title: resume.personal.headline || 'Survivor Resume',
      updated_at: new Date().toISOString()
    })

    if (unavailable) {
      setStatusMessage({
        type: 'warning',
        text: 'Backend storage is currently unavailable. Your changes remain saved in your browser draft.'
      })
      setSaving(false)
      return
    }

    if (headerErr) {
      setStatusMessage({ type: 'error', text: `Failed to save resume: ${headerErr}` })
      setSaving(false)
      return
    }

    if (header) {
      // Save full structured content
      const { error: dataErr } = await resumeService.saveResumeData({
        resume_id: header.id,
        content: resume,
        updated_at: new Date().toISOString()
      })

      if (dataErr) {
        setStatusMessage({ type: 'error', text: `Failed to save resume data: ${dataErr}` })
      } else {
        setStatusMessage({ type: 'success', text: 'Resume successfully saved to your account!' })
      }
    }
    setSaving(false)
  }

  // Print Handler
  const handlePrint = () => {
    window.print()
  }

  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear your local resume draft?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      setResume(DEFAULT_RESUME)
      setDraftRestored(false)
      setStatusMessage({ type: 'info', text: 'Resume draft cleared.' })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink2)' }}>
          Loading your resume data...
        </div>
      </Layout>
    )
  }

  const { personal, skills, education, experience, certifications } = resume

  return (
    <Layout>
      {/* CSS for print mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-preview-document, .resume-preview-document * {
            visibility: visible;
          }
          .resume-preview-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header and Controls */}
      <div className="no-print" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 24 }}>
              Survivor Resume Builder
            </h2>
            <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
              Create, customize, and export a professional resume tailored for career growth.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handlePrint}
              className="btn-soft"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect width="12" height="8" x="6" y="14"/>
              </svg>
              Print / Save as PDF
            </button>

            <button
              onClick={handleSaveSupabase}
              disabled={saving}
              className="btn-primary"
              style={{ padding: '9px 20px' }}
            >
              {saving ? 'Saving...' : 'Save Resume'}
            </button>

            {draftRestored && (
              <button
                onClick={clearDraft}
                className="btn-soft"
                style={{ padding: '9px 14px', fontSize: 13, color: '#c53030' }}
                title="Reset local draft"
              >
                Clear Draft
              </button>
            )}
          </div>
        </div>

        {/* Status Notifications */}
        {draftRestored && !statusMessage && (
          <div style={{ padding: '8px 14px', borderRadius: 'var(--r-subtle)', background: 'var(--mist)', color: 'var(--navy)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Note:</span> Local draft restored from your previous browser session.
          </div>
        )}

        {isDemoUser && (
          <div style={{ padding: '10px 16px', borderRadius: 'var(--r-card)', background: 'rgba(11, 27, 63, 0.04)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--royal)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span><strong>Demo Mode:</strong> Sign in with your account to save online. Your draft is automatically saved in your browser.</span>
          </div>
        )}

        {statusMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--r-card)',
              fontSize: 14,
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
      </div>

      {/* Main Grid: Form on Left, Live Resume on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
          gap: 24,
          alignItems: 'start'
        }}
        className="resume-builder-grid"
      >
        {/* Left Side: Form Editor */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Personal Information */}
          <div className="card">
            <h3 style={{ color: 'var(--navy)', marginTop: 0, marginBottom: 16, fontSize: 16 }}>
              1. Personal Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Jane Doe"
                  value={personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="jane@example.com"
                    value={personal.email}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+1 (555) 000-0000"
                    value={personal.phone}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. New York, NY"
                  value={personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Professional Headline</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Administrative Assistant | Customer Support Specialist"
                  value={personal.headline}
                  onChange={(e) => handlePersonalChange('headline', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Professional Summary</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Brief summary of your background, strengths, and career objective..."
                  value={personal.summary}
                  onChange={(e) => handlePersonalChange('summary', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Skills */}
          <div className="card">
            <h3 style={{ color: 'var(--navy)', marginTop: 0, marginBottom: 16, fontSize: 16 }}>
              2. Skills
            </h3>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                type="text"
                className="input"
                placeholder="Type a skill (e.g. Microsoft Excel, Data Entry)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
              />
              <button type="submit" className="btn-soft" style={{ flexShrink: 0, padding: '0 16px' }}>
                Add Skill
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.length === 0 ? (
                <span style={{ fontSize: 13, color: 'var(--ink2)', italic: 'true' }}>
                  No skills added yet. Type a skill above and click Add Skill.
                </span>
              ) : (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    className="badge"
                    style={{
                      background: 'var(--mist)',
                      color: 'var(--navy)',
                      padding: '6px 12px',
                      borderRadius: 'var(--r-pill)',
                      fontSize: 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
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
                        fontSize: 14,
                        lineHeight: 1
                      }}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Education */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 16 }}>
                3. Education
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn-soft"
                style={{ fontSize: 13, padding: '6px 12px' }}
              >
                + Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                No education added yet. Click "+ Add Education" to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {education.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,
                      borderRadius: 'var(--r-subtle)',
                      border: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                        Education #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c53030',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label className="label">Institution</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Community College"
                          value={item.institution}
                          onChange={(e) => handleUpdateEducation(item.id, 'institution', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Degree / Course</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Associate in Business"
                          value={item.degree}
                          onChange={(e) => handleUpdateEducation(item.id, 'degree', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label className="label">Start Date</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. 2021"
                          value={item.startDate}
                          onChange={(e) => handleUpdateEducation(item.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">End Date</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. 2023 or Present"
                          value={item.endDate}
                          onChange={(e) => handleUpdateEducation(item.id, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Description / Achievements</label>
                      <textarea
                        className="input"
                        rows={2}
                        placeholder="Key courses, honors, or activities..."
                        value={item.description}
                        onChange={(e) => handleUpdateEducation(item.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Experience */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 16 }}>
                4. Experience
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn-soft"
                style={{ fontSize: 13, padding: '6px 12px' }}
              >
                + Add Experience
              </button>
            </div>

            {experience.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                No experience added yet. Click "+ Add Experience" to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {experience.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,
                      borderRadius: 'var(--r-subtle)',
                      border: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                        Experience #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c53030',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label className="label">Organization / Company</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Acme Corp"
                          value={item.company}
                          onChange={(e) => handleUpdateExperience(item.id, 'company', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Role / Title</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Office Specialist"
                          value={item.role}
                          onChange={(e) => handleUpdateExperience(item.id, 'role', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label className="label">Start Date</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Jan 2022"
                          value={item.startDate}
                          onChange={(e) => handleUpdateExperience(item.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">End Date</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Present"
                          value={item.endDate}
                          onChange={(e) => handleUpdateExperience(item.id, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Description / Key Responsibilities</label>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Bullet points or summary of your achievements and daily tasks..."
                        value={item.description}
                        onChange={(e) => handleUpdateExperience(item.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Certifications */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: 16 }}>
                5. Certifications
              </h3>
              <button
                type="button"
                onClick={handleAddCertification}
                className="btn-soft"
                style={{ fontSize: 13, padding: '6px 12px' }}
              >
                + Add Certification
              </button>
            </div>

            {certifications.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>
                No certifications added yet. Click "+ Add Certification" to add credentials.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {certifications.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,
                      borderRadius: 'var(--r-subtle)',
                      border: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                        Certification #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c53030',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label className="label">Certification Name</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Project Management Prep"
                          value={item.name}
                          onChange={(e) => handleUpdateCertification(item.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Issuing Organization</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. CareVia Vocational Institute"
                          value={item.issuer}
                          onChange={(e) => handleUpdateCertification(item.id, 'issuer', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Date Issued</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. 2023"
                        value={item.date}
                        onChange={(e) => handleUpdateCertification(item.id, 'date', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Printable Resume Preview Document */}
        <div
          style={{
            position: 'sticky',
            top: 16,
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto'
          }}
          className="resume-preview-container"
        >
          <div
            className="card resume-preview-document"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--r-card)',
              border: '1px solid var(--line)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              padding: '32px 36px',
              color: '#1a202c',
              fontFamily: 'Inter, system-ui, sans-serif',
              minHeight: 600
            }}
          >
            {/* Header Document Section */}
            <div style={{ borderBottom: '2px solid var(--navy)', paddingBottom: 16, marginBottom: 20 }}>
              <h1 style={{ color: 'var(--navy)', margin: '0 0 6px 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.3px' }}>
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.headline && (
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--royal)', marginBottom: 8 }}>
                  {personal.headline}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: '#4a5568' }}>
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
                {personal.location && <span>• {personal.location}</span>}
              </div>
            </div>

            {/* Summary Section */}
            {personal.summary && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.8px', color: 'var(--navy)', borderBottom: '1px solid var(--line)', paddingBottom: 4, marginBottom: 8 }}>
                  Professional Summary
                </h4>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: '#2d3748', margin: 0, whiteSpace: 'pre-line' }}>
                  {personal.summary}
                </p>
              </div>
            )}

            {/* Skills Section */}
            {skills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.8px', color: 'var(--navy)', borderBottom: '1px solid var(--line)', paddingBottom: 4, marginBottom: 10 }}>
                  Core Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#edf2f7',
                        color: '#2d3748',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.8px', color: 'var(--navy)', borderBottom: '1px solid var(--line)', paddingBottom: 4, marginBottom: 12 }}>
                  Experience
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>
                          {exp.role || 'Role Title'}
                        </span>
                        <span style={{ fontSize: 12, color: '#718096' }}>
                          {exp.startDate} {exp.startDate && exp.endDate ? '–' : ''} {exp.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--royal)', marginBottom: 4 }}>
                        {exp.company}
                      </div>
                      {exp.description && (
                        <p style={{ fontSize: 12, lineHeight: 1.5, color: '#4a5568', margin: 0, whiteSpace: 'pre-line' }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.8px', color: 'var(--navy)', borderBottom: '1px solid var(--line)', paddingBottom: 4, marginBottom: 12 }}>
                  Education
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>
                          {edu.degree || 'Degree / Certificate'}
                        </span>
                        <span style={{ fontSize: 12, color: '#718096' }}>
                          {edu.startDate} {edu.startDate && edu.endDate ? '–' : ''} {edu.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#4a5568' }}>
                        {edu.institution}
                      </div>
                      {edu.description && (
                        <p style={{ fontSize: 12, lineHeight: 1.4, color: '#718096', margin: '2px 0 0 0' }}>
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {certifications.length > 0 && (
              <div>
                <h4 style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.8px', color: 'var(--navy)', borderBottom: '1px solid var(--line)', paddingBottom: 4, marginBottom: 10 }}>
                  Certifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {certifications.map((cert) => (
                    <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <div>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{cert.name}</span>
                        {cert.issuer && <span style={{ color: '#718096' }}> ({cert.issuer})</span>}
                      </div>
                      {cert.date && <span style={{ color: '#718096' }}>{cert.date}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state prompt inside preview if nothing entered */}
            {!personal.fullName && !personal.summary && skills.length === 0 && experience.length === 0 && education.length === 0 && certifications.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0' }}>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Start typing your information in the editor to see your live resume preview update instantly here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global CSS for Mobile Responsiveness (~375px) */}
      <style>{`
        @media (max-width: 900px) {
          .resume-builder-grid {
            grid-template-columns: 1fr !important;
          }
          .resume-preview-container {
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>
    </Layout>
  )
}
