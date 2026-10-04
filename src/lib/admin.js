import { supabase } from '../integrations/supabase/client'

// RPCs defined in supabase/migrations/20261001000000_admin_live_users_audit.sql.
// All of them re-check is_admin() server-side.

export async function listUsers() {
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw error
  return data ?? []
}

export async function setUserStatus(userId, status) {
  const { error } = await supabase.rpc('admin_set_user_status', { _user_id: userId, _status: status })
  if (error) throw error
}

export async function deleteUser(userId) {
  const { error } = await supabase.rpc('admin_delete_user', { _user_id: userId })
  if (error) throw error
}

export async function listAuditLogs(limit = 500) {
  const { data, error } = await supabase.rpc('admin_list_audit_logs', { _limit: limit })
  if (error) throw error
  return data ?? []
}

// Calls `onChange` (debounced) whenever any of the given public tables change.
// Returns an unsubscribe function for useEffect cleanup.
export function subscribeToTables(channelName, tables, onChange, onStatus) {
  let timer
  const fire = () => {
    clearTimeout(timer)
    timer = setTimeout(onChange, 300)
  }

  let channel = supabase.channel(channelName)
  for (const table of tables) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, fire)
  }
  channel.subscribe((status) => onStatus?.(status))

  return () => {
    clearTimeout(timer)
    supabase.removeChannel(channel)
  }
}

export const ROLE_LABELS = {
  survivor: 'Survivor',
  recruiter: 'Recruiter',
  ngo_partner: 'NGO',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role
}

const ENTITY_LABELS = {
  ngo: 'NGO',
  survivor: 'survivor profile',
  recruiter: 'recruiter profile',
  job: 'job posting',
  job_application: 'job application',
  document: 'document',
  intro_request: 'introduction request',
  interview: 'interview',
}

const humanize = (s) => String(s ?? '').replace(/_/g, ' ')

export function describeAuditAction(log) {
  const m = log.metadata ?? {}
  switch (log.action) {
    case 'user.signed_up': return 'Created an account'
    case 'user.signed_in': return 'Signed in'
    case 'user.login_failed': return 'Failed login attempt'
    case 'user.suspended': return 'Suspended user account'
    case 'user.reactivated': return 'Reactivated user account'
    case 'user.deleted': return 'Deleted user account'
    case 'role.assigned': return `Assigned role: ${roleLabel(m.role)}`
    case 'role.removed': return `Removed role: ${roleLabel(m.role)}`
  }

  const [entity, verb] = String(log.action).split('.')
  const label = ENTITY_LABELS[entity] ?? humanize(entity)
  if (verb === 'created') {
    if (entity === 'document') return 'Uploaded document'
    if (entity === 'job_application') return 'Submitted job application'
    return `Created ${label}`
  }
  if (verb === 'status_changed') {
    return `Changed ${label} status: ${humanize(m.from) || '—'} → ${humanize(m.to) || '—'}`
  }
  if (verb === 'deleted') return `Deleted ${label}`
  return humanize(log.action)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}
