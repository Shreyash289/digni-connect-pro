import { useNavigate } from 'react-router-dom'

const ROLES = [
  { id: 'survivor', icon: '👤', title: 'Survivor / Intern', desc: 'Create your profile, get AI career guidance, track your journey to employment.', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', path: '/survivor' },
  { id: 'ngo',      icon: '🤝', title: 'NGO Partner',       desc: 'Manage survivors, upload documents, track placements and progress.', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', path: '/ngo' },
  { id: 'recruiter',icon: '🔎', title: 'Recruiter',         desc: 'Search verified survivor talent, filter by skills, download resumes, hire directly.', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', path: '/recruiter' },
  { id: 'admin',    icon: '⚙️', title: 'Platform Admin',    desc: 'Approve profiles, manage NGOs, monitor platform analytics and insights.', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', path: '/admin' },
]

export default function RoleSelect() {
  const navigate = useNavigate()

  const handleSelect = (role) => {
    localStorage.setItem('role', role.id)
    navigate(role.path)
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 360px)', gap: 20, maxWidth: 760 }}>
        {ROLES.map((role, i) => (
          <div key={role.id} className="card card-hover fade-in" onClick={() => handleSelect(role)}
            style={{ padding: '28px', cursor: 'pointer', border: `1.5px solid ${role.border}`, background: role.bg, animationDelay: `${i * 0.08}s` }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>{role.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: role.color, marginBottom: 10, fontFamily: 'Plus Jakarta Sans' }}>{role.title}</h3>
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>{role.desc}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: role.color, fontSize: 13, fontWeight: 600 }}>
              Enter portal →
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, fontSize: 13, color: '#9CA3AF' }}>
        Not the right role?{' '}
        <span style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/login')}>Go back</span>
      </div>
    </div>
  )
}
