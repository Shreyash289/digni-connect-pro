import { supabase } from '../integrations/supabase/client'

export const ROLE_HOME = {
  survivor: '/survivor',
  ngo_partner: '/ngo',
  recruiter: '/recruiter',
  admin: '/admin',
  super_admin: '/admin',
}

export async function fetchMyRoles() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { session: null, roles: [] }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)

  if (error) throw error
  return { session, roles: (data ?? []).map((r) => r.role) }
}

export function homePathForRoles(roles) {
  for (const role of ['super_admin', 'admin', 'ngo_partner', 'recruiter', 'survivor']) {
    if (roles.includes(role)) return ROLE_HOME[role]
  }
  return null
}

// Where to send a user right after sign-in/sign-up. The role picked at signup
// is stored in user_metadata.signup_role and assigned by a database trigger;
// if that trigger hasn't run (older accounts / migration not applied yet) we
// assign it here so the user is never asked to choose a role twice.
export async function resolveHomeAfterAuth() {
  let { session, roles } = await fetchMyRoles()
  if (!session) return '/login'

  if (roles.length === 0) {
    const meta = session.user.user_metadata ?? {}
    if (['survivor', 'ngo_partner', 'recruiter'].includes(meta.signup_role)) {
      try {
        await assignInitialRole(meta.signup_role, { companyName: meta.company_name || 'My Company' })
      } catch (err) {
        console.error(err)
      }
      ;({ roles } = await fetchMyRoles())
    }
  }
  return homePathForRoles(roles) ?? '/select-role'
}

// Persists a self-selected role for a brand-new account.
// Matches the `self_assign_initial_role` / `self_assign_recruiter_role`
// RPCs defined in supabase/SQL_EDITOR_FULL_SETUP.sql — 'admin' is
// intentionally not self-assignable there, so it's not offered here either.
export async function assignInitialRole(role, extra = {}) {
  if (role === 'recruiter') {
    const { error } = await supabase.rpc('self_assign_recruiter_role', {
      _company_name: extra.companyName,
      _company_website: extra.companyWebsite ?? null,
    })
    if (error) throw error
    return
  }

  const { error } = await supabase.rpc('self_assign_initial_role', { _role: role })
  if (error) throw error
}
