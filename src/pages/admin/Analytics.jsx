import Layout from '../../components/Layout'

export default function Analytics() {
  const kpiData = [
    { label: 'Registered candidates', value: '2,450', change: '+12% month-over-month' },
    { label: 'Verified career placements', value: '248', change: '+8% month-over-month' },
    { label: 'Active employer postings', value: '156', change: 'Steady volume' },
    { label: 'Placement retention rate', value: '94%', change: '+2% month-over-month' }
  ]

  const monthlyPlacements = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 55 },
    { month: 'Mar', value: 65 },
    { month: 'Apr', value: 75 },
    { month: 'May', value: 82 },
    { month: 'Jun', value: 88 },
    { month: 'Jul', value: 92 }
  ]

  const userDistribution = [
    { label: 'Survivors / Candidates', value: 1200, percent: 50 },
    { label: 'Recruiters / Employers', value: 850, percent: 35 },
    { label: 'NGO / Community Partners', value: 400, percent: 15 }
  ]

  const recentMilestones = [
    { activity: '5 verified survivor candidate registrations', time: '2 hours ago' },
    { activity: '12 applications submitted to partner companies', time: '4 hours ago' },
    { activity: '3 successful career placements confirmed', time: '1 day ago' },
    { activity: 'Automated compliance security audit completed', time: '2 days ago' }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          Platform analytics
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Comprehensive performance metrics, placement trends, and platform engagement
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {kpiData.map((kpi, idx) => {
          const cardClass = idx === 0 ? 'card-light' : idx % 2 === 1 ? 'card-dark' : 'card'
          return (
            <div key={kpi.label} className={cardClass} style={{ padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 8 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {kpi.change}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Monthly Placements Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              Monthly placement growth
            </h3>
            <span className="badge">
              2025 Trend
            </span>
          </div>

          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 200, position: 'relative' }}>
              {/* Horizontal gridlines */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed var(--line)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed var(--line)' }} />

              {monthlyPlacements.map((item) => (
                <div
                  key={item.month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    zIndex: 2
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${item.value}%`,
                      background: 'var(--royal)',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      transition: 'height 0.3s'
                    }}
                    title={`${item.month}: ${item.value} placements`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Month labels */}
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 12, color: 'var(--ink2)' }}>
            {monthlyPlacements.map(item => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>
        </div>

        {/* User Distribution Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: 'var(--navy)', margin: 0 }}>
              User ecosystem distribution
            </h3>
            <span className="badge">
              2,450 Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {userDistribution.map((item, i) => {
              const barColor = i === 0 ? 'var(--royal)' : i === 1 ? 'var(--navy)' : 'var(--sky)'
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500, color: 'var(--navy)' }}>{item.label}</span>
                    <span style={{ color: 'var(--ink2)' }}>{item.value} ({item.percent}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--mist)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.percent}%`, background: barColor, borderRadius: 'var(--r-pill)' }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 24, padding: 14, background: 'var(--bg)', borderRadius: 'var(--r-input)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--ink2)' }}>
            Verified survivors represent 50% of the active ecosystem membership base.
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>
            Platform milestones & events
          </h3>
        </div>
        <div>
          {recentMilestones.map((item, i) => (
            <div
              key={i}
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                {item.activity}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}