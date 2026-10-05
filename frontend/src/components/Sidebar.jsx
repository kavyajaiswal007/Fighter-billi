const items = [
  ['dashboard', '⌂', 'Dashboard'],
  ['documents', '▤', 'Documents'],
  ['chat', '✦', 'Ask Billi']
]

export default function Sidebar({ page, setPage }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => setPage('dashboard')}><span className="brand-orb">B</span><span>Fighter<br /><b>Billi</b></span></button>
    <nav>{items.map(([id, icon, label]) => <button key={id} className={page === id ? 'nav active' : 'nav'} onClick={() => setPage(id)}><i>{icon}</i>{label}</button>)}</nav>
  </aside>
}
