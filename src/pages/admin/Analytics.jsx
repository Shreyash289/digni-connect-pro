import { useState } from 'react'
import Layout from '../../components/Layout'

export default function Analytics() {
  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          📊 Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Platform insights and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, background: '#EFF6FF', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Total Users</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>2,450</div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>↑ 12% this month</div>
        </div>
        <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Placements</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>248</div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>↑ 8% this month</div>
        </div>
        <div style={{ padding: 16, background: '#FEF3C7', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Active Jobs</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706', fontFamily: 'Plus Jakarta Sans' }}>156</div>
          <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>→ No change</div>
        </div>
        <div style={{ padding: 16, background: '#F5F3FF', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Success Rate</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED', fontFamily: 'Plus Jakarta Sans' }}>94%</div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>↑ 2% this month</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 16 }}>📈 Monthly Placements</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
            {[40, 55, 65, 75, 82, 88, 92].map((height, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${height}%`,
                background: '#2563EB',
                borderRadius: 4
              }} title={`Month ${i + 1}: ${height}`} />
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 16 }}>👥 User Distribution</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: 'Survivors', value: 1200, color: '#2563EB' },
              { label: 'Recruiters', value: 850, color: '#059669' },
              { label: 'NGO Partners', value: 400, color: '#D97706' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0C1F3F' }}>{item.value}</span>
                </div>
                <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(item.value / 1200) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1F3F', marginBottom: 16 }}>🔔 Recent Activities</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { activity: '5 new survivor registrations', time: '2 hours ago' },
            { activity: '12 job applications received', time: '4 hours ago' },
            { activity: '3 successful placements', time: '1 day ago' },
            { activity: 'System backup completed', time: '2 days ago' }
          ].map((item, i) => (
            <div key={i} style={{ padding: 12, background: '#F9FAFB', borderRadius: 6, borderLeft: '3px solid #2563EB' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1F3F' }}>{item.activity}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{item.time}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}