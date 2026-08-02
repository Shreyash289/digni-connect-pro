import { useState } from 'react'
import Layout from '../../components/Layout'

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Meena K', email: 'meena@carevia.org', role: 'Survivor', status: 'Active', joined: '2025-05-01' },
    { id: 2, name: 'Recruiter Co', email: 'recruiter@company.com', role: 'Recruiter', status: 'Active', joined: '2025-05-10' },
    { id: 3, name: 'NGO Partner', email: 'ngo@partner.org', role: 'NGO', status: 'Active', joined: '2025-04-15' },
    { id: 4, name: 'Priya S', email: 'priya@carevia.org', role: 'Survivor', status: 'Suspended', joined: '2025-06-01' },
  ])

  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter)

  const toggleStatus = (id) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ))
  }

  const deleteUser = (id) => {
    if (window.confirm('Delete this user permanently?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          👤 User Management
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Manage all platform users and permissions</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, background: '#EFF6FF', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', fontFamily: 'Plus Jakarta Sans' }}>{users.length}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Total Users</div>
        </div>
        <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'Plus Jakarta Sans' }}>{users.filter(u => u.status === 'Active').length}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Active</div>
        </div>
        <div style={{ padding: 16, background: '#FEE2E2', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#DC2626', fontFamily: 'Plus Jakarta Sans' }}>{users.filter(u => u.status === 'Suspended').length}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Suspended</div>
        </div>
        <div style={{ padding: 16, background: '#F5F3FF', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED', fontFamily: 'Plus Jakarta Sans' }}>3</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Roles</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '0.5px solid #E5E7EB',
          fontSize: 13,
          fontFamily: 'Inter'
        }}>
          <option value="all">All Roles</option>
          <option value="Survivor">Survivors</option>
          <option value="Recruiter">Recruiters</option>
          <option value="NGO">NGO Partners</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Joined</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{user.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#2563EB' }}>{user.role}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: user.status === 'Active' ? '#D1FAE5' : '#FEE2E2',
                      color: user.status === 'Active' ? '#059669' : '#DC2626',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{user.joined}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleStatus(user.id)} style={{
                        padding: '6px 10px',
                        background: user.status === 'Active' ? '#FEE2E2' : '#D1FAE5',
                        color: user.status === 'Active' ? '#DC2626' : '#059669',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => deleteUser(user.id)} style={{
                        padding: '6px 10px',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}