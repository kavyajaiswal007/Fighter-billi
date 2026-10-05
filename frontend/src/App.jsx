import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Documents from './components/Documents'
import Dashboard from './components/Dashboard'
import './App.css'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <main className="app">
      <Sidebar page={page} setPage={setPage} />
      <div className="content">
        {page === 'dashboard' && <Dashboard setPage={setPage} />}
        {page === 'documents' && <Documents />}
        {page === 'chat' && <Chat />}
      </div>
    </main>
  )
}
