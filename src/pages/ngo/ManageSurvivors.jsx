import { useState } from 'react'
import Layout from '../../components/Layout'

export default function ManageSurvivors() {
  const [survivors, setSurvivors] = useState([])

  const approveSurvivor = (id) => {
    setSurvivors(survivors.map(s => s.id === id ? { ...s, status: 'Approved' } : s))
  }

  const rejectSurvivor = (id) => {
    setSurvivors(survivors.filter(s => s.id !== id))
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
            Manage candidate roster
          </h2>
          <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
            Review registrations, verify intake documentation, and update placement status
          </p>
        </div>
        <button
          className="btn-pill"
          onClick={() => alert('Add candidate intake form triggered')}
        >
          Add candidate
        </button>
      </div>

      {survivors.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>
            No candidates registered yet
          </h3>
          <p style={{ color: 'var(--ink2)', fontSize: 14, maxWidth: 440, margin: '0 auto 24px' }}>
            New survivor intakes submitted by your regional partners will appear here for verification.
          </p>
          <button
            className="btn-pill"
            onClick={() => alert('Add candidate intake form triggered')}
          >
            Register new candidate
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              Registered candidates
            </h3>
            <span className="badge">
              {survivors.length} total
            </span>
          </div>

          <div>
            {survivors.map(survivor => (
              <div
                key={survivor.id}
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
                    {survivor.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                    {survivor.email}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge">
                    {survivor.status}
                  </span>

                  {survivor.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-pill"
                        style={{ padding: '8px 16px', fontSize: 12 }}
                        onClick={() => approveSurvivor(survivor.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-soft"
                        onClick={() => rejectSurvivor(survivor.id)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="btn-soft" onClick={() => alert(`Reviewing ${survivor.name}`)}>
                      View details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}