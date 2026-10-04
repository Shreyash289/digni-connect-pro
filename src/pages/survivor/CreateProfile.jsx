import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ALL_SKILLS } from '../../data/mockData'

const STEPS = ['Personal details', 'Skills & education', 'Work experience', 'Documents']

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
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
            Create candidate profile
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
            Build a complete, verified profile for verified employer matching
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
          {STEPS.map((s, i) => {
            const isDone = i < step
            const isActive = i === step
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: i <= step ? 'pointer' : 'default' }}
                  onClick={() => i <= step && setStep(i)}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--r-pill)',
                      background: isActive ? 'var(--navy)' : isDone ? 'var(--royal)' : 'var(--mist)',
                      color: isActive || isDone ? '#ffffff' : 'var(--ink2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--navy)' : 'var(--ink2)', whiteSpace: 'nowrap' }}>
                    {s}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: isDone ? 'var(--royal)' : 'var(--line)', margin: '0 12px 20px', minWidth: 24 }} />
                )}
              </div>
            )
          })}
        </div>

        <div className="card" key={step}>
          {/* STEP 0: Personal Details */}
          {step === 0 && (
            <div>
              <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Personal details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                {[
                  { label: 'Full name', key: 'fullName', placeholder: 'Your full name' },
                  { label: 'Age', key: 'age', placeholder: 'Your age' },
                  { label: 'Location (city, state)', key: 'location', placeholder: 'Chennai, Tamil Nadu' },
                  { label: 'Phone number', key: 'phone', placeholder: '+91 XXXXX XXXXX' },
                  { label: 'Languages spoken', key: 'languages', placeholder: 'Tamil, English, Hindi' },
                  { label: 'Preferred job role', key: 'jobRole', placeholder: 'Data Entry Operator' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                    <input className="input" value={form[f.key]} placeholder={f.placeholder} onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Supporting NGO partner</label>
                  <select className="input" value={form.ngo} onChange={e => update('ngo', e.target.value)} style={{ cursor: 'pointer' }}>
                    <option>Asha Foundation</option>
                    <option>Navjyoti NGO</option>
                    <option>RRU Partner Cell</option>
                    <option>Shakti Sewa</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Special accommodations or notes (optional)</label>
                  <textarea className="input" rows={3} placeholder="Any special requirements or accommodations..." value={form.accommodation} onChange={e => update('accommodation', e.target.value)} style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Skills & Education */}
          {step === 1 && (
            <div>
              <h3 style={{ color: 'var(--navy)', marginBottom: 6 }}>Skills and education</h3>
              <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 20 }}>Select all applicable skills below to match with open roles.</p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 10 }}>Select skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ALL_SKILLS.map(s => {
                    const selected = form.selectedSkills.includes(s)
                    return (
                      <span
                        key={s}
                        className="badge"
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          background: selected ? 'var(--navy)' : 'var(--mist)',
                          color: selected ? '#ffffff' : 'var(--navy)',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => toggleSkill(s)}
                      >
                        {selected ? '✓ ' : ''}{s}
                      </span>
                    )
                  })}
                </div>
                {form.selectedSkills.length > 0 && (
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--royal)', fontWeight: 500 }}>
                    {form.selectedSkills.length} skill{form.selectedSkills.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>Education level</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Highest completed education</label>
                    <select className="input" value={form.education} onChange={e => update('education', e.target.value)} style={{ cursor: 'pointer' }}>
                      <option>Class 5 Pass</option><option>Class 8 Pass</option><option>Class 10 Pass</option>
                      <option>Class 12 Pass</option><option>Diploma</option><option>Graduate</option><option>Post Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Certifications (if any)</label>
                    <input className="input" placeholder="e.g. ITI Certificate, Computer Literacy" value={form.certification} onChange={e => update('certification', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Work Experience */}
          {step === 2 && (
            <div>
              <h3 style={{ color: 'var(--navy)', marginBottom: 20 }}>Work experience</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Company or employer</label>
                  <input className="input" value={form.company} onChange={e => update('company', e.target.value)} placeholder="Company name or self-employed" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Role or position</label>
                  <input className="input" value={form.role} onChange={e => update('role', e.target.value)} placeholder="Role title" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Years of experience</label>
                  <select className="input" value={form.years} onChange={e => update('years', e.target.value)} style={{ cursor: 'pointer' }}>
                    {['0–1 year','1–2 years','2–3 years','3–5 years','5+ years'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Description of work</label>
                  <textarea className="input" rows={4} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div>
              <h3 style={{ color: 'var(--navy)', marginBottom: 6 }}>Document upload</h3>
              <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 20 }}>All documents are securely stored and visible only to verified NGO partners and authorized employers.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Government ID proof', sub: 'Aadhaar card, PAN card, or voter ID', required: true },
                  { label: 'Educational certificate', sub: 'Marksheet, degree, or diploma', required: false },
                  { label: 'Verification certificate', sub: 'Background or NGO verification document', required: true },
                  { label: 'Resume document', sub: 'Current CV or resume file', required: false },
                ].map((doc) => (
                  <div key={doc.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--line)', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                        {doc.label}
                        {doc.required && <span className="badge" style={{ marginLeft: 8, background: 'var(--mist)', color: 'var(--royal)' }}>Required</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{doc.sub}</div>
                    </div>
                    <button className="btn-soft" onClick={() => alert(`Demo: ${doc.label} upload triggered`)}>
                      Upload file
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved confirmation */}
          {saved && (
            <div style={{ marginTop: 20, padding: 14, background: 'var(--mist)', color: 'var(--navy)', borderRadius: 'var(--r-card)', textAlign: 'center', fontWeight: 500, fontSize: 14 }}>
              Profile saved successfully. Redirecting to dashboard...
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)', gap: 12 }}>
            <button className="btn-soft" onClick={() => step === 0 ? navigate('/survivor') : setStep(s => s - 1)}>
              {step === 0 ? 'Cancel' : 'Previous step'}
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn-pill" onClick={() => setStep(s => s + 1)}>
                Next: {STEPS[step + 1]}
              </button>
            ) : (
              <button className="btn-pill" onClick={handleSave}>
                Save profile
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
