import { useState } from 'react'
import BottomNav from './components/BottomNav'
import Overview from './components/Overview'
import Streams from './components/Streams'
import Fleet from './components/Fleet'
import LogEntry from './components/LogEntry'
import Contractors from './components/Contractors'
import { OVERVIEW, formatCurrency } from './data/mock'
import './App.css'

function App() {
  // #1: Log Entry is the default — it's what Ash opens the app to do
  const [tab, setTab] = useState('log')

  return (
    <>
      {/* #2: Compact header — greeting + today's net, not branding */}
      <header style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Hey Ash</span>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>—</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
            {formatCurrency(OVERVIEW.netMtd)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>this month</span>
        </div>
        <div style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'var(--gold-dim)',
          color: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
        }}>
          AB
        </div>
      </header>

      <div className="app-shell">
        <BottomNav active={tab} onTabChange={setTab} />
        <main className="app-main">
          {tab === 'overview' && <Overview />}
          {tab === 'streams' && <Streams />}
          {tab === 'fleet' && <Fleet />}
          {tab === 'log' && <LogEntry />}
          {tab === 'contractors' && <Contractors />}
        </main>
      </div>
    </>
  )
}

export default App
