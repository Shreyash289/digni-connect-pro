import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { assignInitialRole, fetchMyRoles, homePathForRoles, resolveHomeAfterAuth } from '../lib/roles'

const ROLES = [
  { id: 'survivor', icon: '👤', title: 'Survivor / Intern', desc: 'Create your profile, get AI career guidance, track your journey to employment.', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  { id: 'ngo_partner', icon: '🤝', title: 'NGO Partner', desc: 'Manage survivors, upload documents, track placements and progress.', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'recruiter', icon: '🔎', title: 'Recruiter', desc: 'Search verified survivor talent, filter by skills, download resumes, hire directly.', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [companyPrompt, setCompanyPrompt] = useState(false)
  const [companyName, setCompanyName] = useState('')

  // Only accounts with no role at all should ever see this page
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return navigate('/login', { replace: true })
      const home = await resolveHomeAfterAuth()
      if (home !== '/select-role') navigate(home, { replace: true })
    })
  }, [navigate])

  async function commitRole(roleId, extra) {
    setError('')
    setBusy(roleId)
    try {
      await assignInitialRole(roleId, extra)
      const { roles } = await fetchMyRoles()
      navigate(homePathForRoles(roles) ?? '/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set your role. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const handleSelect = (role) => {
    if (role.id === 'recruiter') {
      setCompanyPrompt(true)
      return
    }
    commitRole(role.id)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF9F6', padding: '40px 24px' }}>
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0C1F3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans' }}>C</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans' }}>CAREVIA</div>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0C1F3F', marginBottom: 10, fontFamily: 'Plus Jakarta Sans' }}>How are you using the platform?</h2>
        <p style={{ fontSize: 16, color: '#6B7280' }}>Select your role to access your personalized portal</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '10px 16px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {companyPrompt ? (
        <div className="card" style={{ padding: 28, maxWidth: 360, width: '100%' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0C1F3F', marginBottom: 12, fontFamily: 'Plus Jakarta Sans' }}>
            What's your company name?
          </h3>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
            style={{ width: '100%', padding: '11px 13px', border: '0.5px solid #E5E7EB', borderRadius: 6, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCompanyPrompt(false)}
              style={{ flex: 1, padding: '11px 13px', background: 'transparent', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Back
            </button>
            <button
              onClick={() => commitRole('recruiter', { companyName: companyName.trim() })}
              disabled={!companyName.trim() || busy === 'recruiter'}
              style={{
                flex: 1, padding: '11px 13px', background: companyName.trim() ? '#2563EB' : '#D1D5DB', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: companyName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {busy === 'recruiter' ? 'Setting up…' : 'Continue →'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 360px)', gap: 20, maxWidth: 760 }}>
          {ROLES.map((role, i) => (
            <div key={role.id} className="card card-hover fade-in" onClick={() => (busy ? null : handleSelect(role))}
              style={{
                padding: '28px', cursor: busy ? 'wait' : 'pointer', border: `1.5px solid ${role.border}`,
                background: role.bg, animationDelay: `${i * 0.08}s`, opacity: busy && busy !== role.id ? 0.5 : 1,
              }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{role.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: role.color, marginBottom: 10, fontFamily: 'Plus Jakarta Sans' }}>{role.title}</h3>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>{role.desc}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: role.color, fontSize: 13, fontWeight: 600 }}>
                {busy === role.id ? 'Setting up…' : 'Enter portal →'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 13, color: '#9CA3AF' }}>
        Not the right role?{' '}
        <span style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/login')}>Go back</span>
      </div>
    </div>
  )
}
