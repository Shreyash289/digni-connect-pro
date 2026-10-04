import { useNavigate } from 'react-router-dom'
import logoNavy from '../assets/carevia-logo-navy.png'

const ROLES = [
  {
    id: 'survivor',
    title: 'Survivor / Intern',
    desc: 'Create your profile, get AI career guidance, track your journey to employment.',
    path: '/survivor',
    isSurvivor: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
  {
    id: 'ngo',
    title: 'NGO Partner',
    desc: 'Manage survivors, upload documents, track placements and verify progress.',
    path: '/ngo',
    isSurvivor: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    id: 'recruiter',
    title: 'Recruiter',
    desc: 'Search verified survivor talent, filter by skills, download resumes, and hire directly.',
    path: '/recruiter',
    isSurvivor: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
      </svg>
    )
  },
  {
    id: 'admin',
    title: 'Platform Admin',
    desc: 'Approve profiles, manage NGOs, monitor platform analytics, and review audit logs.',
    path: '/admin',
    isSurvivor: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()

  const handleSelect = (role) => {
    localStorage.setItem('role', role.id)
    navigate(role.path)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '48px 24px'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          <img
            src={logoNavy}
            alt="CareVia Logo"
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 500, fontSize: 18, color: 'var(--navy)', letterSpacing: '-0.3px' }}>
            CAREVIA
          </span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 300,
            color: 'var(--navy)',
            marginBottom: 8,
            letterSpacing: '-1.2px'
          }}
        >
          Select your portal
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink2)', margin: 0, fontWeight: 400 }}>
          Choose your role to access your personalized workspace and tools
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 360px))',
          gap: 20,
          maxWidth: 760,
          width: '100%',
          justifyContent: 'center'
        }}
      >
        {ROLES.map((role) => {
          const cardClass = role.isSurvivor ? 'card-light' : 'card-dark'
          return (
            <div
              key={role.id}
              className={cardClass}
              onClick={() => handleSelect(role)}
              style={{
                cursor: 'pointer',
                borderRadius: 'var(--r-card)',
                transition: 'transform 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--r-pill)',
                    background: role.isSurvivor ? 'rgba(15, 34, 80, 0.1)' : 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: role.isSurvivor ? 'var(--navy)' : '#ffffff',
                    marginBottom: 20
                  }}
                >
                  {role.icon}
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: role.isSurvivor ? 'var(--navy)' : '#ffffff',
                    marginBottom: 8
                  }}
                >
                  {role.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: role.isSurvivor ? 'var(--ink2)' : '#B8C6EA',
                    lineHeight: 1.5,
                    marginBottom: 24,
                    fontWeight: 400
                  }}
                >
                  {role.desc}
                </p>
              </div>

              <div>
                <button
                  className={role.isSurvivor ? 'btn-pill' : 'btn-soft'}
                  style={{
                    padding: '9px 18px',
                    fontSize: 13,
                    background: role.isSurvivor ? 'var(--navy)' : 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff'
                  }}
                >
                  Enter portal →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 36, fontSize: 13, color: 'var(--ink2)' }}>
        Need to sign in to another account?{' '}
        <span
          style={{ color: 'var(--royal)', cursor: 'pointer', fontWeight: 500 }}
          onClick={() => navigate('/login')}
        >
          Back to sign in
        </span>
      </div>
    </div>
  )
}
