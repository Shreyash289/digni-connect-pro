import { useEffect, useRef, useState } from 'react'
import Layout from '../../components/Layout'
import { askMentor } from '../../lib/gemini'

const QUICK_TOPICS = ['Interview Tips', 'Resume Help', 'Build Confidence', 'Skill Development', 'Job Search']

export default function AIMentor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your CAREVIA AI Mentor. I'm here to help you with career advice, interview prep, and confidence building. What would you like to work on today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMessage = { id: Date.now(), type: 'user', text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const reply = await askMentor(nextMessages)
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', text: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong reaching the AI Mentor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          🤖 AI Mentor
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Get personalized career guidance and interview prep, powered by Gemini</p>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#F9FAFB' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 16 }}>
              {msg.type === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    background: '#2563EB',
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
                    border: '0.5px solid #E5E7EB',
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
                padding: '12px 16px', background: '#fff', border: '0.5px solid #E5E7EB',
                borderRadius: 12, fontSize: 13, color: '#6B7280',
              }}>
                Thinking…
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 8, padding: '10px 14px', background: '#FEF2F2', border: '0.5px solid #FECACA',
              borderRadius: 8, fontSize: 12, color: '#B91C1C',
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '0.5px solid #E5E7EB', background: '#fff' }}>
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
                border: '0.5px solid #E5E7EB',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'Inter',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: '11px 16px',
                background: loading || !input.trim() ? '#93C5FD' : '#2563EB',
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
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 12 }}>
          Quick Topics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => sendMessage(topic)}
              disabled={loading}
              style={{
                padding: '10px 12px',
                background: '#EFF6FF',
                color: '#2563EB',
                border: '0.5px solid #BFDBFE',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
