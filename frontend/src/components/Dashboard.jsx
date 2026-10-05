export default function Dashboard({ setPage }) {
  return (
    <section className="dashboard">
      {/* ── Hero ── */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <p className="eyebrow">Protected Company Knowledge</p>
          <h1>Fighter Billi guards your documents</h1>
          <p>
            Upload company files, ask questions, and get grounded answers
            with page-level sources — powered by Gemini AI.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setPage('chat')}>
              Ask Fighter Billi <span style={{ fontSize: 18 }}>→</span>
            </button>
            <button className="btn-ghost" onClick={() => setPage('documents')}>
              ＋ Upload Document
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/mascot-cartoon.png" alt="Fighter Billi Mascot" />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">▤</span>
          <div className="stat-label">Documents</div>
          <div className="stat-value">Live</div>
          <div className="stat-sub">Supabase storage</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✦</span>
          <div className="stat-label">Answers</div>
          <div className="stat-value">RAG</div>
          <div className="stat-sub">Gemini AI powered</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">◎</span>
          <div className="stat-label">Sources</div>
          <div className="stat-value">Pages</div>
          <div className="stat-sub">Traceable snippets</div>
        </div>
      </div>

      {/* ── Mission Flow ── */}
      <div className="mission-card">
        <div className="mission-card-head">
          <h3>Mission Flow</h3>
          <button className="btn-ghost" onClick={() => setPage('documents')}>
            Upload →
          </button>
        </div>
        {[
          { label: 'Upload real PDFs or DOCX files', badge: 'Storage' },
          { label: 'Ask questions from your documents', badge: 'Retrieval' },
          { label: 'Review source document and page number', badge: 'Sources' },
        ].map(({ label, badge }, i) => (
          <div className="mission-step" key={label}>
            <div className="mission-num">{i + 1}</div>
            <div>
              <b>{label}</b>
            </div>
            <span className="mission-badge">{badge}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
