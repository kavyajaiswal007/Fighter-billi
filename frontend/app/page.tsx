'use client'

import { useEffect, useRef, useState } from 'react'
import {
  askBilli,
  deleteDocument,
  getDocumentUrl,
  getDocuments,
  uploadDocument,
  type SourceItem,
} from '../lib/api'

const heroImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.png-qGjCglRia3acjnDo9JWsj0H8v2xQkl.jpeg'

export type Doc = {
  id: string
  name: string
  type: 'PDF' | 'DOCX'
  size: string
  updated: string
  file_path?: string
}

export type Conversation = {
  question: string
  answer: string
  sources: SourceItem[]
}

export type ActivityItem = {
  icon: string
  title: string
  meta: string
  time: string
}

export type Page = 'Overview' | 'Documents' | 'Ask Billi'
const nav: Page[] = ['Overview', 'Documents', 'Ask Billi']

function formatDocDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    const now = new Date()
    const diffSec = (now.getTime() - d.getTime()) / 1000
    if (diffSec < 60) return 'Just now'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return 'Recently'
  }
}

export default function Page() {
  const [active, setActive] = useState<Page>('Overview')
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState<Conversation[]>([])
  const [isAsking, setIsAsking] = useState(false)
  const [search, setSearch] = useState('')
  const [activities, setActivities] = useState<ActivityItem[]>([
    { icon: '✦', title: 'Fighter Billi online', meta: 'Connected to Gemini & Supabase', time: 'Just now' },
  ])

  const fileRef = useRef<HTMLInputElement>(null)

  function addActivity(icon: string, title: string, meta: string) {
    setActivities((prev) => [{ icon, title, meta, time: 'Just now' }, ...prev.slice(0, 7)])
  }

  async function loadDocs() {
    try {
      setLoadingDocs(true)
      const data = await getDocuments()
      const mapped: Doc[] = (data.documents || []).map((d) => ({
        id: d.id,
        name: d.name,
        type: d.file_type?.toLowerCase() === 'docx' ? 'DOCX' : 'PDF',
        size: d.file_type?.toUpperCase() || 'FILE',
        updated: formatDocDate(d.created_at),
        file_path: d.file_path,
      }))
      setDocuments(mapped)
    } catch (err: any) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

  async function handleUpload(file?: File) {
    if (!file) return
    const isPdf = file.name.toLowerCase().endsWith('.pdf')
    const isDocx = file.name.toLowerCase().endsWith('.docx')
    if (!isPdf && !isDocx) {
      alert('Only PDF and DOCX files are supported.')
      return
    }

    setUploading(true)
    setUploadStatus(`Indexing "${file.name}" with Gemini AI...`)
    try {
      const res = await uploadDocument(file)
      setUploadStatus(`✓ Uploaded "${res.document.name}" — ${res.chunks} searchable chunks created.`)
      await loadDocs()
      addActivity('▤', 'Document indexed', res.document.name)
      setActive('Documents')
    } catch (err: any) {
      setUploadStatus(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" from company knowledge base?`)) return
    try {
      await deleteDocument(id)
      setDocuments((items) => items.filter((doc) => doc.id !== id))
      addActivity('✕', 'Document removed', name)
    } catch (err: any) {
      alert(err.message || 'Failed to delete document')
    }
  }

  async function handleView(id: string) {
    try {
      const res = await getDocumentUrl(id)
      if (res?.url) window.open(res.url, '_blank')
    } catch (err: any) {
      alert(err.message || 'Failed to view document')
    }
  }

  async function handleDownload(id: string, name: string) {
    try {
      const res = await getDocumentUrl(id)
      if (res?.url) {
        const a = document.createElement('a')
        a.href = res.url
        a.download = name
        a.target = '_blank'
        a.click()
      }
    } catch (err: any) {
      alert(err.message || 'Failed to download document')
    }
  }

  async function askBilliAction(overrideText?: string) {
    const text = (overrideText ?? question).trim()
    if (!text || isAsking) return
    setIsAsking(true)
    setQuestion('')
    try {
      const res = await askBilli(text)
      setConversation((items) => [
        {
          question: text,
          answer: res.answer || 'No answer found.',
          sources: res.sources || [],
        },
        ...items,
      ])
      addActivity('✦', 'Question answered', text.length > 40 ? `${text.slice(0, 40)}…` : text)
    } catch (err: any) {
      setConversation((items) => [
        {
          question: text,
          answer: `Error: ${err.message || 'Could not connect to backend'}`,
          sources: [],
        },
        ...items,
      ])
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <main className="app-shell">
      <div className="atmosphere" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="wash" />
      <div className="grain" />
      <section className="workspace">
        <aside className="sidebar glass-panel">
          <div className="brand-lockup logo-lockup">
            <img
              className="full-logo"
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.png-AB5iPqpVZD8UI0feQMNFp1fy7ffFxN.jpeg"
              onError={(e) => {
                e.currentTarget.src = '/mascot-cartoon.png'
              }}
              alt="Fighter Billi"
            />
          </div>
          <nav aria-label="Primary navigation">
            {nav.map((item) => (
              <button
                key={item}
                className={`nav-item ${active === item ? 'active' : ''}`}
                onClick={() => setActive(item)}
              >
                <span className="nav-icon">
                  {item === 'Overview' ? '◈' : item === 'Documents' ? '▤' : '✦'}
                </span>
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <div className="main-column">
          {active !== 'Overview' && (
            <header className="topbar">
              <div>
                <p className="breadcrumb">
                  Fighter Billi <span>/</span> {active}
                </p>
                <h1>{active}</h1>
              </div>
            </header>
          )}

          {active === 'Overview' && (
            <Overview
              documents={documents}
              conversationCount={conversation.length}
              activities={activities}
              onNavigate={(page) => setActive(page)}
              onUploadClick={() => fileRef.current?.click()}
            />
          )}

          {active === 'Documents' && (
            <Documents
              documents={documents}
              loading={loadingDocs}
              uploading={uploading}
              uploadStatus={uploadStatus}
              search={search}
              setSearch={setSearch}
              onUpload={() => fileRef.current?.click()}
              onFileDrop={(file) => handleUpload(file)}
              onDelete={handleDelete}
              onView={handleView}
              onDownload={handleDownload}
            />
          )}

          {active === 'Ask Billi' && (
            <AskBilli
              question={question}
              setQuestion={setQuestion}
              ask={() => askBilliAction()}
              onSelectSuggestion={(s) => {
                setQuestion(s)
                askBilliAction(s)
              }}
              isAsking={isAsking}
              conversation={conversation}
              documentsCount={documents.length}
            />
          )}

          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept=".pdf,.docx"
            onChange={(event) => handleUpload(event.target.files?.[0])}
          />
        </div>
      </section>
    </main>
  )
}

function Overview({
  documents,
  conversationCount,
  activities,
  onNavigate,
  onUploadClick,
}: {
  documents: Doc[]
  conversationCount: number
  activities: ActivityItem[]
  onNavigate: (page: Page) => void
  onUploadClick: () => void
}) {
  return (
    <div className="content">
      <div className="stats-grid">
        <div
          className="stat-card glass-panel"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('Documents')}
        >
          <span className="stat-icon green">▤</span>
          <small>Indexed documents</small>
          <strong>{documents.length}</strong>
          <p>
            <b>{documents.length > 0 ? 'Active' : 'Ready'}</b> in Supabase
          </p>
        </div>
        <div
          className="stat-card glass-panel"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('Ask Billi')}
        >
          <span className="stat-icon gold">✦</span>
          <small>Questions answered</small>
          <strong>{conversationCount}</strong>
          <p>
            <b>Gemini RAG</b> enabled
          </p>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-icon blue">◎</span>
          <small>Knowledge coverage</small>
          <strong>
            {documents.length > 0 ? '100' : '0'}
            <span>%</span>
          </strong>
          <p>
            <b>{documents.length > 0 ? 'Healthy' : 'Awaiting upload'}</b>
          </p>
        </div>
      </div>

      <div className="lower-grid">
        <div className="activity-card glass-panel">
          <div className="card-heading">
            <div>
              <h3>Recent activity</h3>
            </div>
          </div>
          <div className="activity-list">
            {activities.map((act, i) => (
              <Activity
                key={`${act.title}-${i}`}
                icon={act.icon}
                title={act.title}
                meta={act.meta}
                time={act.time}
              />
            ))}
          </div>
        </div>

        <div className="flow-card glass-panel">
          <h3>From document to decision.</h3>
          <p className="flow-description">
            Upload your files. Billi learns them. Get answers in seconds.
          </p>
          <div className="flow">
            <div style={{ cursor: 'pointer' }} onClick={onUploadClick}>
              <strong>Upload</strong>
              <small>Your documents</small>
            </div>
            <i>→</i>
            <div style={{ cursor: 'pointer' }} onClick={() => onNavigate('Ask Billi')}>
              <strong>Ask</strong>
              <small>Your questions</small>
            </div>
            <i>→</i>
            <div>
              <strong>Decide</strong>
              <small>With confidence</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Activity({
  icon,
  title,
  meta,
  time,
}: {
  icon: string
  title: string
  meta: string
  time: string
}) {
  return (
    <div className="activity-row">
      <span className="activity-icon">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{meta}</p>
      </div>
      <time>{time}</time>
    </div>
  )
}

function Documents({
  documents,
  loading,
  uploading,
  uploadStatus,
  search,
  setSearch,
  onUpload,
  onFileDrop,
  onDelete,
  onView,
  onDownload,
}: {
  documents: Doc[]
  loading: boolean
  uploading: boolean
  uploadStatus: string
  search: string
  setSearch: (v: string) => void
  onUpload: () => void
  onFileDrop: (f?: File) => void
  onDelete: (id: string, name: string) => void
  onView: (id: string) => void
  onDownload: (id: string, name: string) => void
}) {
  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  )

  const isError =
    uploadStatus && !uploadStatus.startsWith('✓') && !uploadStatus.startsWith('Index')

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <h2>Company documents.</h2>
          <p>Your company&apos;s knowledge, indexed and searchable.</p>
        </div>
        <button className="primary-button" onClick={onUpload} disabled={uploading}>
          {uploading ? 'Processing…' : '＋ Add document'}
        </button>
      </div>

      <div
        className="upload-drop glass-panel"
        onClick={onUpload}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          onFileDrop(file)
        }}
      >
        <div className="upload-symbol">↑</div>
        <div>
          <strong>Drop a PDF or DOCX here</strong>
          <p>or browse your computer · Max file size 25MB</p>
        </div>
        <span className="secondary-button compact">
          {uploading ? 'Uploading…' : 'Browse files'}
        </span>
      </div>

      {uploadStatus && (
        <div className={`upload-status-banner ${isError ? 'error' : ''}`}>
          {uploadStatus}
        </div>
      )}

      <div className="document-list glass-panel">
        <div className="list-heading">
          <div>
            <p className="eyebrow">Indexed files</p>
            <h3>{documents.length} documents</h3>
          </div>
          <span className="muted">Last updated</span>
        </div>

        <div className="doc-search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search documents by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
            Loading documents from database…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
            {search ? 'No documents match your search.' : 'No documents uploaded yet. Upload a file above!'}
          </div>
        )}

        {filtered.map((doc) => (
          <div className="document-row" key={doc.id}>
            <div className={`file-icon ${doc.type.toLowerCase()}`}>{doc.type}</div>
            <div className="doc-name">
              <strong>{doc.name}</strong>
              <span>
                {doc.size} · {doc.updated}
              </span>
            </div>
            <span className="indexed">
              Indexed <i />
            </span>
            <div className="doc-actions-group">
              <button
                className="action-btn"
                title="View document"
                onClick={() => onView(doc.id)}
              >
                View
              </button>
              <button
                className="action-btn"
                title="Download document"
                onClick={() => onDownload(doc.id, doc.name)}
              >
                ↓
              </button>
              <button
                className="action-btn delete"
                title="Delete document"
                onClick={() => onDelete(doc.id, doc.name)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AskBilli({
  question,
  setQuestion,
  ask,
  onSelectSuggestion,
  isAsking,
  conversation,
  documentsCount,
}: {
  question: string
  setQuestion: (value: string) => void
  ask: () => void
  onSelectSuggestion: (s: string) => void
  isAsking: boolean
  conversation: Conversation[]
  documentsCount: number
}) {
  return (
    <div className="content ask-content">
      <div className="ask-heading">
        <div>
          <h2>What can Billi uncover?</h2>
          <p>Ask anything about your company documents. Every answer comes with a source.</p>
        </div>
      </div>

      {documentsCount === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No documents yet</h3>
          <p>Add your first document to start asking questions.</p>
        </div>
      ) : (
        <>
          <div className="question-box glass-panel">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  ask()
                }
              }}
              placeholder="Ask about your company, strategy, leave policy, or maintenance..."
              aria-label="Ask Billi a question"
            />
            <div className="question-footer">
              <span>Enter to ask · Shift+Enter for a new line</span>
              <button
                className="primary-button"
                onClick={ask}
                disabled={isAsking || !question.trim()}
              >
                {isAsking ? 'Searching documents…' : 'Ask Billi ↗'}
              </button>
            </div>
          </div>

          {conversation.length === 0 && (
            <div className="suggestions">
              <span>Try asking</span>
              {[
                'What is the daily maintenance procedure?',
                'Summarize the key points of the document',
                'What are the safety requirements?',
                'Who is the contact or department?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  {suggestion} <span>→</span>
                </button>
              ))}
            </div>
          )}

          {conversation.map((item, index) => (
            <div className="answer-card glass-panel" key={`${item.question}-${index}`}>
              <p className="eyebrow">You asked</p>
              <h3>{item.question}</h3>
              <div className="answer-body">
                <div className="billi-avatar small">✦</div>
                <div style={{ flex: 1 }}>
                  <p style={{ whiteSpace: 'pre-line' }}>{item.answer}</p>
                  {item.sources && item.sources.length > 0 && (
                    <div className="sources-container">
                      <strong>Sources & Reference Snippets</strong>
                      <div className="sources-list">
                        {item.sources.map((src, sIdx) => (
                          <div key={sIdx} className="source-item-card">
                            <div className="source-item-header">
                              <span>
                                📄 <b>{src.document}</b>
                              </span>
                              <span className="source-page-badge">Page {src.page}</span>
                            </div>
                            {src.snippet && (
                              <p className="source-snippet">"{src.snippet}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
