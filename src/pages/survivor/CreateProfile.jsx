import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ErrorBanner, Loading } from '../../components/ui'
import { ALL_SKILLS } from '../../data/mockData'
import { getMySurvivor, saveMySurvivorProfile } from '../../lib/careers'

const STEPS = ['Personal Details', 'Skills & Education', 'Work Experience', 'Visibility & Documents']
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

  const label = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>My Profile</h1>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Build a complete, dignified profile that employers can review.</p>
          </div>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>Profile {completion}% complete</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>

        <ErrorBanner message={loadError || error} />

        {!form ? (!loadError && <Loading label="Loading your profile…" />) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'todo'}`} style={{ cursor: 'pointer' }} onClick={() => setStep(i)}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: i === step ? '#2563EB' : i < step ? '#059669' : '#9CA3AF', whiteSpace: 'nowrap' }}>{s}</div>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#059669' : '#E5E7EB', margin: '0 8px', marginBottom: 20 }} />}
                </div>
              ))}
            </div>

            <div className="card fade-in" style={{ padding: 32 }} key={step}>
              {step === 0 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Personal Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                      { label: 'Full Name *', key: 'fullName', placeholder: 'Your full name' },
                      { label: 'Age', key: 'age', placeholder: 'Your age', type: 'number' },
                      { label: 'City', key: 'city', placeholder: 'Chennai' },
                      { label: 'State', key: 'state', placeholder: 'Tamil Nadu' },
                      { label: 'Phone Number (private)', key: 'phone', placeholder: '+91 XXXXX XXXXX' },
                      { label: 'Languages Spoken', key: 'languages', placeholder: 'Tamil, English, Hindi' },
                      { label: 'Preferred Job Roles', key: 'jobRole', placeholder: 'Data Entry Operator, Tailor' },
                      { label: 'Availability', key: 'availability', placeholder: 'Immediately / from next month' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={label}>{f.label}</label>
                        <input className="input" type={f.type ?? 'text'} value={form[f.key]} placeholder={f.placeholder} onChange={(e) => update(f.key, e.target.value)} />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>About you</label>
                      <textarea className="input" rows={3} placeholder="A few lines about you and the work you're looking for" value={form.bio} onChange={(e) => update('bio', e.target.value)} style={{ resize: 'none' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={label}>Special Accommodations / Needs (optional, private)</label>
                      <textarea className="input" rows={2} placeholder="Any special requirements or accommodations…" value={form.accommodation} onChange={(e) => update('accommodation', e.target.value)} style={{ resize: 'none' }} />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Skills & Education</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Select all skills that apply to you. Click to select or deselect.</p>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {skillOptions.map((s) => (
                        <span key={s} className={`skill-tag ${form.selectedSkills.includes(s) ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleSkill(s)}>
                          {form.selectedSkills.includes(s) ? '✓ ' : ''}{s}
                        </span>
                      ))}
                    </div>
                    {form.selectedSkills.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 13, color: '#059669', fontWeight: 500 }}>
                        ✓ {form.selectedSkills.length} skill{form.selectedSkills.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={label}>Highest Education</label>
                      <select className="select" style={{ width: '100%' }} value={form.education} onChange={(e) => update('education', e.target.value)}>
                        <option value="">Select…</option>
                        {EDUCATION.map((e) => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={label}>Certifications (comma separated)</label>
                      <input className="input" placeholder="e.g. ITI Certificate, Tally Course" value={form.certification} onChange={(e) => update('certification', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Work Experience</h3>
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
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Visibility & Documents</h3>
                  <label style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${form.visible ? '#7C3AED' : '#E5E7EB'}`, background: form.visible ? '#F5F3FF' : '#fff', marginBottom: 20 }}>
                    <input type="checkbox" checked={form.visible} onChange={(e) => update('visible', e.target.checked)} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F' }}>Visible to recruiters</div>
                      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, marginTop: 2 }}>
                        Recruiters can find you in Talent Search and invite you to interviews. They see only your first name and last initial,
                        age, city, skills, education and experience — never your phone, email or documents. You can turn this off at any time.
                        Recruiters you apply to can always see your profile.
                      </div>
                    </div>
                  </label>
                  <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 8, border: '0.5px solid #BBF7D0' }}>
                    <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 4 }}>📂 Documents</div>
                    <div style={{ fontSize: 12, color: '#166534', marginBottom: 10 }}>Upload your ID, certificates and resume in your private Document Vault.</div>
                    <Link to="/survivor/docs" style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>Open Document Vault →</Link>
                  </div>
                </div>
              )}

              {saved && (
                <div style={{ position: 'fixed', top: 20, right: 20, background: '#059669', color: '#fff', padding: '14px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
                  ✅ Profile saved! Redirecting to dashboard…
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '0.5px solid #F3F4F6', gap: 8 }}>
                <button className="btn-secondary" onClick={() => (step === 0 ? navigate('/survivor') : setStep((s) => s - 1))}>
                  ← {step === 0 ? 'Cancel' : 'Previous'}
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  {step < STEPS.length - 1 && (
                    <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>Next: {STEPS[step + 1]} →</button>
                  )}
                  <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#059669', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving…' : '✓ Save Profile'}
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
