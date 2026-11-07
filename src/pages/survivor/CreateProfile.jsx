import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ErrorBanner, Loading } from '../../components/ui'
import { getMySurvivor, saveMySurvivorProfile, SKILL_SUGGESTIONS as ALL_SKILLS } from '../../lib/careers'
import ConsentForm from '../../components/ConsentForm'

const STEPS = ['Personal Details', 'Skills & Education', 'Work Experience', 'Documents', 'Privacy & Consent']
const EDUCATION = ['Class 5 Pass', 'Class 8 Pass', 'Class 10 Pass', 'Class 12 Pass', 'Diploma', 'ITI Certificate', 'Graduate', 'Post Graduate']
const YEARS = ['Less than 1 year', '1–2 years', '2–3 years', '3–5 years', '5+ years']

const split = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)

function fromSurvivor(s) {
  const work = Array.isArray(s.work_history) && s.work_history[0] ? s.work_history[0] : {}
  const certs = Array.isArray(s.certifications) ? s.certifications.map((c) => c?.name).filter(Boolean) : []
  return {
    fullName: s.full_name ?? '',
    age: s.age ? String(s.age) : '',
    city: s.city ?? '',
    state: s.state ?? '',
    phone: s.phone ?? '',
    languages: (s.languages ?? []).join(', '),
    jobRole: (s.preferred_roles ?? []).join(', '),
    education: s.education_level ?? '',
    certification: certs.join(', '),
    selectedSkills: s.skills ?? [],
    company: work.company ?? '',
    role: work.role ?? '',
    years: s.total_experience ?? '',
    description: work.description ?? '',
    bio: s.bio ?? '',
    availability: s.availability ?? '',
    accommodation: s.accommodation_needs ?? '',
    visible: !!s.consent_share_with_recruiters,
  }
}

export default function CreateProfile() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(null)
  const [completion, setCompletion] = useState(0)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMySurvivor()
      .then((s) => { setForm(fromSurvivor(s)); setCompletion(s.profile_completion ?? 0) })
      .catch((err) => setLoadError(err.message || 'Could not load your profile.'))
  }, [])

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleSkill = (s) => update('selectedSkills', form.selectedSkills.includes(s) ? form.selectedSkills.filter((x) => x !== s) : [...form.selectedSkills, s])
  const skillOptions = [...new Set([...ALL_SKILLS, ...(form?.selectedSkills ?? [])])]

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setStep(0)
      return setError('Please enter your name.')
    }
    setSaving(true)
    setError('')
    try {
      const hasWork = form.company.trim() || form.role.trim() || form.description.trim()
      const s = await saveMySurvivorProfile({
        full_name: form.fullName,
        age: form.age,
        phone: form.phone,
        city: form.city,
        state: form.state,
        languages: split(form.languages),
        skills: form.selectedSkills,
        preferred_roles: split(form.jobRole),
        education_level: form.education,
        certifications: split(form.certification).map((name) => ({ name })),
        work_history: hasWork ? [{ company: form.company.trim(), role: form.role.trim(), description: form.description.trim() }] : [],
        total_experience: form.years,
        bio: form.bio,
        availability: form.availability,
        accommodation_needs: form.accommodation,
        consent_share_with_recruiters: form.visible,
      })
      setCompletion(s.profile_completion ?? 0)
      setSaved(true)
      setTimeout(() => navigate('/survivor'), 1500)
    } catch (err) {
      setError(err.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  const label = { fontSize: 13, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 6 }

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>My Profile</h2>
            <p style={{ fontSize: 14, color: 'var(--ink2)' }}>Build a complete, dignified profile that employers can review.</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 11, color: 'var(--ink2)', marginBottom: 4 }}>Profile {completion}% complete</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>

        <ErrorBanner message={loadError || error} />

        {!form ? (!loadError && <Loading label="Loading your profile…" />) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
              {STEPS.map((s, idx) => (
                <button
                  key={s}
                  onClick={() => setStep(idx)}
                  className="tab-pill"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: step === idx ? 'var(--navy)' : 'var(--mist)',
                    color: step === idx ? '#fff' : 'var(--navy)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {idx + 1}. {s}
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: 28 }}>
              {step === 0 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--navy)' }}>Personal Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>Full Name *</label>
                      <input className="input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="First & Last Name" />
                    </div>
                    <div>
                      <label style={label}>Age</label>
                      <input className="input" type="number" value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="e.g. 26" />
                    </div>
                    <div>
                      <label style={label}>Phone (Private)</label>
                      <input className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 …" />
                    </div>
                    <div>
                      <label style={label}>City</label>
                      <input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g. Bengaluru" />
                    </div>
                    <div>
                      <label style={label}>State</label>
                      <input className="input" value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="e.g. Karnataka" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>Languages Spoken</label>
                      <input className="input" value={form.languages} onChange={(e) => update('languages', e.target.value)} placeholder="Kannada, English, Hindi" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>Preferred Job Roles (comma-separated)</label>
                      <input className="input" value={form.jobRole} onChange={(e) => update('jobRole', e.target.value)} placeholder="Data Entry, Retail Sales, Hospitality" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>About You (Bio)</label>
                      <textarea className="input" rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="A brief introduction highlighting your dedication and strengths…" style={{ resize: 'none' }} />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--navy)' }}>Skills & Education</h3>
                  <div style={{ marginBottom: 20 }}>
                    <label style={label}>Select Your Skills</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {skillOptions.map((s) => {
                        const active = form.selectedSkills.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSkill(s)}
                            className="tag-pill"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 999,
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: active ? 'var(--royal)' : 'var(--mist)',
                              color: active ? '#fff' : 'var(--navy)',
                            }}
                          >
                            {active ? '✓ ' : ''}{s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={label}>Highest Education Level</label>
                      <select className="select" style={{ width: '100%' }} value={form.education} onChange={(e) => update('education', e.target.value)}>
                        <option value="">Select…</option>
                        {EDUCATION.map((ed) => <option key={ed}>{ed}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={label}>Certifications</label>
                      <input className="input" value={form.certification} onChange={(e) => update('certification', e.target.value)} placeholder="Basic Computers, Tally…" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--navy)' }}>Work Experience</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={label}>Company / Employer</label>
                      <input className="input" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Company name or Self-employed" />
                    </div>
                    <div>
                      <label style={label}>Role / Position</label>
                      <input className="input" value={form.role} onChange={(e) => update('role', e.target.value)} placeholder="Your role title" />
                    </div>
                    <div>
                      <label style={label}>Total Experience</label>
                      <select className="select" style={{ width: '100%' }} value={form.years} onChange={(e) => update('years', e.target.value)}>
                        <option value="">Select…</option>
                        {YEARS.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>Description of Work</label>
                      <textarea className="input" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} style={{ resize: 'none' }} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>Documents</h3>
                  <div style={{ padding: 20, background: 'var(--mist)', borderRadius: 12, border: '1px solid var(--line)', marginBottom: 20 }}>
                    <div style={{ fontSize: 14, color: 'var(--navy)', fontWeight: 600, marginBottom: 6 }}>Document Vault</div>
                    <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 14 }}>
                      Your ID, education certificates, and resumes are protected in your encrypted private Document Vault.
                      Verified employers and partner NGOs can only review documents you explicitly share.
                    </div>
                    <Link to="/survivor/docs" className="cv-pill" style={{ textDecoration: 'none' }}>
                      Open Document Vault →
                    </Link>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <ConsentForm role="survivor" mode="review" />
                </div>
              )}

              {saved && (
                <div style={{ position: 'fixed', top: 20, right: 20, background: 'var(--navy)', color: '#fff', padding: '14px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
                  Profile saved! Redirecting to dashboard…
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--mist)', gap: 8 }}>
                <button className="btn-secondary" onClick={() => (step === 0 ? navigate('/survivor') : setStep((s) => s - 1))}>
                  ← {step === 0 ? 'Cancel' : 'Previous'}
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  {step < STEPS.length - 1 && (
                    <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>Next: {STEPS[step + 1]} →</button>
                  )}
                  <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: 'var(--navy)', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving…' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
