import { useState } from 'react'
import Layout from '../../components/Layout'

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Meena Rajeshwari', email: 'meena@carevia.org', role: 'Survivor', status: 'Active', joined: '2025-05-01' },
    { id: 2, name: 'Recruiter Co', email: 'recruiter@company.com', role: 'Recruiter', status: 'Active', joined: '2025-05-10' },
    { id: 3, name: 'Asha Foundation', email: 'ngo@partner.org', role: 'NGO', status: 'Active', joined: '2025-04-15' },
    { id: 4, name: 'Priya Sundaram', email: 'priya@carevia.org', role: 'Survivor', status: 'Suspended', joined: '2025-06-01' },
  ])

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  const toggleStatus = (id) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ))
  }

  const deleteUser = (id) => {
    if (window.confirm('Delete this user account permanently?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const statItems = [
    { label: 'Total user accounts', value: users.length },
    { label: 'Active status', value: users.filter(u => u.status === 'Active').length },
    { label: 'Suspended status', value: users.filter(u => u.status === 'Suspended').length },
    { label: 'Account roles', value: 3 }
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          User management
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Manage global user access, role permissions, and active account standing
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statItems.map((stat, idx) => {
          const cardClass = idx === 0 ? 'card-light' : idx % 2 === 1 ? 'card-dark' : 'card'
          return (
            <div key={stat.label} className={cardClass} style={{ padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 12 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 40, fontWeight: 300, lineHeight: 1 }}>
                {stat.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter and Search Card */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: '1 1 240px' }}
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: 220, cursor: 'pointer' }}
          >
            <option value="all">All Roles</option>
            <option value="Survivor">Survivors</option>
            <option value="Recruiter">Recruiters</option>
            <option value="NGO">NGO Partners</option>
          </select>
        </div>
      </div>

      {/* Users List inside .card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--navy)', margin: 0 }}>
            Registered user directory
          </h3>
          <span className="badge">
            {filtered.length} users
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>No matching users</h3>
            <p style={{ color: 'var(--ink2)', fontSize: 13, margin: 0 }}>
              Adjust your search keywords or role filter to view users.
            </p>
          </div>
        ) : (
          <div>
            {filtered.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                    {user.email} · Joined {user.joined}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge">
                    {user.role}
                  </span>

                  <span
                    className="badge"
                    style={{
                      background: user.status === 'Active' ? 'var(--mist)' : 'var(--mist)',
                      color: user.status === 'Active' ? 'var(--navy)' : 'var(--ink2)'
                    }}
                  >
                    {user.status}
                  </span>

                  <button
                    className="btn-soft"
                    onClick={() => toggleStatus(user.id)}
                  >
                    {user.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>

                  <button
                    className="btn-soft"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}