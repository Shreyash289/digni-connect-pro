import { supabase } from '../integrations/supabase/client'

// The AI Mentor runs server-side (api/mentor.js on Vercel, vite.config.js in
// dev) so the Gemini key never ships in the browser bundle. The system prompt
// lives in api/_mentor-core.js.

// messages: [{ type: 'user' | 'bot', text: string }]
// profile: optional non-sensitive context used to personalise advice
export async function askMentor(messages, profile) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Please sign in again to use the AI Mentor.')

  let res
  try {
    res = await fetch('/api/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ messages, profile }),
    })
  } catch {
    throw new Error('Could not reach the AI Mentor. Check your internet connection and try again.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `The AI Mentor is unavailable (${res.status}).`)
  return data.reply
}
