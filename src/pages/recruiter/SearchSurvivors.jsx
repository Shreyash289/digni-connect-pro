import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'

const POPULAR_SKILLS = [
  'Data Entry',
  'Tailoring',
  'Teaching',
  'Customer Service',
  'Accounting',
  'MS Office',
  'Nursing Assistant'
]

export default function SearchSurvivors() {
  const navigate = useNavigate()
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [results] = useState([])

  const handleSelectChip = (s) => {
    if (selectedSkill === s) {
      setSelectedSkill('')
      setSearchSkill('')
    } else {
      setSelectedSkill(s)
      setSearchSkill(s)
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Search survivor talent
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Discover and connect with qualified, verified candidates for open roles
        </p>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
              Filter by skill
            </label>
            <input
              className="input"
              value={searchSkill}
              onChange={(e) => {
                setSearchSkill(e.target.value)
                setSelectedSkill('')
              }}
              placeholder="e.g. Data Entry, Accounting, Tailoring"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
              Filter by location
            </label>
            <input
              className="input"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="e.g. Chennai, Bengaluru, Pondicherry"
            />
          </div>
        </div>

        {/* Pill skill chips using .badge */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink2)', marginBottom: 8 }}>
            Popular skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULAR_SKILLS.map(s => {
              const isSelected = selectedSkill === s
              return (
                <span
                  key={s}
                  className="badge"
                  onClick={() => handleSelectChip(s)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--navy)' : 'var(--mist)',
                    color: isSelected ? '#ffffff' : 'var(--navy)',
                    transition: 'all 0.2s'
                  }}
                >
                  {isSelected ? '✓ ' : ''}{s}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results / Empty State */}
      {results.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>
            No candidate matches found
          </h3>
          <p style={{ color: 'var(--ink2)', fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
            Enter specific skills or locations above, or browse all talent from the discovery dashboard.
          </p>
          <button className="btn-pill" onClick={() => navigate('/recruiter')}>
            Browse all verified talent
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {results.map((c) => (
            <div key={c.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 12 }}>
                  {c.location} · {c.skills?.join(', ')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-pill" style={{ flex: 1 }}>
                  View profile
                </button>
                <button className="btn-soft">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}