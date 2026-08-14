import { useState } from 'react'
import Layout from '../../components/Layout'
import { SURVIVORS } from '../../data/mockData'

const LOCATIONS = ['All Locations', 'Chennai, Tamil Nadu', 'Bengaluru, Karnataka', 'Pondicherry', 'Mumbai, Maharashtra', 'Hyderabad, Telangana', 'Delhi, NCR', 'Kolkata, West Bengal', 'Coimbatore, Tamil Nadu', 'Pune, Maharashtra']
const SKILL_OPTS = ['All Skills', 'Data Entry', 'Tailoring', 'Teaching', 'Carpentry', 'Cooking', 'Accounting', 'Electrical Work', 'Nursing Assistant', 'Embroidery']
const EXP_OPTS = ['All Experience', '0–1 year', '1–3 years', '3–5 years', '5+ years']
const EDU_OPTS = ['All Education', 'Class 10 Pass', 'Class 12 Pass', 'Diploma', 'ITI Certificate', 'Graduate', 'Post Graduate']

export default function RecruiterDashboard() {
  const [search, setSearch] = useState('')
  const [loc, setLoc] = useState('All Locations')
  const [skill, setSkill] = useState('All Skills')
  const [exp, setExp] = useState('All Experience')
  const [edu, setEdu] = useState('All Education')
  const [shortlisted, setShortlisted] = useState([])
  const [selected, setSelected] = useState(null)

  const toggleShortlist = (id) => setShortlisted(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const filtered = SURVIVORS.filter(s => {
    if (s.status === 'draft') return false
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.skills.some(sk => sk.toLowerCase().includes(q)) || s.location.toLowerCase().includes(q) || s.jobRole.toLowerCase().includes(q)
    const matchLoc = loc === 'All Locations' || s.location === loc
    const matchSkill = skill === 'All Skills' || s.skills.some(sk => sk.includes(skill))
    return matchSearch && matchLoc && matchSkill
  })

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>Talent Discovery</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Search and filter verified survivor profiles. All results are admin-approved.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Available', value: SURVIVORS.filter(s => s.status === 'approved').length, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Shortlisted', value: shortlisted.length, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Search Results', value: filtered.length, color: '#0D9488', bg: '#F0FDFA' },
          { label: 'Interviews Requested', value: 3, color: '#D97706', bg: '#FFFBEB' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg, border: 'none' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" style={{ flex: '1 1 220px', minWidth: 200 }} placeholder="🔍  Search by name, skill, location, or role..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="select" value={loc} onChange={e => setLoc(e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className="select" value={skill} onChange={e => setSkill(e.target.value)}>
            {SKILL_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select" value={exp} onChange={e => setExp(e.target.value)}>
            {EXP_OPTS.map(e => <option key={e}>{e}</option>)}
          </select>
          <select className="select" value={edu} onChange={e => setEdu(e.target.value)}>
            {EDU_OPTS.map(e => <option key={e}>{e}</option>)}
          </select>
          <button className="btn-secondary" style={{ padding: '9px 16px', fontSize: 13 }} onClick={() => { setSearch(''); setLoc('All Locations'); setSkill('All Skills'); setExp('All Experience'); setEdu('All Education') }}>
            Clear
          </button>
        </div>
        {search && <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280' }}>Showing <strong>{filtered.length}</strong> results for "<strong>{search}</strong>"</div>}
      </div>

      {/* Profile grid */}
      {filtered.length === 0
        ? <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0C1F3F', marginBottom: 8 }}>No results found</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>Try adjusting your filters or search terms</div>
          </div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map(s => (
              <div key={s.id} className="card card-hover fade-in" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: s.color, flexShrink: 0, fontFamily: 'Plus Jakarta Sans' }}>
                    {s.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 2 }}>
                      {s.status === 'approved' ? s.name.split(' ')[0] + ' ' + s.name.split(' ')[1]?.[0] + '.' : '••••• •••••••'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{s.age} yrs · {s.location}</div>
                  </div>
                  <span className={`badge ${s.status === 'approved' ? 'badge-approved' : 'badge-pending'}`}>
                    {s.status === 'approved' ? '✓ Verified' : 'Pending'}
                  </span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', marginBottom: 6 }}>{s.jobRole}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                  {s.skills.map(sk => <span key={sk} style={{ fontSize: 11, background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: 100 }}>{sk}</span>)}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Profile completeness</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{s.completeness}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${s.completeness}%` }} />
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 14 }}>Backed by <strong>{s.ngo}</strong></div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => setSelected(s)}>
                    View Profile
                  </button>
                  <button onClick={() => toggleShortlist(s.id)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${shortlisted.includes(s.id) ? '#7C3AED' : '#E5E7EB'}`, background: shortlisted.includes(s.id) ? '#F5F3FF' : 'transparent', cursor: 'pointer', fontSize: 14 }}>
                    {shortlisted.includes(s.id) ? '🔖' : '📌'}
                  </button>
                  <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'transparent', cursor: 'pointer', fontSize: 14 }} onClick={() => alert('Demo: Resume download triggered for ' + s.name)}>
                    📥
                  </button>
                </div>
              </div>
            ))}
          </div>
      }

      {/* Profile detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,31,63,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }} onClick={() => setSelected(null)}>
          <div className="card" style={{ width: 520, padding: 32, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: `${selected.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: selected.color, fontFamily: 'Plus Jakarta Sans' }}>{selected.initials}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{selected.age} yrs · {selected.location}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            {[
              { label: 'Preferred Role', value: selected.jobRole },
              { label: 'Education', value: selected.education },
              { label: 'Experience', value: selected.experience },
              { label: 'Languages', value: selected.languages.join(', ') },
              { label: 'NGO Backing', value: selected.ngo },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#6B7280', minWidth: 130 }}>{r.label}</span>
                <span style={{ fontWeight: 500, color: '#0C1F3F' }}>{r.value}</span>
              </div>
            ))}

            <div style={{ margin: '16px 0' }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => alert('Demo: Interview request sent!')}>Request Interview</button>
              <button className="btn-secondary" onClick={() => alert('Demo: Resume downloaded!')}>📥 Resume</button>
              <button onClick={() => toggleShortlist(selected.id)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${shortlisted.includes(selected.id) ? '#7C3AED' : '#E5E7EB'}`, background: shortlisted.includes(selected.id) ? '#F5F3FF' : 'transparent', cursor: 'pointer', fontSize: 14 }}>
                {shortlisted.includes(selected.id) ? '🔖 Shortlisted' : '📌 Shortlist'}
              </button>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '0.5px solid #FECACA' }}>
              <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>⚠️ Privacy Protection Active</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Full contact details revealed only after interview approval by CAREVIA admin.</div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
