import { useState, useEffect } from 'react'
import DashboardPage from './pages/DashboardPage.jsx'
import StaticIpPage  from './pages/StaticIpPage.jsx'
import DhcpPage      from './pages/DhcpPage.jsx'
import PingPage      from './pages/PingPage.jsx'
import RotatorPage   from './pages/RotatorPage.jsx'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard',     sub: 'Live adapter overview',    icon: '📡' },
  { id: 'rotator',   label: 'IP Rotator',    sub: 'Proxy & Tor IP masking',   icon: '🔀' },
  { id: 'static',    label: 'Set Static IP', sub: 'Assign fixed IP address',  icon: '🔒' },
  { id: 'dhcp',      label: 'DHCP / Renew',  sub: 'Auto IP & lease renewal',  icon: '🔄' },
  { id: 'ping',      label: 'Ping Test',     sub: 'Connectivity & latency',   icon: '📶' },
]

export default function App() {
  const [page, setPage]               = useState('dashboard')
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    const check = async () => {
      try { setBackendOnline((await fetch('/api/status')).ok) }
      catch { setBackendOnline(false) }
    }
    check()
    const id = setInterval(check, 5000)
    return () => clearInterval(id)
  }, [])

  const active = PAGES.find(p => p.id === page)

  return (
    <div className="shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">IP</div>
          <div className="sidebar-brand-text">
            <h1>IP Changer</h1>
            <p>Network configuration</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {PAGES.map(p => (
            <button
              key={p.id}
              className={`nav-btn${page === p.id ? ' active' : ''}`}
              onClick={() => setPage(p.id)}
            >
              <div className="nav-btn-icon">{p.icon}</div>
              <div>
                <div className="nav-btn-label">{p.label}</div>
                <div className="nav-btn-sub">{p.sub}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-status">
            <span className={`dot ${backendOnline ? 'dot-green' : 'dot-red'}`} />
            Backend {backendOnline ? 'online · port 8001' : 'offline'}
          </div>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className="topbar">
        <div>
          <div className="topbar-title">{active?.label}</div>
          <div className="topbar-sub">{active?.sub}</div>
        </div>
        <div className="topbar-right">
          <span className={`badge ${backendOnline ? 'badge-green' : 'badge-red'}`}>
            {backendOnline ? '● Online' : '○ Offline'}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'rotator'   && <RotatorPage />}
        {page === 'static'    && <StaticIpPage />}
        {page === 'dhcp'      && <DhcpPage />}
        {page === 'ping'      && <PingPage />}
      </main>

    </div>
  )
}
