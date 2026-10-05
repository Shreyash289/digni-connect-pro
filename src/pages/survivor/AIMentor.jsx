import { useEffect, useRef, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../integrations/supabase/client'
import { askMentor } from '../../lib/gemini'
import { timeAgo, getMySurvivor, listMyApplications, listMySurvivorInterviews, formatDateTime, statusInfo } from '../../lib/careers'

// Career-relevant facts only — no phone, email, documents or caseworker notes
async function loadMentorProfile() {
  try {
    const [s, apps, interviews] = await Promise.all([getMySurvivor(), listMyApplications(), listMySurvivorInterviews()])
    return {
      firstName: (s.full_name || '').trim().split(' ')[0] || undefined,
      city: s.city, state: s.state,
      skills: s.skills, preferredRoles: s.preferred_roles, languages: s.languages,
      education: s.education_level, experience: s.total_experience,
      profileCompletion: s.profile_completion, visibleToRecruiters: s.consent_share_with_recruiters,
      applications: apps.slice(0, 8).map((a) => `${a.job_title} at ${a.company_name} (${statusInfo(a.status).label})`),
      upcomingInterviews: interviews
        .filter((i) => i.status === 'scheduled' && new Date(i.scheduled_at) >= new Date())
        .map((i) => `${i.job_title || 'Interview'} with ${i.company_name} on ${formatDateTime(i.scheduled_at)}`),
    }
  } catch {
    return undefined // mentor still works without personalisation
  }
}

const QUICK_TOPICS = [
  { label: 'Interview Tips', prompt: 'Give me practical tips to prepare for my next job interview.' },
  { label: 'Practice Interview', prompt: "Let's do a mock interview for a job that suits my skills. Ask me one question at a time." },
  { label: 'Resume Help', prompt: 'Help me write a simple, strong resume based on my skills and experience.' },
  { label: 'Which jobs suit me?', prompt: 'Based on my skills and profile, which kinds of jobs should I apply for and why?' },
  { label: 'Build Confidence', prompt: 'I feel nervous about working and talking to employers. How can I build my confidence?' },
  { label: 'Learn New Skills', prompt: 'What free or low-cost courses in India could help me get a better job?' },
  { label: 'Improve My Profile', prompt: 'How can I improve my CAREVIA profile so recruiters notice me?' },
  { label: 'Spot Job Scams', prompt: 'How can I tell if a job offer is a scam?' },
]

// Greeting shown at the top of every conversation (UI only, never stored)
const GREETING = {
  id: 'greeting',
  type: 'bot',
  text: "Hi! I'm your CAREVIA AI Mentor. I'm here to help you with career advice, interview prep, and confidence building. What would you like to work on today?",
}

const toMessage = (row) => ({
  id: row.id,
  type: row.role === 'user' ? 'user' : 'bot',
  text: (row.parts ?? []).map((p) => p?.text ?? '').join(''),
})

export default function AIMentor() {
  const [threads, setThreads] = useState([])
  const [threadId, setThreadId] = useState(null)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    profileRef.current = loadMentorProfile()
  }, [])

  // Load saved conversations and reopen the most recent one
  useEffect(() => {
    supabase
      .from('mentor_threads')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20)
      .then(({ data, error: err }) => {
        if (err) return setError(err.message)
        setThreads(data ?? [])
        if (data?.[0]) openThread(data[0].id)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openThread(id) {
    setThreadId(id)
    setError('')
    const { data, error: err } = await supabase
      .from('mentor_messages')
      .select('id, role, parts, created_at')
      .eq('thread_id', id)
      .order('created_at', { ascending: true })
    if (err) return setError(err.message)
    setMessages([GREETING, ...(data ?? []).map(toMessage)])
  }

  function newConversation() {
    setThreadId(null)
    setMessages([GREETING])
    setError('')
  }

  async function saveMessage(tid, role, text) {
    const { error: err } = await supabase.from('mentor_messages').insert({ thread_id: tid, role, parts: [{ type: 'text', text }] })
    if (err) throw err
  }

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMessage = { id: `local-${Date.now()}`, type: 'user', text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      let tid = threadId
      if (!tid) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: thread, error: err } = await supabase
          .from('mentor_threads')
          .insert({ user_id: user.id, title: text.slice(0, 60) })
          .select('id, title, updated_at')
          .single()
        if (err) throw err
        tid = thread.id
        setThreadId(tid)
        setThreads((t) => [thread, ...t])
      }
      await saveMessage(tid, 'user', text)

      // The greeting is UI-only, so it isn't sent to the model
      const reply = await askMentor(nextMessages.filter((m) => m.id !== 'greeting'), await profileRef.current)
      setMessages((prev) => [...prev, { id: `local-${Date.now() + 1}`, type: 'bot', text: reply }])
      await saveMessage(tid, 'assistant', reply)

      const now = new Date().toISOString()
      await supabase.from('mentor_threads').update({ updated_at: now }).eq('id', tid)
      setThreads((t) => [{ ...(t.find((x) => x.id === tid) ?? { id: tid, title: text.slice(0, 60) }), updated_at: now }, ...t.filter((x) => x.id !== tid)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong reaching the AI Mentor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
            AI Mentor
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink2)' }}>Get personalized career guidance and interview prep, powered by Gemini. Your conversations are saved privately.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {threads.length > 0 && (
            <select
              value={threadId ?? ''}
              onChange={(e) => (e.target.value ? openThread(e.target.value) : newConversation())}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 12, maxWidth: 260 }}
            >
              <option value="">— New conversation —</option>
              {threads.map((t) => <option key={t.id} value={t.id}>{t.title} · {timeAgo(t.updated_at)}</option>)}
            </select>
          )}
          <button onClick={newConversation} disabled={loading}
            style={{ padding: '8px 14px', borderRadius: 6, background: 'var(--mist)', color: 'var(--royal)', border: '1px solid var(--line)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + New chat
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg)' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 16 }}>
              {msg.type === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    background: 'var(--royal)',
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    🤖
                  </div>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}>
                🤖
              </div>
              <div style={{
                padding: '12px 16px', background: '#fff', border: '1px solid var(--line)',
                borderRadius: 12, fontSize: 13, color: 'var(--ink2)',
              }}>
                Thinking…
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 8, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, fontSize: 12, color: '#B91C1C',
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '1px solid var(--line)', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about interviews, resume, skills, confidence..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 13px',
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'var(--font)',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: '11px 16px',
                background: loading || !input.trim() ? 'var(--sky)' : 'var(--royal)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick Topics */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 12 }}>
          Quick Topics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic.label}
              onClick={() => sendMessage(topic.prompt)}
              disabled={loading}
              style={{
                padding: '10px 12px',
                background: 'var(--mist)',
                color: 'var(--royal)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
