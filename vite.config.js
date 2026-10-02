import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleMentorRequest } from './api/_mentor-core.js'

// Serves /api/mentor during `npm run dev`, mirroring the Vercel function,
// so the Gemini key stays server-side locally too.
function mentorApi(env) {
  return {
    name: 'carevia-mentor-api',
    configureServer(server) {
      server.middlewares.use('/api/mentor', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let raw = ''
        req.on('data', (chunk) => { raw += chunk })
        req.on('end', async () => {
          let body = {}
          try { body = JSON.parse(raw || '{}') } catch { /* handled below as empty */ }
          const { status, json } = await handleMentorRequest({ body, authHeader: req.headers.authorization, env })
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(json))
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // includes non-VITE_ (server-only) vars
  return { plugins: [react(), mentorApi(env)] }
})
