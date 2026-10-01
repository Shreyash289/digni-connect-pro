import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../integrations/supabase/client'

let channelSeq = 0

// Loads data with `loader`, then reloads it (debounced) whenever any of
// `tables` changes via Supabase Realtime. `pollMs` adds a periodic refresh
// for data that Realtime can't deliver to this user (e.g. RLS-hidden rows).
export function useLiveQuery(loader, { tables = [], pollMs = 0, deps = [] } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [live, setLive] = useState(false)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const reload = useCallback(async () => {
    try {
      const result = await loaderRef.current()
      setData(result)
      setError('')
    } catch (err) {
      setError(err?.message || 'Something went wrong loading this page.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    reload()

    let timer
    const fire = () => {
      clearTimeout(timer)
      timer = setTimeout(reload, 300)
    }

    let channel = null
    if (tables.length) {
      channel = supabase.channel(`live-${tables.join('-')}-${++channelSeq}`)
      for (const table of tables) {
        channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, fire)
      }
      channel.subscribe((status) => setLive(status === 'SUBSCRIBED'))
    }

    const poll = pollMs ? setInterval(reload, pollMs) : null
    const onFocus = () => reload()
    window.addEventListener('focus', onFocus)

    return () => {
      clearTimeout(timer)
      if (poll) clearInterval(poll)
      window.removeEventListener('focus', onFocus)
      if (channel) supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, tables.join(','), pollMs, ...deps])

  return { data, loading, error, reload, live, setData }
}
