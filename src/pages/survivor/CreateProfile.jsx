import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ALL_SKILLS } from '../../data/mockData'

const STEPS = ['Personal Details', 'Skills & Education', 'Work Experience', 'Documents']

export default function CreateProfile() {
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: 'Meena Rajeshwari', age: '28', location: 'Chennai, Tamil Nadu',
    phone: '+91 98765 43210', languages: 'Tamil, English',
    ngo: 'Asha Foundation', jobRole: 'Data Entry Operator',
    education: 'Class 10 Pass', certification: '',
    selectedSkills: ['Data Entry', 'MS Office', 'Tailoring'],
    company: 'Self-employed', role: 'Tailor', years: '2',
    description: 'Worked as a self-employed tailor stitching clothes at home.',
    accommodation: '',
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleSkill = (s) => update('selectedSkills', form.selectedSkills.includes(s) ? form.selectedSkills.filter(x => x !== s) : [...form.selectedSkills, s])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => navigate('/survivor'), 1800)
  }

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>Create Your Profile</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Build a complete, dignified profile that employers can review.</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'todo'}`} style={{ cursor: i <= step ? 'pointer' : 'default' }} onClick={() => i <= step && setStep(i)}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: i === step ? '#2563EB' : i < step ? '#059669' : '#9CA3AF', whiteSpace: 'nowrap' }}>{s}</div>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#059669' : '#E5E7EB', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        <div className="card fade-in" style={{ padding: 32 }} key={step}>

          {/* STEP 0: Personal Details */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Full Name', key: 'fullName', placeholder: 'Your full name' },
                  { label: 'Age', key: 'age', placeholder: 'Your age' },
                  { label: 'Location (City, State)', key: 'location', placeholder: 'Chennai, Tamil Nadu' },
                  { label: 'Phone Number', key: 'phone', placeholder: '+91 XXXXX XXXXX' },
                  { label: 'Languages Spoken', key: 'languages', placeholder: 'Tamil, English, Hindi' },
                  { label: 'Preferred Job Role', key: 'jobRole', placeholder: 'Data Entry Operator' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input className="input" value={form[f.key]} placeholder={f.placeholder} onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>NGO / Government Organization Supporting You</label>
                  <select className="select" value={form.ngo} onChange={e => update('ngo', e.target.value)} style={{ width: '100%' }}>
                    <option>Asha Foundation</option>
                    <option>Navjyoti NGO</option>
                    <option>RRU Partner Cell</option>
                    <option>Shakti Sewa</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Special Accommodations / Needs (Optional)</label>
                  <textarea className="input" rows={3} placeholder="Any special requirements or accommodations..." value={form.accommodation} onChange={e => update('accommodation', e.target.value)} style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Skills & Education */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Skills & Education</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Select all skills that apply to you. Click to select/deselect.</p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_SKILLS.map(s => (
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

              <div style={{ height: 1, background: '#F3F4F6', margin: '20px 0' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 16 }}>Education</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Highest Education</label>
                  <select className="select" style={{ width: '100%' }} value={form.education} onChange={e => update('education', e.target.value)}>
                    <option>Class 5 Pass</option><option>Class 8 Pass</option><option>Class 10 Pass</option>
                    <option>Class 12 Pass</option><option>Diploma</option><option>Graduate</option><option>Post Graduate</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Certifications (if any)</label>
                  <input className="input" placeholder="e.g. ITI Certificate, Tally Course" value={form.certification} onChange={e => update('certification', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Work Experience */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Work Experience</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Company / Employer</label>
                  <input className="input" value={form.company} onChange={e => update('company', e.target.value)} placeholder="Company name or Self-employed" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Role / Position</label>
                  <input className="input" value={form.role} onChange={e => update('role', e.target.value)} placeholder="Your role title" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Years of Experience</label>
                  <select className="select" style={{ width: '100%' }} value={form.years} onChange={e => update('years', e.target.value)}>
                    {['0–1 year','1–2 years','2–3 years','3–5 years','5+ years'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description of Work</label>
                  <textarea className="input" rows={4} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>Document Upload</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>All documents are stored in a secure encrypted vault. Only admin-approved recruiters can request access.</p>
              {[
                { label: 'Government ID Proof', sub: 'Aadhaar Card, PAN Card, or Voter ID', icon: '🪪', required: true },
                { label: 'Educational Certificate', sub: 'Marksheet, Degree, or Diploma', icon: '🎓', required: false },
                { label: 'BGV / Police Verification', sub: 'Background verification document', icon: '🛡️', required: true },
                { label: 'Resume (if available)', sub: 'Existing CV or resume file', icon: '📄', required: false },
                { label: 'Photograph', sub: 'Recent passport size photo', icon: '📸', required: false },
              ].map((doc) => (
                <div key={doc.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '0.5px solid #F3F4F6' }}>
                  <div style={{ fontSize: 24 }}>{doc.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0C1F3F' }}>
                      {doc.label}
                      {doc.required && <span style={{ marginLeft: 6, fontSize: 11, color: '#DC2626', fontWeight: 600 }}>Required</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{doc.sub}</div>
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: '#EFF6FF', color: '#2563EB', border: '0.5px solid #BFDBFE', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => alert(`Demo: ${doc.label} upload triggered`)}>
                    Upload
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: '14px', background: '#F0FDF4', borderRadius: 8, border: '0.5px solid #BBF7D0' }}>
                <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 4 }}>🔒 Your documents are safe</div>
                <div style={{ fontSize: 12, color: '#166534' }}>Stored in Supabase encrypted storage. Role-based access only. You can remove documents at any time.</div>
              </div>
            </div>
          )}

          {/* Saved confirmation */}
          {saved && (
            <div style={{ position: 'fixed', top: 20, right: 20, background: '#059669', color: '#fff', padding: '14px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
              ✅ Profile saved! Redirecting to dashboard...
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '0.5px solid #F3F4F6' }}>
            <button className="btn-secondary" onClick={() => step === 0 ? navigate('/survivor') : setStep(s => s - 1)} style={{ opacity: step === 0 ? 0.4 : 1 }}>
              ← {step === 0 ? 'Cancel' : 'Previous'}
            </button>
            {step < STEPS.length - 1
              ? <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Next: {STEPS[step + 1]} →</button>
              : <button className="btn-primary" onClick={handleSave} style={{ background: '#059669' }}>✓ Save Profile</button>
            }
          </div>
        </div>
      </div>
    </Layout>
  )
}
