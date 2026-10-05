import { useState } from 'react'
import { uploadDocument } from '../api'

export default function Upload() {
  const [file, setFile] = useState(null), [status, setStatus] = useState('')
  async function upload() {
    if (!file) return
    setStatus('Uploading and processing...')
    try {
      const result = await uploadDocument(file)
      setStatus(`Uploaded ${result.document.name}. Created ${result.chunks} searchable chunks.`)
      setFile(null)
    } catch (error) {
      setStatus(error.message)
    }
  }
  function choose(files) { const picked = files[0]; if (picked) setFile(picked) }
  return <section className="simple-page"><div className="page-head"><p className="eyebrow">DOCUMENTS</p><h1>Upload documents</h1><p>Add PDF or DOCX files to your company knowledge base.</p></div>
    <label className="drop-zone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files) }}><input type="file" accept=".pdf,.docx" onChange={(e) => choose(e.target.files)} /><span className="upload-icon">↑</span><h3>Drag & drop your document here</h3><p>or <b>browse files</b> from your computer</p><small>PDF and DOCX up to 20 MB</small></label>
    {file && <div className="picked-file"><span>📄</span><div><b>{file.name}</b><small>{Math.ceil(file.size / 1024)} KB</small></div><button onClick={() => setFile(null)}>×</button></div>}
    <button className="primary upload-btn" disabled={!file} onClick={upload}>{status.startsWith('Uploading') ? 'Uploading...' : 'Upload document'}</button>{status && <p className="status">{status}</p>}
  </section>
}
