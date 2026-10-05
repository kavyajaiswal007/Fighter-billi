import { useEffect, useRef, useState } from 'react'
import { deleteDocument, getDocumentUrl, getDocuments, uploadDocument } from '../api'

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Loading documents…')
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  async function loadDocs() {
    try {
      const data = await getDocuments()
      setDocs(data.documents)
      setStatus('')
    } catch (err) {
      setStatus(err.message)
    }
  }

  async function viewDoc(id) {
    try {
      const res = await getDocumentUrl(id)
      if (res?.url) window.open(res.url, '_blank')
    } catch (err) {
      alert(err.message)
    }
  }

  async function downloadDoc(id, name) {
    try {
      const res = await getDocumentUrl(id)
      if (res?.url) {
        const a = document.createElement('a')
        a.href = res.url
        a.download = name
        a.target = '_blank'
        a.click()
      }
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => { loadDocs() }, [])

  async function remove(id, name) {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteDocument(id)
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  async function upload() {
    if (!file || uploading) return
    setUploading(true)
    setUploadStatus('Uploading and processing…')
    try {
      const result = await uploadDocument(file)
      setUploadStatus(`✓ Uploaded "${result.document.name}" — ${result.chunks} searchable chunks created.`)
      setFile(null)
      loadDocs()
    } catch (err) {
      setUploadStatus(err.message)
    }
    setUploading(false)
  }

  function pickFile(files) {
    const f = files?.[0]
    if (f) { setFile(f); setUploadStatus('') }
  }

  const shown = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const isError = uploadStatus && !uploadStatus.startsWith('✓') && !uploadStatus.startsWith('Upload')

  return (
    <section className="documents-page">
      {/* Header */}
      <div className="page-header">
        <p className="eyebrow">Knowledge Base</p>
        <h1>Your Documents</h1>
        <p>Upload, view, and manage company files.</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone${dragging ? ' dragover' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files) }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={e => pickFile(e.target.files)}
        />
        <div className="drop-icon">↑</div>
        <div className="drop-info">
          <h3>Add PDF or DOCX</h3>
          <p>
            {file
              ? <><b style={{ color: 'var(--gold)' }}>{file.name}</b> — ready to upload</>
              : 'Drop a file here or click to browse'}
          </p>
        </div>
        <button
          className="btn-primary"
          type="button"
          disabled={!file || uploading}
          onClick={e => { e.preventDefault(); upload() }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {uploading ? 'Processing…' : 'Upload'}
        </button>
      </div>

      {uploadStatus && (
        <div className={`status-msg${isError ? ' error' : ''}`}>
          {uploadStatus}
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">⌕</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents…"
        />
      </div>

      {/* Doc List */}
      <div className="doc-list">
        {status && (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p>{status}</p>
          </div>
        )}

        {!status && shown.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <p>{search ? 'No documents match your search.' : 'No documents uploaded yet. Add your first file above!'}</p>
          </div>
        )}

        {shown.map(doc => (
          <div key={doc.id} className="doc-card">
            <div className="doc-type-badge">{doc.file_type?.toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="doc-name" title={doc.name}>{doc.name}</div>
              <div className="doc-meta">
                {doc.file_type?.toUpperCase()} · Uploaded {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="doc-actions">
              <button className="btn-ghost" onClick={() => viewDoc(doc.id)}>View</button>
              <button className="btn-ghost" onClick={() => downloadDoc(doc.id, doc.name)}>↓</button>
              <button className="btn-danger" onClick={() => remove(doc.id, doc.name)}>✕ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
