import { useEffect, useRef, useState } from 'react'
import { askBilli } from '../api'

export default function Chat() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = question.trim()
    if (!text || loading) return
    setQuestion('')
    setMessages(prev => [...prev, { type: 'user', text }])
    setLoading(true)
    try {
      const result = await askBilli(text)
      setMessages(prev => [...prev, { type: 'billi', ...result }])
    } catch (err) {
      setMessages(prev => [...prev, { type: 'billi', answer: err.message, sources: [] }])
    }
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <section className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <p className="eyebrow">Ask Billi</p>
        <h1>Your document expert</h1>
        <p>Ask anything about your company knowledge.</p>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <img
              src="/mascot-realistic.jpg"
              alt="Billi"
              className="chat-empty-mascot"
            />
            <h2>Hi, I'm Billi! 👋</h2>
            <p>I'll help you find answers in your uploaded documents — with exact page references.</p>
            <div className="suggestions">
              {[
                'What is our leave policy?',
                'How do I submit an expense?',
                'Summarise the main document',
                'What are the safety guidelines?',
              ].map(s => (
                <button
                  key={s}
                  className="suggestion-btn"
                  onClick={() => setQuestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.type === 'user' ? (
            <div key={i} className="msg-user">{msg.text}</div>
          ) : (
            <div key={i} className="msg-billi">
              <div className="msg-billi-header">
                <img src="/mascot-cartoon.png" alt="Billi" className="msg-billi-avatar" />
                <span className="msg-billi-label">Billi</span>
              </div>
              <div className="msg-billi-bubble">{msg.answer}</div>
              {msg.sources?.length > 0 && (
                <div className="sources">
                  {msg.sources.map((src, si) => (
                    <div key={si} className="source-card">
                      <div className="source-card-top">
                        <b>📄 {src.document}</b>
                        <span>Page {src.page}</span>
                      </div>
                      <div className="source-card-quote">"{src.snippet}"</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {loading && (
          <div className="msg-loading">
            <img src="/mascot-cartoon.png" alt="Billi" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
            Billi is reading your documents
            <div className="dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="chat-composer">
        <div className="composer-inner">
          <textarea
            className="composer-input"
            rows={1}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about your documents..."
          />
          <button
            className="composer-send"
            onClick={send}
            disabled={!question.trim() || loading}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </section>
  )
}
