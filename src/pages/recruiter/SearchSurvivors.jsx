import { useState } from 'react'
import Layout from '../../components/Layout'

export default function SearchSurvivors() {
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [results] = useState([])

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          🔍 Search Talent
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Find survivors matching your job requirements</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Skill</label>
          <input
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            placeholder="Data Entry, Teaching, etc"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '0.5px solid #E5E7EB',
              fontSize: 13,
              fontFamily: 'Inter',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Location</label>
          <input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Chennai, Bangalore, etc"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '0.5px solid #E5E7EB',
              fontSize: 13,
              fontFamily: 'Inter',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No results yet</div>
        <div style={{ fontSize: 12 }}>Enter skills and location to search survivors</div>
      </div>
    </Layout>
  )
}