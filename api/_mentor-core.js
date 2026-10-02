// Shared AI Mentor logic used by the Vercel function (api/mentor.js) and the
// Vite dev server (vite.config.js). Runs on the server only: the Gemini key
// never reaches the browser. Files starting with "_" are not exposed as routes.

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// Tried in order. Benchmarked with this prompt: the Flash-Lite models answer
// in ~1–5s and rarely hit Google's "high demand" 503s; full Flash is slower and
// was often overloaded, so it's the last resort. Override with GEMINI_MODEL.
const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash']
const PER_MODEL_TIMEOUT_MS = 15000
const MAX_TURNS = 30
const MAX_CHARS = 4000

const BASE_PROMPT = `You are the CAREVIA AI Mentor — a professional career mentor on CAREVIA, an employment platform in India that connects survivors of trafficking and exploitation with verified NGOs and recruiters.

YOUR ROLE
You are an experienced, warm and highly practical career coach. You help with:
- Finding the right job direction from someone's skills, education and interests
- Writing and improving resumes (strong bullet points, simple formats that work in India)
- Interview preparation: likely questions, model answers, mock interviews, body language, what to wear and bring
- Workplace confidence, communication, salary expectations and negotiating respectfully
- Skill building: free or low-cost courses and certifications in India (e.g. Skill India / PMKVY, NIOS, government ITIs, free online courses), digital and spoken-English basics
- Using the CAREVIA platform: completing "My Profile", turning on "Visible to recruiters", uploading documents to "My Documents", applying from the "Job Board", and tracking progress in "My Applications"

HOW YOU COMMUNICATE
- Trauma-informed: patient, respectful, never judgmental. Never ask about or make someone relive their past. Focus on strengths and the future.
- Plain, simple language. Many users are first-time job seekers or are reading in their second language. Avoid jargon; explain terms when you must use them.
- Reply in the same language the user writes in (English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Hinglish, etc.).
- Be concrete: give step-by-step actions, example sentences they can say or write, and short checklists. Prefer 3–6 bullet points over long paragraphs.
- Keep most replies under about 180 words unless the user asks for a full resume, a mock interview or detailed plan.
- End with one clear next step or one short question that moves them forward.
- If a request is vague, ask one short clarifying question instead of guessing.

MOCK INTERVIEWS
When asked to practise an interview, act as the interviewer: ask ONE question at a time, wait for the answer, then give brief, kind feedback (what was good + one improvement) before the next question.

ACCURACY
- Never invent specific job openings, company names, salaries as facts, phone numbers or links. Say "for example" or suggest where to check (the CAREVIA Job Board, their NGO caseworker, official government portals).
- Give realistic salary ranges only as rough guidance and say they vary by city and employer.
- You do not have access to the user's documents or messages with recruiters.

PRIVACY & SAFETY
- Do not ask for Aadhaar numbers, bank details, passwords, addresses or other sensitive personal data. If the user shares it, gently tell them not to share it here.
- Warn about job scams when relevant: real employers never ask for money for a job, never take original documents, and never ask someone to travel somewhere without verified details. Encourage checking any offer with their NGO caseworker.
- You are a career mentor, not a lawyer, doctor or counsellor. For legal, medical, immigration or emotional crises, respond kindly and suggest talking to their NGO caseworker.
- If someone says they are in danger, being forced to work, threatened, or thinking of harming themselves: respond with care, put their safety first, and share: Emergency 112, Women Helpline 181, Childline 1098 (for anyone under 18), Tele-MANAS mental health support 14416. Encourage them to contact their NGO caseworker right away. Do not continue career coaching until they indicate they are safe.

Stay within careers, skills, confidence and the CAREVIA platform. If asked about unrelated topics, briefly and politely steer back to their career goals.`

function profileContext(p) {
  if (!p || typeof p !== 'object') return ''
  const list = (v) => (Array.isArray(v) && v.length ? v.slice(0, 15).join(', ') : null)
  const lines = [
    p.firstName && `First name: ${p.firstName}`,
    (p.city || p.state) && `Location: ${[p.city, p.state].filter(Boolean).join(', ')}`,
    list(p.skills) && `Skills: ${list(p.skills)}`,
    list(p.preferredRoles) && `Preferred roles: ${list(p.preferredRoles)}`,
    list(p.languages) && `Languages: ${list(p.languages)}`,
    p.education && `Education: ${p.education}`,
    p.experience && `Experience: ${p.experience}`,
    typeof p.profileCompletion === 'number' && `CAREVIA profile completion: ${p.profileCompletion}%`,
    typeof p.visibleToRecruiters === 'boolean' && `Visible to recruiters: ${p.visibleToRecruiters ? 'yes' : 'no'}`,
    list(p.applications) && `Current job applications: ${list(p.applications)}`,
    list(p.upcomingInterviews) && `Upcoming interviews: ${list(p.upcomingInterviews)}`,
  ].filter(Boolean)
  if (!lines.length) return ''
  return `\n\nABOUT THIS USER (from their CAREVIA profile — use it to personalise advice, greet them by first name, and point out profile gaps that would help them get hired; never read it back to them as a list):\n- ${lines.map((l) => String(l).slice(0, 300)).join('\n- ')}`
}

function toContents(messages) {
  const turns = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.type === 'user' ? 'user' : 'model',
      parts: [{ text: m.text.slice(0, MAX_CHARS) }],
    }))
  // Gemini requires the conversation to start with a user turn
  while (turns.length && turns[0].role !== 'user') turns.shift()
  return turns
}

async function callModel(model, apiKey, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data?.error?.message || `Gemini request failed (${res.status})`)
      err.status = res.status
      throw err
    }
    const candidate = data?.candidates?.[0]
    const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('').trim()
    if (!text) {
      const err = new Error(candidate?.finishReason === 'SAFETY'
        ? 'SAFETY'
        : `Empty response (${candidate?.finishReason || data?.promptFeedback?.blockReason || 'unknown'})`)
      err.status = candidate?.finishReason === 'SAFETY' ? 200 : 502
      throw err
    }
    return text
  } finally {
    clearTimeout(timer)
  }
}

export async function generateMentorReply({ messages, profile, apiKey, models }) {
  if (!apiKey) {
    const err = new Error('The AI Mentor is not configured on the server (GEMINI_API_KEY missing).')
    err.status = 500
    throw err
  }

  const contents = toContents(messages)
  if (!contents.length) {
    const err = new Error('Please type a message.')
    err.status = 400
    throw err
  }

  const body = {
    systemInstruction: { parts: [{ text: BASE_PROMPT + profileContext(profile) }] },
    contents,
    // Low thinking keeps chat replies fast; coaching doesn't need deep reasoning
    generationConfig: { temperature: 0.6, topP: 0.95, maxOutputTokens: 1500, thinkingConfig: { thinkingLevel: 'low' } },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  }

  const chain = (models || DEFAULT_MODELS).filter(Boolean)
  let lastError
  for (const model of chain) {
    try {
      return { text: await callModel(model, apiKey, body), model }
    } catch (err) {
      lastError = err
      if (err.message === 'SAFETY') {
        return {
          text: "I'm not able to help with that here. If you're facing something difficult or unsafe, please reach out to your NGO caseworker, or call 112 (emergency) or 181 (Women Helpline). I'm happy to keep helping with your career whenever you're ready.",
          model,
        }
      }
      // A bad or blocked key won't be fixed by trying another model
      if ([401, 403].includes(err.status)) break
    }
  }

  const err = new Error(
    lastError?.status === 429 || lastError?.status === 503 || lastError?.name === 'AbortError'
      ? 'The AI Mentor is very busy right now. Please try again in a minute.'
      : `The AI Mentor could not respond: ${lastError?.message || 'unknown error'}`,
  )
  err.status = 503
  throw err
}

// Confirms the request comes from a signed-in CAREVIA user, so the endpoint
// can't be used by anyone on the internet to spend the Gemini quota.
export async function verifySupabaseUser(authHeader, env) {
  const token = (authHeader || '').replace(/^Bearer\s+/i, '')
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  const key = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!token || !url || !key) return null
  const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return res.json()
}

export async function handleMentorRequest({ body, authHeader, env }) {
  const user = await verifySupabaseUser(authHeader, env)
  if (!user?.id) return { status: 401, json: { error: 'Please sign in again to use the AI Mentor.' } }

  try {
    const models = env.GEMINI_MODEL ? env.GEMINI_MODEL.split(',').map((s) => s.trim()) : undefined
    const { text, model } = await generateMentorReply({
      messages: body?.messages,
      profile: body?.profile,
      apiKey: env.GEMINI_API_KEY,
      models,
    })
    return { status: 200, json: { reply: text, model } }
  } catch (err) {
    return { status: err.status && err.status >= 400 ? err.status : 500, json: { error: err.message } }
  }
}
