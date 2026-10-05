import { useEffect, useState } from 'react'
import { deleteDocument, getDocuments, uploadDocument } from '../api'

export default function Documents() {
  const [docs, setDocs] = useState([]), [search, setSearch] = useState(''), [status, setStatus] = useState('Loading documents...')
  const [file, setFile] = useState(null), [uploadStatus, setUploadStatus] = useState('')
  async function loadDocs() {
    try {
      const data = await getDocuments()
      setDocs(data.documents)
      setStatus('')
    } catch (error) {
      setStatus(error.message)
    }
  }
  async function remove(id) {
    if (!confirm('Delete this document?')) return
    await deleteDocument(id)
    loadDocs()
  }
  async function upload() {
    if (!file) return
    setUploadStatus('Uploading and processing...')
    try {
      const result = await uploadDocument(file)
      setUploadStatus(`Uploaded ${result.document.name}. Created ${result.chunks} searchable chunks.`)
      setFile(null)
      loadDocs()
    } catch (error) {
      setUploadStatus(error.message)
    }
  }
  function choose(files) { const picked = files[0]; if (picked) setFile(picked) }
  useEffect(() => { loadDocs() }, [])
  const shown = docs.filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase()))
  return <section className="simple-page"><div className="page-head row-head"><div><p className="eyebrow">KNOWLEDGE BASE</p><h1>Your documents</h1><p>Upload, view, and manage company files.</p></div></div>
    <label className="drop-zone compact-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files) }}><input type="file" accept=".pdf,.docx" onChange={(e) => choose(e.target.files)} /><span className="upload-icon">↑</span><div><h3>Add PDF or DOCX</h3><p>{file ? file.name : 'Drop a document here or browse files'}</p></div><button type="button" className="primary upload-btn" disabled={!file} onClick={(e) => { e.preventDefault(); upload() }}>{uploadStatus.startsWith('Uploading') ? 'Processing...' : 'Upload'}</button></label>
    {uploadStatus && <p className="status">{uploadStatus}</p>}
    <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="⌕  Search documents" />
    <div className="doc-list">{shown.map((doc) => <div className="doc-row" key={doc.id}><span className="doc-icon">{doc.file_type?.toUpperCase()}</span><div className="doc-info"><b>{doc.name}</b><small>{doc.file_type?.toUpperCase()} · Uploaded {new Date(doc.created_at).toLocaleDateString()}</small></div><div className="doc-actions"><button onClick={() => window.open(doc.url, '_blank')}>View</button><a href={doc.url} download><button>Download</button></a><button className="delete" onClick={() => remove(doc.id)}>Delete</button></div></div>)}{status && <p className="empty">{status}</p>}{!status && shown.length === 0 && <p className="empty">No documents found.</p>}</div>
  </section>
}
