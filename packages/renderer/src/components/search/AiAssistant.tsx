import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant'

interface Citation {
  label: string
  route: string
}

interface Message {
  id: string
  role: MessageRole
  text: string
  citations?: Citation[]
  suggestions?: string[]
  timestamp: Date
}

// ─── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate(): React.ReactElement {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-xl border p-6 text-center max-w-lg mx-auto mt-8"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
    >
      <p className="text-3xl mb-3">🤖</p>
      <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        AI Study Assistant — Premium Feature
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        A conversational study companion anchored entirely in your installed library — no
        hallucinations, every answer cited from the texts.
      </p>
      <ul
        className="text-sm text-left inline-flex flex-col gap-1.5 mb-5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {[
          'Multi-turn conversational Q&A',
          'Every claim cited from your library',
          '"Show me in the text" navigation',
          'Suggested follow-up questions',
          'Session history saved per study session',
          'Cannot contradict explicit library text',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span style={{ color: 'var(--ae-green-600, #16a34a)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
        style={{
          backgroundColor: 'var(--ae-gold-500, #f59e0b)',
          color: 'var(--ae-black-900, #111)',
        }}
        onClick={() => void navigate('/settings/account')}
      >
        Upgrade to Premium
      </button>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }): React.ReactElement {
  const navigate = useNavigate()
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
        style={{
          backgroundColor: isUser
            ? 'var(--accent-primary)'
            : 'color-mix(in srgb, var(--ae-gold-500, #f59e0b) 20%, transparent)',
          color: isUser ? '#fff' : 'var(--ae-gold-700, #b45309)',
        }}
      >
        {isUser ? '👤' : '📚'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            backgroundColor: isUser ? 'var(--accent-primary)' : 'var(--bg-surface)',
            color: isUser ? '#fff' : 'var(--text-primary)',
            borderColor: isUser ? 'transparent' : 'var(--border-subtle)',
            border: isUser ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          {message.text}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.citations.map((c) => (
              <button
                key={c.route}
                type="button"
                className="text-[10px] font-medium underline transition-opacity hover:opacity-75"
                style={{ color: 'var(--accent-primary)' }}
                onClick={() => void navigate(c.route)}
              >
                [{c.label}]
              </button>
            ))}
          </div>
        )}

        {/* Suggested follow-ups */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1 mt-1">
            <span className="text-[10px] w-full" style={{ color: 'var(--text-muted)' }}>
              Follow-up questions:
            </span>
            {message.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="text-xs rounded-full border px-2.5 py-0.5 transition-colors hover:border-[var(--accent-primary)]"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] px-1" style={{ color: 'var(--text-muted)' }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// ─── Demo session messages ────────────────────────────────────────────────────

const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    text: 'What does the Quran say about patience?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    role: 'assistant',
    text: 'The Quran mentions patience (sabr) in over 90 verses, making it one of the most emphasized virtues. Allah says: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient." (2:153). Patience is described as the foundation for overcoming hardship, and those who are patient are promised great reward.',
    citations: [
      { label: 'Q 2:153', route: '/quran/2/153' },
      { label: 'Q 2:45', route: '/quran/2/45' },
      { label: 'Q 39:10', route: '/quran/39/10' },
    ],
    suggestions: [
      'What types of patience are mentioned in hadith?',
      'How does Ibn Kathir explain Surah al-Asr?',
      'What is the reward for patience in the afterlife?',
    ],
    timestamp: new Date(Date.now() - 90000),
  },
]

// ─── AiAssistant ─────────────────────────────────────────────────────────────

export default function AiAssistant(): React.ReactElement {
  const [unlocked] = useState(false) // set true when user has Premium
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!unlocked) {
    return <PremiumGate />
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // TODO: invoke AI backend when available
    await new Promise((r) => setTimeout(r, 800))

    const assistantMsg: Message = {
      id: String(Date.now() + 1),
      role: 'assistant',
      text: 'I found relevant passages in your library. The topic you asked about is discussed in multiple sources — see the citations below.',
      citations: [
        { label: 'Q 2:153', route: '/quran/2/153' },
        { label: 'Bukhari #1', route: '/hadith/bukhari/1' },
      ],
      suggestions: ['Tell me more', 'Show related hadiths', 'What do scholars say?'],
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--ae-gold-500, #f59e0b) 20%, transparent)',
                color: 'var(--ae-gold-700, #b45309)',
              }}
            >
              📚
            </div>
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                  ·
                </span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                  ·
                </span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                  ·
                </span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => void sendMessage(e)}
        className="flex gap-2 pt-3 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
          placeholder="Ask a question about your library…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--ae-black-900, #111)',
          }}
        >
          Send
        </button>
      </form>

      {/* Disclaimer */}
      <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
        AI responses are grounded in your installed library. Always verify with primary sources.
      </p>
    </div>
  )
}
