import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'

export default function JobBoard() {
  const navigate = useNavigate()
  const [jobs] = useState([])

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Job board
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Verified employment openings and vocational opportunities matching your skillset
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>
            No opportunities currently listed
          </h3>
          <p style={{ color: 'var(--ink2)', fontSize: 14, maxWidth: 440, margin: '0 auto 24px' }}>
            New verified job postings from partner employers will appear here as they are published.
          </p>
          <button className="btn-pill" onClick={() => navigate('/survivor/profile')}>
            Update profile skills
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {jobs.map(job => (
            <div key={job.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--navy)' }}>{job.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{job.company} · {job.location}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}