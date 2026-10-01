import { useCallback, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { LiveBadge } from '../../components/ui'
import { supabase } from '../../integrations/supabase/client'
import {
  listUsers, setUserStatus, deleteUser, subscribeToTables, roleLabel, formatDate, formatDateTime,
} from '../../lib/admin'

const th = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [myId, setMyId] = useState(null)
  const [live, setLive] = useState(false)

  const load = useCallback(async () => {
    try {
      setUsers(await listUsers())
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
    load()
    // audit_logs is included so sign-ins (last_sign_in_at) refresh live too
    return subscribeToTables('admin-users', ['profiles', 'user_roles', 'audit_logs'], load,
      (status) => setLive(status === 'SUBSCRIBED'))
  }, [load])

  const filtered = users.filter((u) => {
    if (filter === 'all') return true
    if (filter === 'none') return u.roles.length === 0
    return u.roles.includes(filter)
  })

  const activeCount = users.filter((u) => u.account_status === 'active').length
  const suspendedCount = users.filter((u) => u.account_status === 'suspended').length
  const rolesInUse = new Set(users.flatMap((u) => u.roles)).size

  const toggleStatus = async (user) => {
    const next = user.account_status === 'active' ? 'suspended' : 'active'
    if (next === 'suspended' && !window.confirm(`Suspend ${user.email}? They will be signed out and blocked from signing in.`)) return
    setBusyId(user.id)
    try {
      await setUserStatus(user.id, next)
      await load()
    } catch (err) {
      window.alert(err.message || 'Could not update the user.')
    } finally {
      setBusyId(null)
    }
  }

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.email} permanently? This cannot be undone.`)) return
    setBusyId(user.id)
    try {
      await deleteUser(user.id)
      await load()
    } catch (err) {
      window.alert(err.message || 'Could not delete the user.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
            👤 User Management
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Manage all platform users and permissions</p>
        </div>
        <LiveBadge live={live} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <Stat value={users.length} label="Total Users" bg="#EFF6FF" color="#2563EB" />
        <Stat value={activeCount} label="Active" bg="#F0FDF4" color="#059669" />
        <Stat value={suspendedCount} label="Suspended" bg="#FEE2E2" color="#DC2626" />
        <Stat value={rolesInUse} label="Roles" bg="#F5F3FF" color="#7C3AED" />
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
          <option value="survivor">Survivors</option>
          <option value="recruiter">Recruiters</option>
          <option value="ngo_partner">NGO Partners</option>
          <option value="admin">Admins</option>
          <option value="none">No role yet</option>
        </select>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 13px', background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '0.5px solid #E5E7EB' }}>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Status</th>
                <th style={th}>Joined</th>
                <th style={th}>Last sign-in</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>Loading users…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>No users found.</td></tr>
              )}
              {filtered.map((user) => {
                const active = user.account_status === 'active'
                const isMe = user.id === myId
                const busy = busyId === user.id
                return (
                  <tr key={user.id} style={{ borderBottom: '0.5px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0C1F3F' }}>{user.full_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: user.roles.length ? '#2563EB' : '#9CA3AF' }}>
                      {user.roles.length ? user.roles.map(roleLabel).join(', ') : 'No role yet'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: active ? '#D1FAE5' : '#FEE2E2',
                        color: active ? '#059669' : '#DC2626',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600
                      }}>
                        {active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{formatDate(user.created_at)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>{formatDateTime(user.last_sign_in_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {isMe ? (
                        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>You</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button disabled={busy} onClick={() => toggleStatus(user)} style={{
                            padding: '6px 10px',
                            background: active ? '#FEE2E2' : '#D1FAE5',
                            color: active ? '#DC2626' : '#059669',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: busy ? 'wait' : 'pointer',
                            opacity: busy ? 0.6 : 1
                          }}>
                            {active ? 'Suspend' : 'Activate'}
                          </button>
                          <button disabled={busy} onClick={() => removeUser(user)} style={{
                            padding: '6px 10px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: busy ? 'wait' : 'pointer',
                            opacity: busy ? 0.6 : 1
                          }}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

function Stat({ value, label, bg, color }) {
  return (
    <div style={{ padding: 16, background: bg, borderRadius: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'Plus Jakarta Sans' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>{label}</div>
    </div>
  )
}
