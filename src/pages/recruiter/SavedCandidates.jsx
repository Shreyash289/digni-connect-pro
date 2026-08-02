import { useState } from 'react'
import Layout from '../../components/Layout'
import { SURVIVORS } from '../../data/mockData'

export default function SavedCandidates() {
  const [savedCandidates, setSavedCandidates] = useState([
    { ...SURVIVORS[0], savedDate: '2025-06-15', notes: 'Great fit for Data Entry role' },
    { ...SURVIVORS[2], savedDate: '2025-06-14', notes: 'Excellent communication skills' },
    { ...SURVIVORS[4], savedDate: '2025-06-10', notes: 'Will follow up next week' }
  ])

  const [filterSkill, setFilterSkill] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const allSkills = ['all', 'Data Entry', 'Customer Service', 'Administrative', 'Teaching', 'Tailoring']

  const filtered = filterSkill === 'all' 
    ? savedCandidates 
    : savedCandidates.filter(c => c.skills.includes(filterSkill))

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

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📌 Saved Candidates
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Your bookmarked survivor profiles</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, background: '#EFF6FF', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>
            {savedCandidates.length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Saved Candidates</div>
        </div>
        <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>
            {savedCandidates.filter(c => c.location === 'Chennai').length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>In Chennai</div>
        </div>
        <div style={{ padding: 16, background: '#F5F3FF', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED', fontFamily: 'Plus Jakarta Sans' }}>
            {savedCandidates.filter(c => c.completeness >= 80).length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>High Match</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Filter by Skill</label>
          <select 
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '0.5px solid #E5E7EB',
              fontSize: 13,
              fontFamily: 'Inter'
            }}
          >
            {allSkills.map(skill => (
              <option key={skill} value={skill}>
                {skill === 'all' ? 'All Skills' : skill}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Sort by</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '0.5px solid #E5E7EB',
              fontSize: 13,
              fontFamily: 'Inter'
            }}
          >
            <option value="recent">Recently Saved</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Candidates List */}
      {sorted.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No saved candidates</div>
          <div style={{ fontSize: 12 }}>Find talent and save profiles to see them here</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sorted.map(candidate => (
            <div key={candidate.id} className="card" style={{ padding: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `${candidate.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: candidate.color
                  }}>
                    {candidate.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1F3F' }}>
                      {candidate.initials}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      {candidate.age} years • {candidate.location}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  Saved {candidate.savedDate}
                </div>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Top Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {candidate.skills.slice(0, 3).map(skill => (
                    <span key={skill} style={{
                      padding: '2px 8px',
                      background: '#F3F4F6',
                      color: '#374151',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 500
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profile Match */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Profile Match</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{candidate.completeness}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${candidate.completeness}%` }} />
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 12 }}>
                <textarea
                  value={candidate.notes}
                  onChange={(e) => updateNotes(candidate.id, e.target.value)}
                  placeholder="Add notes about this candidate..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '0.5px solid #E5E7EB',
                    fontSize: 11,
                    fontFamily: 'Inter',
                    minHeight: 50,
                    resize: 'none'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#2563EB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  View Profile
                </button>
                <button 
                  onClick={() => removeSaved(candidate.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: '0.5px solid #FECACA',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
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