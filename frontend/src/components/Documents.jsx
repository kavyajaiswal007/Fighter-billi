import { useEffect, useState } from 'react'
import { deleteDocument, getDocuments } from '../api'

export default function Documents() {
  const [docs, setDocs] = useState([]), [search, setSearch] = useState(''), [status, setStatus] = useState('Loading documents...')
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
  useEffect(() => { loadDocs() }, [])
  const shown = docs.filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase()))
  return <section className="simple-page"><div className="page-head row-head"><div><p className="eyebrow">KNOWLEDGE BASE</p><h1>Your documents</h1><p>View and manage company files.</p></div></div><input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="⌕  Search documents" />
    <div className="doc-list">{shown.map((doc) => <div className="doc-row" key={doc.id}><span className="doc-icon">{doc.file_type?.toUpperCase()}</span><div className="doc-info"><b>{doc.name}</b><small>{doc.file_type?.toUpperCase()} · Uploaded {new Date(doc.created_at).toLocaleDateString()}</small></div><div className="doc-actions"><button onClick={() => window.open(doc.url, '_blank')}>View</button><a href={doc.url} download><button>Download</button></a><button className="delete" onClick={() => remove(doc.id)}>Delete</button></div></div>)}{status && <p className="empty">{status}</p>}{!status && shown.length === 0 && <p className="empty">No documents found.</p>}</div>
  </section>
}
