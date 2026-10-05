import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Logo from './ui/Logo'
import { supabase } from '../integrations/supabase/client'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // AuthGuard stores the real role from user_roles; the DB calls the NGO role "ngo_partner"
  const storedRole = localStorage.getItem('role') || 'survivor'
  const role = storedRole === 'ngo_partner' ? 'ngo' : storedRole === 'super_admin' ? 'admin' : storedRole
  const userEmail = localStorage.getItem('email') || ''

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
        setMobileMenuOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    navigate('/')
  }

  const roleHomePaths = {
    survivor: '/survivor',
    recruiter: '/recruiter',
    ngo: '/ngo',
    admin: '/admin'
  }

  const roleLabels = {
    survivor: 'Survivor Portal',
    recruiter: 'Recruiter Portal',
    ngo: 'NGO Portal',
    admin: 'Admin Portal'
  }

  const MENUS = {
    survivor: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/survivor',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        )
      },
      {
        id: 'profile',
        label: 'My Profile',
        path: '/survivor/profile',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        )
      },
      {
        id: 'jobs',
        label: 'Job Board',
        path: '/survivor/jobs',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        )
      },
      {
        id: 'applications',
        label: 'My Applications',
        path: '/survivor/applications',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <path d="m9 14 2 2 4-4"/>
          </svg>
        )
      },
      {
        id: 'docs',
        label: 'My Documents',
        path: '/survivor/docs',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" x2="8" y1="13" y2="13"/>
            <line x1="16" x2="8" y1="17" y2="17"/>
            <line x1="10" x2="8" y1="9" y2="9"/>
          </svg>
        )
      },
      {
        id: 'resume',
        label: 'Resume',
        path: '/survivor/resume',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" x2="8" y1="13" y2="13"/>
            <line x1="16" x2="8" y1="17" y2="17"/>
            <line x1="10" x2="8" y1="9" y2="9"/>
          </svg>
        )
      },
      {
        id: 'skills',
        label: 'Skills',
        path: '/survivor/skills',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        )
      },
      {
        id: 'courses',
        label: 'Courses / Learning',
        path: '/survivor/courses',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        )
      },
      {
        id: 'ai',
        label: 'AI Mentor',
        path: '/survivor/ai',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        )
      },
    ],
    recruiter: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/recruiter',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        )
      },
      {
        id: 'jobs',
        label: 'Job Postings',
        path: '/recruiter/jobs',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        )
      },
      {
        id: 'applicants',
        label: 'Applicants',
        path: '/recruiter/applicants',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      },
      {
        id: 'search',
        label: 'Search Talent',
        path: '/recruiter/search',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" x2="16.65" y1="21" y2="16.65"/>
          </svg>
        )
      },
      {
        id: 'shortlisted',
        label: 'Shortlisted',
        path: '/recruiter/shortlisted',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        )
      },
      {
        id: 'interviews',
        label: 'My Interviews',
        path: '/recruiter/interviews',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
        )
      },
    ],
    ngo: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/ngo',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        )
      },
      {
        id: 'survivors',
        label: 'Manage Survivors',
        path: '/ngo/survivors',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      },
      {
        id: 'progress',
        label: 'Progress Tracking',
        path: '/ngo/progress',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
        )
      },
      {
        id: 'documents',
        label: 'Document Verification',
        path: '/ngo/documents',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="m9 15 2 2 4-4"/>
          </svg>
        )
      },
    ],
    admin: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        )
      },
      {
        id: 'users',
        label: 'User Management',
        path: '/admin/users',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      },
      {
        id: 'logs',
        label: 'Audit Logs',
        path: '/admin/logs',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        )
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/admin/analytics',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="18" y1="20" y2="10"/>
            <line x1="12" x2="12" y1="20" y2="4"/>
            <line x1="6" x2="6" y1="20" y2="14"/>
          </svg>
        )
      },
    ]
  }

  const menu = MENUS[role] || MENUS.survivor

  const renderNavContent = () => (
    <>
      {/* Logo Header */}
      <div
        onClick={() => navigate(roleHomePaths[role] || '/survivor')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 8px 24px 8px',
          cursor: 'pointer',
          borderBottom: '1px solid var(--line)',
          marginBottom: 16
        }}
      >
        <Logo size={28} withWordmark={(sidebarOpen || mobileMenuOpen)} variant="navy" />
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {menu.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`cv-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              style={{
                justifyContent: (sidebarOpen || mobileMenuOpen) ? 'flex-start' : 'center'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        {(sidebarOpen || mobileMenuOpen) && (
          <div style={{ padding: '4px 8px' }}>
            <div style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500, marginBottom: 2 }}>
              LOGGED IN AS
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
            <div style={{ marginTop: 4 }}>
              <span className="cv-badge">
                {role.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="cv-soft"
          style={{
            width: '100%',
            justifyContent: (sidebarOpen || mobileMenuOpen) ? 'flex-start' : 'center',
            padding: (sidebarOpen || mobileMenuOpen) ? '10px 16px' : '10px'
          }}
          title="Logout"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          {(sidebarOpen || mobileMenuOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', position: 'relative' }}>
      {/* Desktop Floating Sidebar */}
      {!isMobile && (
        <aside
          className="cv-side"
          style={{
            width: sidebarOpen ? 260 : 76,
            margin: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            transition: 'width 0.2s ease',
            minHeight: 'calc(100vh - 32px)',
            position: 'sticky',
            top: 16,
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto'
          }}
        >
          {renderNavContent()}
        </aside>
      )}

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 34, 80, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}
      {isMobile && (
        <aside
          className="cv-side"
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            bottom: 12,
            width: 280,
            margin: 0,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-110%)',
            transition: 'transform 0.25s ease',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="cv-soft"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              ✕ Close
            </button>
          </div>
          {renderNavContent()}
        </aside>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Floating Topbar */}
        <header
          className="cv-card"
          style={{
            margin: isMobile ? '12px 12px 0 12px' : '16px 16px 0 0',
            padding: '12px 24px',
            borderRadius: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          {/* Left: Menu toggle & user/portal label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarOpen(!sidebarOpen)}
              className="cv-soft"
              style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Toggle Navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="12" y2="12"/>
                <line x1="3" x2="21" y1="6" y2="6"/>
                <line x1="3" x2="21" y1="18" y2="18"/>
              </svg>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                {userEmail}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink2)' }}>
                {roleLabels[role] || 'Portal'}
              </span>
            </div>
          </div>

          {/* Right: Role Switcher / Profile Pill Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleLogout}
              className="cv-soft"
              style={{ fontSize: 13, padding: '9px 18px' }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: isMobile ? '16px 12px 24px' : '20px 16px 32px 0', flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}