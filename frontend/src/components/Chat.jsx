import { useState } from 'react'
import { askBilli } from '../api'

export default function Chat() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  async function send() {
    if (!question.trim() || loading) return
    const text = question.trim()
    setQuestion('')
    setMessages((old) => [...old, { type: 'user', text }])
    setLoading(true)
    try {
      const result = await askBilli(text)
      setMessages((old) => [...old, { type: 'billi', ...result }])
    } catch (error) {
      setMessages((old) => [...old, { type: 'billi', answer: error.message, sources: [] }])
    }
    setLoading(false)
  }
  return <section className="chat-page"><div className="page-head"><p className="eyebrow">ASK BILLI</p><h1>Your document expert</h1><p>Ask anything about your company knowledge.</p></div>
    <div className="chat-box">{messages.length === 0 && <div className="chat-empty"><div className="mascot">✦</div><h2>Hi, I’m Billi!</h2><p>I’ll help you find answers in your company documents.</p><div className="suggestions"><button onClick={() => setQuestion('What is our leave policy?')}>What is our leave policy?</button><button onClick={() => setQuestion('How do I submit an expense?')}>How do I submit an expense?</button></div></div>}
      {messages.map((message, index) => message.type === 'user' ? <div className="message user" key={index}>{message.text}</div> : <div className="answer" key={index}><div className="answer-label"><span>✦</span> BILLI</div><p>{message.answer}</p>{message.sources?.map((source, sourceIndex) => <div className="source" key={sourceIndex}><b>Source</b><span>{source.document} · Page {source.page}</span><small>“{source.snippet}”</small></div>)}</div>)}
      {loading && <div className="answer loading"><span>✦</span> Billi is reading your documents<span className="dots">...</span></div>}
    </div>
    <div className="composer"><input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask a question about your documents..." /><button onClick={send}>Send ↑</button></div>
  </section>
}
