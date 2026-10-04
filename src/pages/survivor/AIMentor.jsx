import { useState } from 'react'
import Layout from '../../components/Layout'

export default function AIMentor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your CAREVIA AI Career Mentor. I'm here to help you with personalized interview preparation, resume refinement, and career confidence. What would you like to explore today?",
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
      return 'Interview Preparation Strategy:\n1. Practice structured responses focusing on your past responsibilities\n2. Research the company and prepare two thoughtful questions\n3. Speak clearly and calmly about your key strengths\n4. Emphasize your adaptability and dedication to growth\n\nWould you like to practice a specific question together?'
    }
    if (text.includes('resume')) {
      return 'Resume Building Tips:\n1. Keep formatting clean and consistent with clear headings\n2. Highlight demonstrable achievements alongside duties\n3. Include your verified technical and interpersonal skills\n4. Proofread carefully before submitting\n\nWhich section of your profile would you like assistance with?'
    }
    if (text.includes('confidence')) {
      return 'Building Professional Confidence:\n1. Celebrate every milestone and skill you have mastered\n2. Prepare thoroughly so you feel grounded and centered\n3. Remember your resilience and unique problem-solving abilities\n4. Connect with your supporting NGO mentor for mock interviews\n\nYou have strong abilities to contribute.'
    }
    if (text.includes('skills')) {
      return 'Skill Development Pathways:\n1. Identify skills highlighted in open job postings\n2. Engage in practice exercises and foundation courses\n3. Ask your NGO counselor about vocational certification opportunities\n4. Add new completed proficiencies directly to your CAREVIA profile'
    }
    if (text.includes('job')) {
      return 'Job Search Guidance:\n1. Focus on postings aligned with your verified strengths\n2. Ensure your profile details and documents are complete\n3. Track updates regularly in your Applications tab\n\nHow can I help you find the best match today?'
    }
    return "That's an important topic. Your journey is valuable and each step forward builds a stronger career path. What specific area would you like to focus on next?"
  }

  const quickTopics = [
    'Interview preparation',
    'Resume assistance',
    'Confidence building',
    'Skill development',
    'Job search strategy'
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: 6 }}>
          AI Career Mentor
        </h2>
        <p style={{ color: 'var(--ink2)', margin: 0, fontSize: 14 }}>
          Confidential, personalized career guidance and interview practice
        </p>
      </div>

      {/* Chat Container Card */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 600,
          borderRadius: 'var(--r-card)'
        }}
      >
        {/* Messages scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '14px 18px',
                  borderRadius: 'var(--r-card)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  background: msg.type === 'user' ? 'var(--navy)' : 'var(--mist)',
                  color: msg.type === 'user' ? '#ffffff' : 'var(--ink)',
                  border: msg.type === 'user' ? 'none' : '1px solid var(--line)'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Row */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', background: 'var(--card)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about interview tips, resume guidance, or skills..."
            />
            <button
              onClick={sendMessage}
              className="btn-pill"
              style={{
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 'var(--r-pill)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Send message"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick topics */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink2)', marginBottom: 10 }}>
          Suggested conversation topics
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {quickTopics.map(topic => (
            <button
              key={topic}
              onClick={() => setInput(topic)}
              className="btn-soft"
              style={{ fontSize: 13 }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
