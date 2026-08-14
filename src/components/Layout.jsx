import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const role = localStorage.getItem('role') || 'survivor'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const MENUS = {
    survivor: [
      { icon: '🏠', label: 'Dashboard', path: '/survivor' },
      { icon: '👤', label: 'My Profile', path: '/survivor/profile' },
      { icon: '💼', label: 'Job Board', path: '/survivor/jobs' },
      { icon: '📋', label: 'My Applications', path: '/survivor/applications' },
      { icon: '📄', label: 'My Documents', path: '/survivor/docs' },
      { icon: '🤖', label: 'AI Mentor', path: '/survivor/ai' },
    ],
    recruiter: [
      { icon: '🏠', label: 'Dashboard', path: '/recruiter' },
      { icon: '🔍', label: 'Search Talent', path: '/recruiter/search' },
      { icon: '📌', label: 'Shortlisted', path: '/recruiter/shortlisted' },
      { icon: '📅', label: 'My Interviews', path: '/recruiter/interviews' },
    ],
    ngo: [
      { icon: '🏠', label: 'Dashboard', path: '/ngo' },
      { icon: '👥', label: 'Manage Survivors', path: '/ngo/survivors' },
      { icon: '📈', label: 'Progress Tracking', path: '/ngo/progress' },
      { icon: '📄', label: 'Document Verification', path: '/ngo/documents' },
    ],
    admin: [
      { icon: '🏠', label: 'Dashboard', path: '/admin' },
      { icon: '👤', label: 'User Management', path: '/admin/users' },
      { icon: '📋', label: 'Audit Logs', path: '/admin/logs' },
      { icon: '📊', label: 'Analytics', path: '/admin/analytics' },
    ]
  }

  const menu = MENUS[role] || MENUS.survivor

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF9F6' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 260 : 80,
        background: '#0C1F3F',
        color: '#fff',
        padding: 20,
        transition: 'width 0.3s',
        overflowY: 'auto',
        borderRight: '0.5px solid rgba(255,255,255,0.1)'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 32,
          cursor: 'pointer'
        }} onClick={() => navigate('/survivor')}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800
          }}>
            C
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>CAREVIA</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>v1.0</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {menu.map(item => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                transition: 'background 0.2s',
                background: 'rgba(255,255,255,0.05)',
                '&:hover': { background: 'rgba(255,255,255,0.1)' }
              }} className="sidebar-item">
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        {/* User Profile */}
        <div style={{
          padding: 12,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          marginBottom: 16,
          borderTop: '0.5px solid rgba(255,255,255,0.1)',
          paddingTop: 16
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>LOGGED IN AS</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
            {localStorage.getItem('email') || 'User'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize', marginBottom: 12 }}>
            {role.toUpperCase()} Portal
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 12px',
            borderRadius: 8,
            background: 'rgba(220, 38, 38, 0.1)',
            color: '#FCA5A5',
            border: '0.5px solid rgba(220, 38, 38, 0.3)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <span>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#fff',
          borderBottom: '0.5px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#0C1F3F'
            }}
          >
            ☰
          </button>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            {role.toUpperCase()} PORTAL
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>

      <style>{`
        .sidebar-item:hover {
          background: rgba(255,255,255,0.1) !important;
        }
        .card {
          background: #fff;
          border-radius: 8px;
          border: 0.5px solid #E5E7EB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: #E5E7EB;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563EB, #0D9488);
          border-radius: 3px;
        }
      `}</style>
    </div>
  )
}