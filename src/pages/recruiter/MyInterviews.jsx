import { useState } from 'react'
import Layout from '../../components/Layout'

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([
    {
      id: 'int-1',
      survivorName: 'Meena Rajeshwari',
      jobTitle: 'Data Entry Operator',
      date: '2025-06-20',
      time: '10:00 AM',
      status: 'Scheduled',
      videoLink: 'https://meet.google.com/abc-xyz-123',
      notes: 'Review past experience with spreadsheet software and typing speed.',
      interviewType: 'Virtual Video Call'
    },
    {
      id: 'int-2',
      survivorName: 'Priya Sundaram',
      jobTitle: 'Customer Service Associate',
      date: '2025-06-22',
      time: '02:00 PM',
      status: 'Scheduled',
      videoLink: 'https://meet.google.com/def-ghi-456',
      notes: 'Evaluate multilingual fluency and communication skills.',
      interviewType: 'Virtual Video Call'
    },
    {
      id: 'int-3',
      survivorName: 'Divya Kumar',
      jobTitle: 'Administrative Assistant',
      date: '2025-06-18',
      time: '03:30 PM',
      status: 'Completed',
      videoLink: 'https://meet.google.com/jkl-mno-789',
      notes: 'Demonstrated strong organizational competencies.',
      interviewType: 'Virtual Video Call',
      feedback: 'Excellent cultural fit and qualified skillset.'
    }
  ])

  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = filterStatus === 'all' 
    ? interviews 
    : interviews.filter(int => int.status === filterStatus)

  const upcomingCount = interviews.filter(int => int.status === 'Scheduled').length
  const completedCount = interviews.filter(int => int.status === 'Completed').length

  const cancelInterview = (interviewId) => {
    if (window.confirm('Cancel this interview?')) {
      setInterviews(interviews.map(int => 
        int.id === interviewId ? { ...int, status: 'Cancelled' } : int
      ))
    }
  }

  const rescheduleInterview = (interviewId) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):')
    const newTime = prompt('Enter new time (HH:MM AM/PM):')
    if (newDate && newTime) {
      setInterviews(interviews.map(int => 
        int.id === interviewId ? { ...int, date: newDate, time: newTime } : int
      ))
      alert('Interview rescheduled successfully')
    }
  }

  const updateFeedback = (interviewId, feedback) => {
    setInterviews(interviews.map(int => 
      int.id === interviewId ? { ...int, feedback } : int
    ))
  }

  const statItems = [
    { label: 'Total interviews', value: interviews.length },
    { label: 'Upcoming scheduled', value: upcomingCount },
    { label: 'Completed rounds', value: completedCount }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Interview management
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Coordinate candidate interviews, meeting links, and feedback logs
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

      {/* Filter Card */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
          Filter by interview status
        </label>
        <select 
          className="input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ maxWidth: 280, cursor: 'pointer' }}
        >
          <option value="all">All interviews</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Interviews List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>
            Scheduled sessions
          </h3>
          <span className="badge">
            {filtered.length} interviews
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>
              No interviews scheduled
            </h3>
            <p style={{ color: 'var(--ink2)', fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
              Request interviews with candidates from the talent discovery page to view them here.
            </p>
          </div>
        ) : (
          <div>
            {filtered.map(interview => (
              <div
                key={interview.id}
                style={{
                  padding: '24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
                      {interview.survivorName}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                      Target role: {interview.jobTitle} · {interview.interviewType}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: interview.status === 'Completed' ? 'var(--navy)' : 'var(--mist)',
                      color: interview.status === 'Completed' ? '#ffffff' : 'var(--navy)'
                    }}
                  >
                    {interview.status}
                  </span>
                </div>

                {/* Session Details */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', background: 'var(--bg)', padding: '12px 18px', borderRadius: 'var(--r-input)', border: '1px solid var(--line)', fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--ink2)' }}>Date: </span>
                    <strong style={{ color: 'var(--ink)' }}>{interview.date}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink2)' }}>Time: </span>
                    <strong style={{ color: 'var(--royal)' }}>{interview.time}</strong>
                  </div>
                  {interview.status === 'Scheduled' && (
                    <div>
                      <a
                        href={interview.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--royal)', textDecoration: 'none', fontWeight: 500 }}
                      >
                        Join video meeting →
                      </a>
                    </div>
                  )}
                </div>

                {/* Notes & Feedback */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                      Interview notes
                    </label>
                    <textarea
                      className="input"
                      value={interview.notes || ''}
                      onChange={(e) => {
                        setInterviews(interviews.map(int => 
                          int.id === interview.id ? { ...int, notes: e.target.value } : int
                        ))
                      }}
                      rows={2}
                      style={{ resize: 'none', fontSize: 13 }}
                    />
                  </div>

                  {interview.status === 'Completed' && (
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                        Post-interview feedback
                      </label>
                      <textarea
                        className="input"
                        value={interview.feedback || ''}
                        onChange={(e) => updateFeedback(interview.id, e.target.value)}
                        placeholder="Add performance feedback..."
                        rows={2}
                        style={{ resize: 'none', fontSize: 13 }}
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {interview.status === 'Scheduled' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      className="btn-soft"
                      onClick={() => rescheduleInterview(interview.id)}
                    >
                      Reschedule session
                    </button>
                    <button 
                      className="btn-soft"
                      onClick={() => cancelInterview(interview.id)}
                    >
                      Cancel interview
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}