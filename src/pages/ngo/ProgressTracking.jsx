import { useState } from 'react'
import Layout from '../../components/Layout'

export default function ProgressTracking() {
  const [survivors] = useState([
    { id: 1, name: 'Meena K', stage: 5, milestone: 'Employed' },
    { id: 2, name: 'Priya S', stage: 3, milestone: 'Interviewing' },
    { id: 3, name: 'Divya R', stage: 4, milestone: 'Offer Received' },
  ])

  const stages = ['Registration', 'Profile Complete', 'Job Applications', 'Interviews', 'Offer', 'Employed']

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📈 Progress Tracking
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Monitor survivor employment journey</p>
      </div>

      {survivors.map(survivor => (
        <div key={survivor.id} className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 2 }}>{survivor.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Current Stage: {stages[survivor.stage - 1]}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {stages.map((stage, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: idx < survivor.stage ? '#059669' : '#E5E7EB',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {idx < survivor.stage ? '✓' : idx + 1}
                </div>
                {idx < stages.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: idx < survivor.stage - 1 ? '#059669' : '#E5E7EB',
                    margin: '0 4px'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Layout>
  )
}