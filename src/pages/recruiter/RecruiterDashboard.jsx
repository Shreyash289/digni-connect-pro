import { useState } from 'react'
import Layout from '../../components/Layout'
import { SURVIVORS } from '../../data/mockData'

const LOCATIONS = ['All locations', 'Chennai, Tamil Nadu', 'Bengaluru, Karnataka', 'Pondicherry', 'Mumbai, Maharashtra', 'Hyderabad, Telangana', 'Delhi, NCR', 'Kolkata, West Bengal', 'Coimbatore, Tamil Nadu', 'Pune, Maharashtra']
const SKILL_OPTS = ['All skills', 'Data Entry', 'Tailoring', 'Teaching', 'Carpentry', 'Cooking', 'Accounting', 'Electrical Work', 'Nursing Assistant', 'Embroidery']
const EXP_OPTS = ['All experience levels', '0–1 year', '1–3 years', '3–5 years', '5+ years']
const EDU_OPTS = ['All education levels', 'Class 10 Pass', 'Class 12 Pass', 'Diploma', 'ITI Certificate', 'Graduate', 'Post Graduate']

export default function RecruiterDashboard() {
  const [search, setSearch] = useState('')
  const [loc, setLoc] = useState('All locations')
  const [skill, setSkill] = useState('All skills')
  const [exp, setExp] = useState('All experience levels')
  const [edu, setEdu] = useState('All education levels')
  const [shortlisted, setShortlisted] = useState([])
  const [selected, setSelected] = useState(null)

  const toggleShortlist = (id) => setShortlisted(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const filtered = SURVIVORS.filter(s => {
    if (s.status === 'draft') return false
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.skills.some(sk => sk.toLowerCase().includes(q)) || s.location.toLowerCase().includes(q) || s.jobRole.toLowerCase().includes(q)
    const matchLoc = loc === 'All locations' || s.location === loc
    const matchSkill = skill === 'All skills' || s.skills.some(sk => sk.includes(skill))
    return matchSearch && matchLoc && matchSkill
  })

  const statItems = [
    { label: 'Verified candidates', value: SURVIVORS.filter(s => s.status === 'approved').length },
    { label: 'Shortlisted profiles', value: shortlisted.length },
    { label: 'Search matches', value: filtered.length },
    { label: 'Interviews requested', value: 3 }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Talent discovery
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Search and filter verified candidate profiles for inclusive hiring
        </p>
      </div>

      {/* Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statItems.map((stat, idx) => {
          const cardClass = idx === 0 ? 'card-light' : idx % 2 === 1 ? 'card-dark' : 'card'
          return (
            <div key={stat.label} className={cardClass} style={{ padding: 24 }}>
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

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
          <input
            className="input"
            style={{ gridColumn: '1 / -1' }}
            placeholder="Search by candidate name, skill, location, or target role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input" value={loc} onChange={e => setLoc(e.target.value)} style={{ cursor: 'pointer' }}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className="input" value={skill} onChange={e => setSkill(e.target.value)} style={{ cursor: 'pointer' }}>
            {SKILL_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input" value={exp} onChange={e => setExp(e.target.value)} style={{ cursor: 'pointer' }}>
            {EXP_OPTS.map(e => <option key={e}>{e}</option>)}
          </select>
          <select className="input" value={edu} onChange={e => setEdu(e.target.value)} style={{ cursor: 'pointer' }}>
            {EDU_OPTS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
            Showing <strong>{filtered.length}</strong> verified candidate{filtered.length !== 1 ? 's' : ''}
          </div>
          <button
            className="btn-soft"
            onClick={() => { setSearch(''); setLoc('All locations'); setSkill('All skills'); setExp('All experience levels'); setEdu('All education levels') }}
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Candidate Results Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>No matching candidates found</h3>
          <p style={{ color: 'var(--ink2)', fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
            Try adjusting your search criteria, removing specific filters, or clearing your keywords.
          </p>
          <button
            className="btn-pill"
            onClick={() => { setSearch(''); setLoc('All locations'); setSkill('All skills') }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(s => {
            const isShortlisted = shortlisted.includes(s.id)
            return (
              <div key={s.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                        {s.status === 'approved' ? s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1]?.[0] || '') + '.' : 'Verified Candidate'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                        {s.age} yrs · {s.location}
                      </div>
                    </div>
                    <span className="badge">
                      {s.status === 'approved' ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--royal)', marginBottom: 10 }}>
                    {s.jobRole}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {s.skills.map(sk => (
                      <span key={sk} className="badge" style={{ fontSize: 11, padding: '3px 10px' }}>
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink2)', marginBottom: 6 }}>
                      <span>Profile completion</span>
                      <span>{s.completeness}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.completeness}%`, background: 'var(--royal)', borderRadius: 'var(--r-pill)' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 20 }}>
                    Backed by {s.ngo}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-pill" style={{ flex: 1 }} onClick={() => setSelected(s)}>
                    View profile
                  </button>
                  <button
                    className="btn-soft"
                    onClick={() => toggleShortlist(s.id)}
                    style={{ background: isShortlisted ? 'var(--navy)' : 'var(--mist)', color: isShortlisted ? '#ffffff' : 'var(--ink)' }}
                  >
                    {isShortlisted ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 27, 63, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 20
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ color: 'var(--navy)', marginBottom: 4 }}>
                  {selected.name}
                </h3>
                <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 13 }}>
                  {selected.age} yrs · {selected.location} · Backed by {selected.ngo}
                </p>
              </div>
              <button
                className="btn-soft"
                onClick={() => setSelected(null)}
                style={{ padding: '6px 12px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Target role', value: selected.jobRole },
                { label: 'Education level', value: selected.education },
                { label: 'Work experience', value: selected.experience },
                { label: 'Languages', value: selected.languages.join(', ') },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
                  <span style={{ color: 'var(--ink2)' }}>{r.label}</span>
                  <span style={{ fontWeight: 500, color: 'var(--navy)' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink2)', marginBottom: 8 }}>
                Verified competencies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.skills.map(sk => (
                  <span key={sk} className="badge" style={{ padding: '4px 12px', fontSize: 12 }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-pill" style={{ flex: 1 }} onClick={() => alert('Interview request sent for ' + selected.name)}>
                Request interview
              </button>
              <button
                className="btn-soft"
                onClick={() => toggleShortlist(selected.id)}
              >
                {shortlisted.includes(selected.id) ? 'Shortlisted ✓' : 'Shortlist candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
