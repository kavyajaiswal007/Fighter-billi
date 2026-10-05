import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Upload from './components/Upload'
import Documents from './components/Documents'

function Dashboard({ setPage }) {
  return <section className="dashboard"><div className="welcome"><div><p className="eyebrow">YOUR AI KNOWLEDGE BASE</p><h1>Good morning, Kavya <span>✦</span></h1><p>Everything your team knows, one question away.</p><button className="primary" onClick={() => setPage('chat')}>Ask Fighter Billi <b>→</b></button></div><div className="hero-mascot"><div className="face">✦</div><p>Billi is<br /><b>on the case</b></p></div></div><div className="stats"><article><span>▤</span><p>Documents</p><h2>24</h2><small>+3 this week</small></article><article><span>✦</span><p>Questions asked</p><h2>128</h2><small>+18 this week</small></article><article><span>◷</span><p>Time saved</p><h2>8.4h</h2><small>This month</small></article></div><div className="recent"><div><h2>Recent documents</h2><button onClick={() => setPage('documents')}>View all →</button></div>{['Employee Handbook 2024.pdf', 'Product Strategy.docx', 'Expense Policy.pdf'].map((name, i) => <div className="recent-row" key={name}><span>📄</span><b>{name}</b><small>{i === 1 ? 'DOCX' : 'PDF'} · Updated {i ? 'yesterday' : 'today'}</small></div>)}</div></section>
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  return <main className="app"><Sidebar page={page} setPage={setPage} /><div className="content">{page === 'dashboard' && <Dashboard setPage={setPage} />}{page === 'chat' && <Chat />}{page === 'upload' && <Upload />}{page === 'documents' && <Documents />}</div></main>
}
