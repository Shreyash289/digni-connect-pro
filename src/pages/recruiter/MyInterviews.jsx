import { useState } from 'react'
import Layout from '../../components/Layout'

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([
    {
      id: 'int-1',
      survivorName: 'Meena',
      jobTitle: 'Data Entry Operator',
      date: '2025-06-20',
      time: '10:00 AM',
      status: 'Scheduled',
      videoLink: 'https://meet.google.com/abc-xyz-123',
      notes: 'Ask about experience with Excel',
      interviewType: 'Virtual'
    },
    {
      id: 'int-2',
      survivorName: 'Priya',
      jobTitle: 'Customer Service',
      date: '2025-06-22',
      time: '02:00 PM',
      status: 'Scheduled',
      videoLink: 'https://meet.google.com/def-ghi-456',
      notes: 'Check communication skills',
      interviewType: 'Virtual'
    },
    {
      id: 'int-3',
      survivorName: 'Divya',
      jobTitle: 'Administrative Assistant',
      date: '2025-06-18',
      time: '03:30 PM',
      status: 'Completed',
      videoLink: 'https://meet.google.com/jkl-mno-789',
      notes: 'Great performance, moving to offer stage',
      interviewType: 'Virtual',
      feedback: 'Excellent fit for the role'
    }
  ])

  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = filterStatus === 'all' 
    ? interviews 
    : interviews.filter(int => int.status === filterStatus)

  const upcomingCount = interviews.filter(int => int.status === 'Scheduled').length
  const completedCount = interviews.filter(int => int.status === 'Completed').length

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled': return { bg: '#EFF6FF', color: '#2563EB', label: 'Scheduled' }
      case 'Completed': return { bg: '#F0FDF4', color: '#059669', label: 'Completed' }
      case 'Cancelled': return { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' }
      default: return { bg: '#F3F4F6', color: '#6B7280', label: status }
    }
  }

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

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📅 My Interviews
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Schedule and manage survivor interviews</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, background: '#EFF6FF', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>
            {interviews.length}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Total Interviews</div>
        </div>
        <div style={{ padding: 16, background: '#FEF3C7', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706', fontFamily: 'Plus Jakarta Sans' }}>
            {upcomingCount}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Upcoming</div>
        </div>
        <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>
            {completedCount}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Completed</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 8 }}>Filter by Status</label>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '0.5px solid #E5E7EB',
            fontSize: 13,
            fontFamily: 'Inter'
          }}
        >
          <option value="all">All Interviews</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Interviews List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No interviews found</div>
          <div style={{ fontSize: 12 }}>Schedule interviews with candidates to see them here</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {filtered.map(interview => {
            const statusInfo = getStatusColor(interview.status)
            return (
              <div key={interview.id} className="card" style={{ padding: 20, border: '0.5px solid #E5E7EB' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 2 }}>
                      {interview.survivorName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      {interview.jobTitle}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600
                  }}>
                    {interview.status}
                  </div>
                </div>

                {/* Date & Time */}
                <div style={{ marginBottom: 16, padding: 12, background: '#F9FAFB', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>📅 Date & Time</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F', marginBottom: 2 }}>
                    {interview.date}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                    {interview.time}
                  </div>
                </div>

                {/* Interview Type */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>🎥 Interview Type</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1F3F' }}>
                    {interview.interviewType}
                  </div>
                </div>

                {/* Video Link (if Scheduled) */}
                {interview.status === 'Scheduled' && (
                  <div style={{ marginBottom: 16 }}>
                    <a 
                      href={interview.videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '10px 12px',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        textDecoration: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'center',
                        border: '0.5px solid #BFDBFE'
                      }}
                    >
                      🔗 Join Video Call
                    </a>
                  </div>
                )}

                {/* Notes */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Interview Notes</label>
                  <textarea
                    value={interview.notes}
                    onChange={(e) => {
                      setInterviews(interviews.map(int => 
                        int.id === interview.id ? { ...int, notes: e.target.value } : int
                      ))
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '0.5px solid #E5E7EB',
                      fontSize: 11,
                      fontFamily: 'Inter',
                      minHeight: 60,
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Feedback (if Completed) */}
                {interview.status === 'Completed' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>Interview Feedback</label>
                    <textarea
                      value={interview.feedback || ''}
                      onChange={(e) => updateFeedback(interview.id, e.target.value)}
                      placeholder="Add your feedback..."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: '0.5px solid #E5E7EB',
                        fontSize: 11,
                        fontFamily: 'Inter',
                        minHeight: 60,
                        resize: 'none'
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {interview.status === 'Scheduled' && (
                    <>
                      <button 
                        onClick={() => rescheduleInterview(interview.id)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#F3F4F6',
                          color: '#374151',
                          border: '0.5px solid #E5E7EB',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => cancelInterview(interview.id)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: '0.5px solid #FECACA',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {interview.status === 'Completed' && (
                    <button style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#F0FDF4',
                      color: '#059669',
                      border: '0.5px solid #BBF7D0',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      ✓ Completed
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}