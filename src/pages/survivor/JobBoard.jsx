import { useState } from 'react'
import Layout from '../../components/Layout'

export default function JobBoard() {
  const [jobs] = useState([])

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          💼 Job Board
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Available jobs matching your skills</p>
      </div>

      <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No jobs available</div>
        <div style={{ fontSize: 12 }}>Check back soon for new opportunities</div>
      </div>
    </Layout>
  )
}