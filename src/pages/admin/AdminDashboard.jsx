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

  const statItems = [
    { label: 'Total verified survivors', value: ANALYTICS.totalSurvivors },
    { label: 'Placed in careers', value: ANALYTICS.placedSurvivors },
    { label: 'Active partner NGOs', value: ANALYTICS.activeNGOs },
    { label: 'Registered employers', value: ANALYTICS.activeRecruiters },
    { label: 'Pending review', value: approvals.length }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Platform command center
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          System-wide governance, partner approvals, and workforce placement analytics
        </p>
      </div>

      {/* Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statItems.map((m, idx) => {
          const cardClass = idx === 0 ? 'card-light' : 'card-dark'
          return (
            <div key={m.label} className={cardClass} style={{ padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 12 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 40, fontWeight: 300, lineHeight: 1 }}>
                {m.value}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Pending approvals queue */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--navy)', margin: 0 }}>
                Pending candidate approvals
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink2)', margin: '4px 0 0' }}>
                Review and approve candidate submissions
              </p>
            </div>
            <span className="badge">
              {approvals.length} pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>All submissions reviewed</h3>
              <p style={{ color: 'var(--ink2)', fontSize: 13, margin: 0 }}>
                There are no pending approvals in the review queue.
              </p>
            </div>
          ) : (
            <div>
              {approvals.map(s => (
                <div
                  key={s.id}
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                      Partner: {s.ngo} · Completeness: {s.completeness}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className="btn-pill"
                      style={{ padding: '8px 16px', fontSize: 12 }}
                      onClick={() => approve(s.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-soft"
                      onClick={() => reject(s.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NGO partner overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              NGO partner organizations
            </h3>
            <span className="badge">
              {NGOS.length} registered
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NGOS.slice(0, 4).map(ngo => (
              <div
                key={ngo.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--r-input)',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>
                    {ngo.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                    {ngo.survivors} registered candidates
                  </div>
                </div>
                <span className="badge" style={{ background: 'var(--mist)', color: 'var(--navy)' }}>
                  {ngo.placed} placed
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--ink2)' }}>Aggregate placement rate</span>
              <span style={{ fontWeight: 500, color: 'var(--navy)' }}>60%</span>
            </div>
            <div style={{ height: 6, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: 'var(--royal)', borderRadius: 'var(--r-pill)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top skills distribution card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>
          Workforce demand distribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {ANALYTICS.skillDistribution.map(s => (
            <div key={s.skill}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 500, color: 'var(--navy)' }}>{s.skill}</span>
                <span style={{ color: 'var(--ink2)' }}>{s.count} candidates</span>
              </div>
              <div style={{ height: 6, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(s.count / 32) * 100}%`, background: 'var(--royal)', borderRadius: 'var(--r-pill)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
