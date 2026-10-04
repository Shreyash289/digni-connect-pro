import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'

export default function MyApplications() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Data Entry Operator',
      company: 'TechCorp Solutions',
      appliedDate: '2025-06-10',
      status: 'Applied',
      lastUpdate: '2025-06-15',
      notes: 'Application submitted and pending initial review.'
    },
    {
      id: 'app-2',
      jobId: 'job-2',
      jobTitle: 'Customer Service Associate',
      company: 'BPO Solutions',
      appliedDate: '2025-06-08',
      status: 'Interview',
      lastUpdate: '2025-06-14',
      notes: 'Initial video interview scheduled for next week.'
    },
    {
      id: 'app-3',
      jobId: 'job-3',
      jobTitle: 'Administrative Assistant',
      company: 'Apex Corporation',
      appliedDate: '2025-06-05',
      status: 'Under Review',
      lastUpdate: '2025-06-12',
      notes: 'Profile reviewed by hiring manager.'
    }
  ])

  const withdrawApplication = (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setApplications(applications.filter(app => app.id !== appId))
      alert('Application withdrawn')
    }
  }

  const statItems = [
    { label: 'Total submitted', value: applications.length },
    { label: 'Pending review', value: applications.filter(a => a.status === 'Applied' || a.status === 'Under Review').length },
    { label: 'Interviews', value: applications.filter(a => a.status === 'Interview').length },
    { label: 'Offers received', value: applications.filter(a => a.status === 'Offered').length }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          My applications
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Track your active job applications, interview stages, and status updates
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
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

      {/* Applications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>
            Application history
          </h3>
          <span className="badge">
            {applications.length} active
          </span>
        </div>

        {applications.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>No active applications</h3>
            <p style={{ color: 'var(--ink2)', fontSize: 14, marginBottom: 20 }}>
              Explore available job listings and submit applications to start interviewing.
            </p>
            <button className="btn-pill" onClick={() => navigate('/survivor/jobs')}>
              Explore job board
            </button>
          </div>
        ) : (
          <div>
            {applications.map(app => (
              <div
                key={app.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
                      {app.jobTitle}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 6 }}>
                      {app.company}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                      Applied on {app.appliedDate} · Last updated {app.lastUpdate}
                    </div>
                  </div>
                  <div>
                    <span className="badge" style={{ background: app.status === 'Interview' ? 'var(--navy)' : 'var(--mist)', color: app.status === 'Interview' ? '#ffffff' : 'var(--navy)' }}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--ink2)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--r-input)', border: '1px solid var(--line)' }}>
                  {app.notes}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button className="btn-soft" onClick={() => navigate('/survivor/jobs')}>
                    View role details
                  </button>
                  <button className="btn-soft" onClick={() => withdrawApplication(app.id)}>
                    Withdraw application
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}