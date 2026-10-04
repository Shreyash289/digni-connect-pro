import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../integrations/supabase/client'
import { ROLE_HOME, homePathForRoles } from '../lib/roles'
import LoadingScreen from './LoadingScreen'

// Gates a dashboard route behind a real Supabase session + a matching role
// in the `user_roles` table. Redirects rather than rendering when either
// check fails, so visiting /admin by URL alone gets you nowhere without
// a real 'admin' or 'super_admin' role row.
export default function AuthGuard({ allow, children }) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const checked = useRef(false)
  const allowKey = allow.join(',')

  useEffect(() => {
    let active = true

    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (active) navigate('/login', { replace: true })
        return
      }

      // A suspended user may still hold a valid access token until it expires
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!active) return

      if (profile?.account_status === 'suspended') {
        await supabase.auth.signOut()
        if (active) navigate('/login?suspended=1', { replace: true })
        return
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)

      if (!active) return

      if (error) {
        console.error(error)
        if (active) navigate('/login', { replace: true })
        return
      }

      const roles = (data ?? []).map((r) => r.role)
      if (roles.length === 0) {
        navigate('/select-role', { replace: true })
        return
      }

      const matched = roles.find((r) => allow.includes(r))
      if (!matched) {
        navigate(homePathForRoles(roles) ?? '/select-role', { replace: true })
        return
      }

      localStorage.setItem('role', matched === 'super_admin' ? 'admin' : matched)
      localStorage.setItem('email', session.user.email ?? '')
      if (active) setReady(true)
    }

    checked.current = true
    check()

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, allowKey])

  if (!ready) return <LoadingScreen />
  return children
}

export { ROLE_HOME }
