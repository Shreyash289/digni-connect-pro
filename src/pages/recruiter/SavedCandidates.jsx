import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { SURVIVORS } from '../../data/mockData'

export default function SavedCandidates() {
  const navigate = useNavigate()
  const [savedCandidates, setSavedCandidates] = useState([
    { ...SURVIVORS[0], savedDate: '2025-06-15', notes: 'Strong match for data operations and typing accuracy.' },
    { ...SURVIVORS[2], savedDate: '2025-06-14', notes: 'Excellent communication and vocational background.' },
    { ...SURVIVORS[4], savedDate: '2025-06-10', notes: 'Follow-up interview scheduled through partner NGO.' }
  ])

  const [filterSkill, setFilterSkill] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const allSkills = ['all', 'Data Entry', 'Customer Service', 'Administrative', 'Teaching', 'Tailoring']

  const filtered = filterSkill === 'all' 
    ? savedCandidates 
    : savedCandidates.filter(c => c.skills?.includes(filterSkill))

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.savedDate) - new Date(a.savedDate)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  const removeSaved = (candidateId) => {
    if (window.confirm('Remove from saved candidates?')) {
      setSavedCandidates(savedCandidates.filter(c => c.id !== candidateId))
    }
  }

  const updateNotes = (candidateId, newNotes) => {
    setSavedCandidates(savedCandidates.map(c => 
      c.id === candidateId ? { ...c, notes: newNotes } : c
    ))
  }

  const statItems = [
    { label: 'Bookmarked profiles', value: savedCandidates.length },
    { label: 'Chennai candidates', value: savedCandidates.filter(c => c.location?.includes('Chennai')).length },
    { label: 'High match rating', value: savedCandidates.filter(c => (c.completeness || 0) >= 80).length }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Shortlisted candidates
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Manage your saved candidate bookmarks and interview notes
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

      {/* Filters Card */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Filter by skill competency
          </label>
          <select 
            className="input"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            {allSkills.map(skill => (
              <option key={skill} value={skill}>
                {skill === 'all' ? 'All Skills' : skill}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Sort order
          </label>
          <select 
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="recent">Recently saved</option>
            <option value="name">Candidate name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {sorted.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>
            No saved candidates
          </h3>
          <p style={{ color: 'var(--ink2)', fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
            Browse talent from discovery and bookmark candidate profiles to organize them here.
          </p>
          <button className="btn-pill" onClick={() => navigate('/recruiter')}>
            Discover candidates
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {sorted.map(candidate => (
            <div key={candidate.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                      {candidate.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                      {candidate.age} yrs · {candidate.location}
                    </div>
                  </div>
                  <span className="badge">
                    Saved {candidate.savedDate}
                  </span>
                </div>

                {/* Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {candidate.skills?.map(skill => (
                    <span key={skill} className="badge" style={{ fontSize: 11, padding: '3px 10px' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Completeness */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink2)', marginBottom: 4 }}>
                    <span>Profile match</span>
                    <span>{candidate.completeness}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${candidate.completeness}%`, background: 'var(--royal)', borderRadius: 'var(--r-pill)' }} />
                  </div>
                </div>

                {/* Internal Notes */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Recruiter notes
                  </label>
                  <textarea
                    className="input"
                    value={candidate.notes || ''}
                    onChange={(e) => updateNotes(candidate.id, e.target.value)}
                    placeholder="Add interview notes or observations..."
                    rows={2}
                    style={{ resize: 'none', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-pill"
                  style={{ flex: 1 }}
                  onClick={() => alert('View profile detail for ' + candidate.name)}
                >
                  View profile
                </button>
                <button 
                  className="btn-soft"
                  onClick={() => removeSaved(candidate.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}