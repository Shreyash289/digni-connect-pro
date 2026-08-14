import { useState } from 'react'
import Layout from '../../components/Layout'
import { SURVIVORS, NGOS, ANALYTICS } from '../../data/mockData'

export default function AdminDashboard() {
  const [approvals, setApprovals] = useState(SURVIVORS.filter(s => s.status === 'pending'))
  const [approved, setApproved] = useState([])

  const approve = (id) => {
    const survivor = approvals.find(s => s.id === id)
    if (survivor) {
      setApprovals(approvals.filter(s => s.id !== id))
      setApproved([...approved, id])
    }
  }

  const reject = (id) => {
    setApprovals(approvals.filter(s => s.id !== id))
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>Admin Command Center</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Platform oversight, approvals, and analytics dashboard</p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Survivors', value: ANALYTICS.totalSurvivors, color: '#2563EB', bg: '#EFF6FF', icon: '👥' },
          { label: 'Placed', value: ANALYTICS.placedSurvivors, color: '#059669', bg: '#F0FDF4', icon: '✅' },
          { label: 'Active NGOs', value: ANALYTICS.activeNGOs, color: '#7C3AED', bg: '#F5F3FF', icon: '🤝' },
          { label: 'Recruiters', value: ANALYTICS.activeRecruiters, color: '#D97706', bg: '#FFFBEB', icon: '🔎' },
          { label: 'Pending', value: ANALYTICS.pendingApprovals, color: '#DC2626', bg: '#FEF2F2', icon: '⏳' },
        ].map(m => (
          <div key={m.label} className="stat-card" style={{ background: m.bg, border: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Pending approvals */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', background: '#FFFBEB' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', margin: 0 }}>
              ⏳ Pending Approvals ({approvals.length})
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>Review and approve new survivor profiles</p>
          </div>

          {approvals.length === 0
            ? <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✅ All caught up!</div>
                <div style={{ fontSize: 12 }}>No pending approvals. All profiles reviewed.</div>
              </div>
            : <table className="table">
                <thead>
                  <tr>
                    <th>Name</th><th>NGO</th><th>Completeness</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: s.color }}>{s.initials}</div>
                          <span style={{ fontWeight: 600 }}>{s.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12, color: '#6B7280' }}>{s.ngo}</span></td>
                      <td><span style={{ fontSize: 12, fontWeight: 600, color: '#2563EB' }}>{s.completeness}%</span></td>
                      <td><span className="badge badge-pending">Pending</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-success" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => approve(s.id)}>Approve</button>
                          <button className="btn-danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => reject(s.id)}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Stats column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Placement rate */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 14 }}>Placement Rate</h4>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#059669" strokeWidth="10" strokeDasharray={`${2 * Math.PI * 40 * 0.60} ${2 * Math.PI * 40 * 0.40}`} strokeDashoffset={2 * Math.PI * 40 * 0.25} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>60%</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>Placed</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6B7280' }}>{ANALYTICS.placedSurvivors} of {ANALYTICS.totalSurvivors}</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>↑ 8% YoY</span>
            </div>
          </div>

          {/* NGO partners */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 12 }}>NGO Partners</h4>
            {NGOS.slice(0, 4).map(ngo => (
              <div key={ngo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 12, borderBottom: '0.5px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0C1F3F' }}>{ngo.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{ngo.survivors} survivors</div>
                </div>
                <span style={{ color: '#059669', fontWeight: 600 }}>{ngo.placed} placed</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill distribution */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 16 }}>Top Skills in Demand</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {ANALYTICS.skillDistribution.map(s => (
            <div key={s.skill}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{s.skill}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{s.count}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(s.count / 32) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approved list */}
      {approved.length > 0 && (
        <div className="card" style={{ padding: 20, background: '#F0FDF4', border: '0.5px solid #BBF7D0' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#166534', fontFamily: 'Plus Jakarta Sans', marginBottom: 10 }}>
            ✅ Approved Today ({approved.length})
          </h4>
          <p style={{ fontSize: 12, color: '#059669', margin: 0 }}>
            {SURVIVORS.filter(s => approved.includes(s.id)).map(s => s.name).join(', ')}
          </p>
        </div>
      )}
    </Layout>
  )
}
