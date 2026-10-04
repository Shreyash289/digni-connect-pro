import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { SURVIVORS, STAGES } from '../../data/mockData'

export default function NGODashboard() {
  const navigate = useNavigate()
  const mysurvivors = SURVIVORS.filter((_, i) => [0, 4, 8].includes(i))
  const [survivors] = useState(mysurvivors)

  const statItems = [
    { label: 'Total supported survivors', value: 42 },
    { label: 'Placed into employment', value: 28 },
    { label: 'Active training / matching', value: 10 },
    { label: 'Pending documentation', value: 4 }
  ]

  const needsAttention = [
    { id: 1, title: 'Identity verification pending', candidate: 'Divya R.', action: 'Review document' },
    { id: 2, title: 'Resume update requested', candidate: 'Meena K.', action: 'Assist candidate' },
    { id: 3, title: 'Interview prep session', candidate: 'Priya S.', action: 'Schedule mock call' }
  ]

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
            Partner organization dashboard
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
            Asha Foundation · Chennai Regional Center
          </p>
        </div>
        <button className="btn-pill" onClick={() => navigate('/ngo/survivors')}>
          Manage candidate roster
        </button>
      </div>

      {/* Stat tiles */}
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

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Survivor roster card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              Active candidate cohorts
            </h3>
            <button className="btn-soft" onClick={() => navigate('/ngo/progress')}>
              View progress →
            </button>
          </div>
          <div>
            {survivors.map(s => (
              <div
                key={s.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 6 }}>
                    {s.location} · {s.jobRole}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.skills?.slice(0, 2).map(sk => (
                      <span key={sk} className="badge" style={{ fontSize: 11, padding: '2px 8px' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--royal)' }}>
                      Stage {s.stage}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)' }}>
                      {STAGES[s.stage - 1]}
                    </div>
                  </div>
                  <span className="badge">
                    {s.status}
                  </span>
                  <button className="btn-soft" onClick={() => navigate('/ngo/documents')}>
                    Verify docs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs attention card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              Needs attention
            </h3>
            <span className="badge">
              {needsAttention.length} pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {needsAttention.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r-input)',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                    Candidate: {item.candidate}
                  </div>
                </div>
                <button
                  className="btn-soft"
                  onClick={() => alert(`Opening task for ${item.candidate}`)}
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px', borderRadius: 'var(--r-input)', background: 'var(--mist)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
              Placement milestone
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12 }}>
              67% overall placement rate achieved for current fiscal cohort.
            </div>
            <div style={{ height: 6, background: 'var(--card)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '67%', background: 'var(--royal)', borderRadius: 'var(--r-pill)' }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
