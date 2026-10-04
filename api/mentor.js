// Vercel serverless function: POST /api/mentor
// Needs GEMINI_API_KEY (and the Supabase URL + publishable key) in the
// Vercel project's Environment Variables.
import { handleMentorRequest } from './_mentor-core.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body
  const { status, json } = await handleMentorRequest({
    body,
    authHeader: req.headers.authorization,
    env: process.env,
  })
  res.status(status).json(json)
}
