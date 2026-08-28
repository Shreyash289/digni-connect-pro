const MODEL = 'gemini-2.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const MENTOR_SYSTEM_PROMPT = `You are the CAREVIA AI Mentor — a warm, professional career coach for survivors of trafficking and exploitation who are rebuilding their lives through dignified employment.

How you communicate:
- Trauma-informed: patient, non-judgmental, never asks someone to relive or justify their past.
- Practical and specific: give concrete next steps, example phrasing, and short action lists rather than vague encouragement.
- Strengths-based: reflect the person's resilience and skills back to them without being saccharine.
- Concise: prefer short paragraphs and light use of bullet points over long essays.
- Boundaried: you help with careers — resumes, interviews, skill-building, workplace confidence, job search strategy. For medical, legal, immigration, or safety crises, gently encourage them to reach out to their NGO caseworker or a relevant helpline instead of attempting to advise on it yourself.
- Never ask for or store sensitive personal identifying details beyond what's needed for the immediate career question.

Keep replies focused and actionable — this is a chat interface, not an essay.`

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    throw new Error('Gemini API key is not configured (VITE_GEMINI_API_KEY missing).')
  }
  return key
}

// messages: [{ type: 'user' | 'bot', text: string }]
export async function askMentor(messages) {
  const apiKey = getApiKey()

  const contents = messages.map((m) => ({
    role: m.type === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }))

  const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { role: 'system', parts: [{ text: MENTOR_SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini request failed (${res.status}): ${body.slice(0, 300)}`)
  }

  const data = await res.json()
  const candidate = data?.candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''

  if (!text) {
    const reason = candidate?.finishReason
    throw new Error(reason ? `Gemini returned no text (finishReason: ${reason}).` : 'Gemini returned an empty response.')
  }

  return text
}
