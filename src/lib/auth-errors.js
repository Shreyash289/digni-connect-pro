// Supabase surfaces transport-level failures as the browser's raw fetch error
// ("Failed to fetch" / "NetworkError..."), which tells the user nothing and
// looks identical on sign-in and sign-up. Those cases are almost always config:
// a wrong/dead VITE_SUPABASE_URL, a paused project, or an offline client.
// Map them to something actionable and pass real auth errors through untouched.

const NETWORK_HINTS = ['failed to fetch', 'networkerror', 'network request failed', 'load failed']

export function authErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const raw = typeof err === 'string' ? err : err?.message
  if (!raw) return fallback

  if (NETWORK_HINTS.some((hint) => raw.toLowerCase().includes(hint))) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return "You appear to be offline. Check your connection and try again."
    }
    const url = import.meta.env.VITE_SUPABASE_URL
    return `Cannot reach the authentication server${url ? ` at ${url}` : ''}. ` +
      'The Supabase project may be paused or deleted, or VITE_SUPABASE_URL may be wrong.'
  }

  if (raw.toLowerCase().includes('invalid api key')) {
    return 'The app is misconfigured: VITE_SUPABASE_PUBLISHABLE_KEY does not belong to this Supabase project.'
  }

  return raw
}
