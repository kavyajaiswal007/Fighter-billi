import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Upload from './components/Upload'
import Documents from './components/Documents'

function Dashboard({ setPage }) {
  return <section className="dashboard"><div className="welcome"><div><p className="eyebrow">PROTECTED COMPANY KNOWLEDGE</p><h1>Fighter Billi guards your documents</h1><p>Upload company files, ask questions, and get grounded answers with sources.</p><button className="primary" onClick={() => setPage('chat')}>Ask Fighter Billi <b>→</b></button></div><div className="hero-mascot"><div className="face">B</div><p>Source-backed<br /><b>answers only</b></p></div></div><div className="stats"><article><span>▤</span><p>Documents</p><h2>Live</h2><small>Supabase storage</small></article><article><span>✦</span><p>Answers</p><h2>RAG</h2><small>Gemini powered</small></article><article><span>◷</span><p>Sources</p><h2>Pages</h2><small>Traceable snippets</small></article></div><div className="recent"><div><h2>Mission flow</h2><button onClick={() => setPage('upload')}>Upload →</button></div>{['Upload real PDFs or DOCX files', 'Ask questions from your documents', 'Review source document and page number'].map((name, i) => <div className="recent-row" key={name}><span>{i + 1}</span><b>{name}</b><small>{i === 0 ? 'Storage' : i === 1 ? 'Retrieval' : 'Sources'}</small></div>)}</div></section>
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  return <main className="app"><Sidebar page={page} setPage={setPage} /><div className="content">{page === 'dashboard' && <Dashboard setPage={setPage} />}{page === 'chat' && <Chat />}{page === 'upload' && <Upload />}{page === 'documents' && <Documents />}</div></main>
}
