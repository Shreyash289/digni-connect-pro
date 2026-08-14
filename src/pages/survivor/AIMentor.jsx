import { useState } from 'react'
import Layout from '../../components/Layout'

export default function AIMentor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! I\'m your CAREVIA AI Mentor. I\'m here to help you with career advice, interview prep, and confidence building. What would you like to work on today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date()
    }
    setMessages([...messages, userMessage])

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: getBotResponse(input),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 800)

    setInput('')
  }

  const getBotResponse = (userText) => {
    const text = userText.toLowerCase()

    if (text.includes('interview')) {
      return '🎤 Interview Tips:\n1. Practice common questions\n2. Research the company\n3. Tell your story confidently\n4. Show enthusiasm for the role\n\nWould you like tips on a specific question?'
    }
    if (text.includes('resume')) {
      return '📄 Resume Tips:\n1. Keep it to 1 page\n2. Use clear formatting\n3. Highlight achievements, not just duties\n4. Include relevant skills\n5. Proofread carefully\n\nNeed help with a specific section?'
    }
    if (text.includes('confidence')) {
      return '💪 Building Confidence:\n1. Practice self-affirmations\n2. Celebrate small wins\n3. Remember your strengths\n4. Start with achievable goals\n5. Seek support from mentors\n\nYou\'ve overcome challenges before - you can do this!'
    }
    if (text.includes('skills')) {
      return '🎯 Skill Development:\n1. Identify gaps in your skills\n2. Take free online courses\n3. Practice regularly\n4. Learn from peers\n5. Apply new skills immediately\n\nWhat skill would you like to develop?'
    }
    if (text.includes('job')) {
      return '💼 Job Search Strategy:\n1. Target roles that match your skills\n2. Customize applications\n3. Network actively\n4. Follow up after interviews\n5. Keep learning\n\nHow can I help with your job search?'
    }
    return '✨ That\'s a great question! Remember, your journey is unique and valuable. You have the skills and resilience to succeed. What specific area would you like to explore?'
  }

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0C1F3F', fontFamily: 'Plus Jakarta Sans', marginBottom: 4 }}>
          🤖 AI Mentor
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Get personalized career guidance and interview prep</p>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#F9FAFB' }}>
          {messages.map(msg => (
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
                    whiteSpace: 'pre-wrap'
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
                    flexShrink: 0
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
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: '0.5px solid #E5E7EB', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about interviews, resume, skills, confidence..."
              style={{
                flex: 1,
                padding: '11px 13px',
                border: '0.5px solid #E5E7EB',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'Inter',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '11px 16px',
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
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
          {['Interview Tips', 'Resume Help', 'Build Confidence', 'Skill Development', 'Job Search'].map(topic => (
            <button
              key={topic}
              onClick={() => setInput(topic)}
              style={{
                padding: '10px 12px',
                background: '#EFF6FF',
                color: '#2563EB',
                border: '0.5px solid #BFDBFE',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
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
