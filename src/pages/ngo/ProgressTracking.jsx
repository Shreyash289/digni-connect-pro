import { useState } from 'react'
import Layout from '../../components/Layout'

const STAGES = [
  'Profile Created',
  'Resume Ready',
  'Interview Ready',
  'Applied',
  'Placed'
]

export default function ProgressTracking() {
  const [survivors] = useState([
    { id: 1, name: 'Meena Rajeshwari', stage: 5, targetRole: 'Data Entry Operator' },
    { id: 2, name: 'Priya Sundaram', stage: 3, targetRole: 'Customer Service' },
    { id: 3, name: 'Divya Kumar', stage: 4, targetRole: 'Administrative Assistant' },
  ])

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Progress tracking
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Monitor candidate milestones across the five-stage vocational pathway
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {survivors.map(survivor => {
          const currentStageName = STAGES[survivor.stage - 1] || 'In Progress'
          const completionPercentage = Math.round((survivor.stage / STAGES.length) * 100)

          return (
            <div key={survivor.id} className="card" style={{ padding: 28 }}>
              {/* Candidate info header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--navy)', marginBottom: 4 }}>
                    {survivor.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                    Target role: {survivor.targetRole}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{ fontSize: 12, padding: '5px 14px' }}>
                    Stage {survivor.stage} of 5: {currentStageName}
                  </span>
                </div>
              </div>

              {/* Horizontal Pill Stepper */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {STAGES.map((stage, idx) => {
                  const stageNum = idx + 1
                  const isCompleted = stageNum < survivor.stage
                  const isCurrent = stageNum === survivor.stage
                  const isUpcoming = stageNum > survivor.stage

                  const bgColor = isCompleted ? 'var(--navy)' : isCurrent ? 'var(--royal)' : 'var(--mist)'
                  const textColor = isCompleted || isCurrent ? '#ffffff' : 'var(--ink2)'

                  return (
                    <div
                      key={stage}
                      style={{
                        background: bgColor,
                        color: textColor,
                        padding: '10px 14px',
                        borderRadius: 'var(--r-pill)',
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        minWidth: 120,
                        transition: 'background 0.2s'
                      }}
                    >
                      <span>{isCompleted ? '✓' : stageNum}.</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stage}</span>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink2)', marginBottom: 6 }}>
                  <span>Pathway completion</span>
                  <span style={{ fontWeight: 500, color: 'var(--navy)' }}>{completionPercentage}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${completionPercentage}%`,
                      background: 'var(--royal)',
                      borderRadius: 'var(--r-pill)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}