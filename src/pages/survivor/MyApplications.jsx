import { useState } from 'react'
import Layout from '../../components/Layout'
import { SURVIVORS, JOBS } from '../../data/mockData'

export default function MyApplications() {
  // Get current survivor (from URL or localStorage)
  const survivorId = 'survivor-1' // Mock - will be real user later
  const survivor = SURVIVORS.find(s => s.id === survivorId)
  
  // Mock applications data
  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Data Entry Operator',
      company: 'TechCorp',
      appliedDate: '2025-06-10',
      status: 'Applied', // Applied, Reviewed, Interview, Offered, Rejected
      lastUpdate: '2025-06-15',
      notes: 'Waiting for response'
    },
    {
      id: 'app-2',
      jobId: 'job-2',
      jobTitle: 'Customer Service',
      company: 'BPO Solutions',
      appliedDate: '2025-06-08',
      status: 'Interview',
      lastUpdate: '2025-06-14',
      notes: 'Interview scheduled for June 20'
    },
    {
      id: 'app-3',
      jobId: 'job-3',
      jobTitle: 'Administrative Assistant',
      company: 'Corp Inc',
      appliedDate: '2025-06-05',
      status: 'Rejected',
      lastUpdate: '2025-06-12',
      notes: 'Not selected this time'
    }
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return '#2563EB' // Blue
      case 'Reviewed': return '#F59E0B' // Orange
      case 'Interview': return '#10B981' // Green
      case 'Offered': return '#059669' // Dark Green
      case 'Rejected': return '#DC2626' // Red
      default: return '#6B7280' // Gray
    }
  }

  const withdrawApplication = (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setApplications(applications.filter(app => app.id !== appId))
      alert('✅ Application withdrawn')
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          My Applications
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Track your job applications and interview status</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: applications.length, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Applied', value: applications.filter(a => a.status === 'Applied').length, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Interview', value: applications.filter(a => a.status === 'Interview').length, color: '#10B981', bg: '#F0FDF4' },
          { label: 'Offered', value: applications.filter(a => a.status === 'Offered').length, color: '#059669', bg: '#F0FDF4' }
        ].map((stat, i) => (
          <div key={i} style={{ padding: 16, background: stat.bg, borderRadius: 12, textAlign: 'center', border: 'none' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Applications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', background: '#FFFBEB' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>
            📋 Your Applications ({applications.length})
          </h3>
        </div>

        {applications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No applications yet</div>
            <div style={{ fontSize: 12 }}>Start applying to jobs to see them here</div>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            {applications.map(app => (
              <div key={app.id} style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', background: app.status === 'Offered' ? '#F0FDF4' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 2 }}>
                      {app.jobTitle}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                      {app.company}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#9CA3AF' }}>
                      <span>Applied: {app.appliedDate}</span>
                      <span>•</span>
                      <span>Updated: {app.lastUpdate}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '4px 12px',
                      background: getStatusColor(app.status),
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      marginBottom: 10
                    }}>
                      {app.status}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#374151', marginBottom: 10, padding: '8px 12px', background: '#F3F4F6', borderRadius: 6 }}>
                  💬 {app.notes}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {app.status === 'Applied' && (
                    <>
                      <button style={{
                        padding: '6px 12px',
                        background: '#2563EB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        View Job
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        background: '#EF4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }} onClick={() => withdrawApplication(app.id)}>
                        Withdraw
                      </button>
                    </>
                  )}
                  {app.status === 'Interview' && (
                    <button style={{
                      padding: '6px 12px',
                      background: '#10B981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      View Interview Details
                    </button>
                  )}
                  {app.status === 'Offered' && (
                    <button style={{
                      padding: '6px 12px',
                      background: '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      🎉 Congratulations!
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}