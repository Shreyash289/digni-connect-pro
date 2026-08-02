import { useNavigate, useLocation } from 'react-router-dom'

const MENUS = {
  survivor: [
    { icon: '🏠', label: 'Dashboard',       path: '/survivor' },
    { icon: '👤', label: 'My Profile',       path: '/survivor/profile' },
    { icon: '🤖', label: 'AI Mentor',        path: '/survivor/ai' },
    { icon: '💼', label: 'Job Board',        path: '/survivor/jobs' },
    { icon: '📋', label: 'My Applications', path: '/survivor/applications' },
    { icon: '📄', label: 'My Documents',     path: '/survivor/docs' },
    { icon: '🤖', label: 'AI Mentor', path: '/survivor/ai' },
  ],
  recruiter: [
    { icon: '🏠', label: 'Dashboard',       path: '/recruiter' },
    { icon: '🔍', label: 'Search Talent',   path: '/recruiter/search' },
    { icon: '📌', label: 'Shortlisted',     path: '/recruiter/shortlisted' },
    { icon: '💼', label: 'My Job Posts',    path: '/recruiter/jobs' },
    { icon: '📅', label: 'My Interviews',   path: '/recruiter/interviews' },
  ],
  ngo: [
    { icon: '🏠', label: 'Dashboard',       path: '/ngo' },
    { icon: '👥', label: 'My Survivors',    path: '/ngo/survivors' },
    { icon: '➕', label: 'Add Survivor',    path: '/ngo/add' },
    { icon: '📂', label: 'Documents',       path: '/ngo/documents' },
    { icon: '📈', label: 'Progress',        path: '/ngo/progress' },
  ],
  admin: [
    { icon: '🏠', label: 'Dashboard',       path: '/admin' },
    { icon: '✅', label: 'Approvals',       path: '/admin/approvals' },
    { icon: '🤝', label: 'NGO Partners',    path: '/admin/ngos' },
    { icon: '🔎', label: 'Recruiters',      path: '/admin/recruiters' },
    { icon: '📊', label: 'Analytics',       path: '/admin/analytics' },
    { icon: '👤', label: 'User Management', path: '/admin/users' },
    { icon: '📋', label: 'Audit Logs', path: '/admin/logs' },
    { icon: '📊', label: 'Analytics', path: '/admin/analytics' },
  ],
}

const ROLE_LABELS = {
  survivor: 'Survivor Portal',
  recruiter: 'Recruiter Portal',
  ngo: 'NGO Partner Portal',
  admin: 'Admin Command',
}

const ROLE_COLORS = {
  survivor: '#0D9488',
  recruiter: '#7C3AED',
  ngo: '#2563EB',
  admin: '#DC2626',
}

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem('role') || 'survivor'
  const email = localStorage.getItem('email') || 'user@carevia.org'
  const menu = MENUS[role] || MENUS.survivor

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', padding: '0', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: ROLE_COLORS[role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans' }}>C</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans' }}>CAREVIA</div>
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: '0.04em' }}>SURVIVOR REPOSITORY</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '6px 10px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: ROLE_COLORS[role], letterSpacing: '0.06em', textTransform: 'uppercase' }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {menu.map(item => (
            <div
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '8px 10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: ROLE_COLORS[role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {email.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, color: '#F9FAFB', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
              <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'capitalize' }}>{role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '9px', borderRadius: 8, background: 'rgba(220,38,38,0.12)', color: '#F87171', border: '0.5px solid rgba(220,38,38,0.2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E7EB', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>
              {menu.find(m => m.path === location.pathname)?.label || 'Dashboard'}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Digital Survivor Repository — CAREVIA</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>System Live</span>
            <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
            <span style={{ fontSize: 13, color: '#374151' }}>June 2025</span>
          </div>
        </div>

        <div style={{ padding: '28px' }} className="fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
