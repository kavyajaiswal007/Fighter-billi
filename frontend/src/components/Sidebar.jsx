const ITEMS = [
  { id: 'dashboard', icon: '⌂', label: 'Dashboard' },
  { id: 'documents', icon: '▤', label: 'Documents' },
  { id: 'chat',      icon: '✦', label: 'Ask Billi' },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <button className="brand" onClick={() => setPage('dashboard')}>
        <img src="/mascot-cartoon.png" alt="Fighter Billi" className="brand-logo" />
        <div className="brand-text">
          <span>Fighter Billi</span>
          <span>Doc Expert</span>
        </div>
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`nav-item${page === id ? ' active' : ''}`}
            onClick={() => setPage(id)}
          >
            <i>{icon}</i>
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-mascot">
          <img src="/mascot-realistic.jpg" alt="Billi" />
          <div>
            <span>Billi is ready</span>
            <small>Source-backed answers only</small>
          </div>
        </div>
      </div>
    </aside>
  )
}
