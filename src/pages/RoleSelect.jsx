import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { assignInitialRole, resolveHomeAfterAuth } from '../lib/roles'
import logoNavy from '../assets/carevia-logo-navy.png'

const ROLES = [
  {
    id: 'survivor',
    dbRole: 'survivor',
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
    dbRole: 'ngo_partner',
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
    dbRole: 'recruiter',
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
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  // Only signed-in accounts without a role belong here; everyone else is
  // sent straight to their own portal.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return navigate('/login', { replace: true })
      const home = await resolveHomeAfterAuth()
      if (home !== '/select-role') navigate(home, { replace: true })
    })
  }, [navigate])

  const handleSelect = async (role) => {
    if (busy) return
    let extra = {}
    if (role.dbRole === 'recruiter') {
      const companyName = window.prompt('What is your company name?')?.trim()
      if (!companyName) return
      extra = { companyName }
    }
    setBusy(role.id)
    setError('')
    try {
      // Saved in Supabase (user_roles) — this choice is permanent
      await assignInitialRole(role.dbRole, extra)
      navigate(await resolveHomeAfterAuth(), { replace: true })
    } catch (err) {
      setError(err?.message || 'Could not set your role. Please try again.')
    } finally {
      setBusy(null)
    }
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
          Choose your role to access your personalized workspace and tools. You only need to do this once.
        </p>
        {error && (
          <div role="alert" style={{ marginTop: 16, padding: '10px 14px', borderRadius: 'var(--r-input)', background: '#FDECEC', color: '#B42318', fontSize: 13 }}>
            {error}
          </div>
        )}
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
                cursor: busy ? 'wait' : 'pointer',
                opacity: busy && busy !== role.id ? 0.5 : 1,
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
