import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { SURVIVORS, STAGES } from '../../data/mockData'

export default function NGODashboard() {
  const navigate = useNavigate()
  const mysurvivors = SURVIVORS.filter((_, i) => [0, 4, 8].includes(i))
  const [survivors, setSurvivors] = useState(mysurvivors)

  const stats = {
    total: survivors.length,
    placed: survivors.filter(s => s.stage === 5).length,
    active: survivors.filter(s => s.stage >= 2 && s.stage < 5).length,
    pending: survivors.filter(s => s.status === 'pending').length,
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>NGO Dashboard</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Asha Foundation · Chennai, Tamil Nadu</p>
        </div>
        <button className="btn-primary" onClick={() => alert('Demo: Add Survivor form opens')}>+ Add Survivor</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Survivors', value: 42, color: '#2563EB', bg: '#EFF6FF', icon: '👥' },
          { label: 'Successfully Placed', value: 28, color: '#059669', bg: '#F0FDF4', icon: '✅' },
          { label: 'In Progress', value: 10, color: '#D97706', bg: '#FFFBEB', icon: '📈' },
          { label: 'Pending Approval', value: 4, color: '#DC2626', bg: '#FEF2F2', icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg, border: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Survivor table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>My Survivors</h3>
            <span style={{ fontSize: 13, color: '#2563EB', cursor: 'pointer' }}>View all →</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Skills</th><th>Stage</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {survivors.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: s.color }}>{s.initials}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{s.location}</div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{s.skills.slice(0,2).map(sk => <span key={sk} style={{ fontSize: 11, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{sk}</span>)}</div></td>
                  <td>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: '#2563EB' }}>Stage {s.stage}</span>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{STAGES[s.stage - 1]}</div>
                    </div>
                  </td>
                  <td><span className={`badge ${s.status === 'approved' ? 'badge-approved' : s.status === 'pending' ? 'badge-pending' : 'badge-draft'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-success" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => alert('Demo: Update progress')}>Update</button>
                      <button style={{ padding: '4px 10px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB', border: '0.5px solid #BFDBFE', fontSize: 11, fontWeight: 600, cursor: 'pointer' }} onClick={() => alert('Demo: Upload docs')}>📎 Docs</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Placement rate */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 14 }}>Placement Rate</h4>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#059669" strokeWidth="10" strokeDasharray={`${2 * Math.PI * 40 * 0.67} ${2 * Math.PI * 40 * 0.33}`} strokeDashoffset={2 * Math.PI * 40 * 0.25} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>67%</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>Placed</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6B7280' }}>28 of 42 survivors</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>↑ 12% MoM</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 14 }}>Quick Actions</h4>
            {[
              { icon: '➕', label: 'Add new survivor', action: () => alert('Demo: Add survivor') },
              { icon: '📂', label: 'Upload documents', action: () => alert('Demo: Upload docs') },
              { icon: '📊', label: 'Generate report', action: () => alert('Demo: Report generated') },
              { icon: '📧', label: 'Contact CAREVIA admin', action: () => alert('Demo: Message sent') },
            ].map(a => (
              <div key={a.label} onClick={a.action} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
