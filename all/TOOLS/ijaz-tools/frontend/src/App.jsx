import { useState, useEffect } from 'react'
import NetworkPage from './pages/NetworkPage.jsx'
import NmapPage    from './pages/NmapPage.jsx'
import IpScanPage  from './pages/IpScanPage.jsx'
import ScriptPage  from './pages/ScriptPage.jsx'
import ChatPage    from './pages/ChatPage.jsx'
import OcrPage     from './pages/OcrPage.jsx'

const SCRIPTS = [
  {
    id: 'pynmap',
    name: 'PyNmap',
    sub: 'Python port scanner',
    icon: '🗺️',
    desc: 'Educational port scanner with service detection and banner grabbing.',
    needsTarget: true,
    needsFlags: true,
    example: 'pynmap.py 192.168.1.1 -sV',
  },
  {
    id: 'network_scanner',
    name: 'Network Scanner',
    sub: 'Ping host discovery',
    icon: '📶',
    desc: 'Ping-based host discovery across a local subnet range.',
    needsTarget: false,
    needsFlags: false,
    example: 'network_scanner.py',
  },
  {
    id: 'port_scanner',
    name: 'Port Scanner',
    sub: 'TCP port checker',
    icon: '🔌',
    desc: 'Focused TCP port checker for exposed services on a host.',
    needsTarget: true,
    needsFlags: false,
    example: 'port_scanner.py 192.168.1.1',
  },
  {
    id: 'service_detector',
    name: 'Service Detector',
    sub: 'Banner grabbing',
    icon: '🏷️',
    desc: 'Identify service types from open endpoints via banner grabbing.',
    needsTarget: true,
    needsFlags: false,
    example: 'service_detector.py 192.168.1.1',
  },
  {
    id: 'packet_sniffer',
    name: 'Packet Sniffer',
    sub: 'Capture packets',
    icon: '📦',
    desc: 'Capture and inspect packets on the local network interface.',
    needsTarget: false,
    needsFlags: false,
    example: 'packet_sniffer.py --count 10',
  },
  {
    id: 'maclookup',
    name: 'MAC Lookup',
    sub: 'OUI vendor lookup',
    icon: '🔎',
    desc: 'Resolve a MAC address OUI to its manufacturer name.',
    needsTarget: false,
    needsFlags: false,
    example: 'maclookup.py',
  },
  {
    id: 'net_toolkit',
    name: 'Net Toolkit',
    sub: 'Multi-mode toolkit',
    icon: '🧰',
    desc: 'Multi-mode toolkit — scan mode runs host discovery and port checks.',
    needsTarget: true,
    needsFlags: false,
    example: 'net_toolkit.py --mode scan --target 192.168.1.1',
  },
]

const CORE_PAGES = [
  { id: 'network', label: 'Network Monitor', sub: 'Live devices & traffic', icon: '📡' },
  { id: 'nmap',    label: 'Nmap Studio',     sub: 'Scan with flag presets', icon: '🔍' },
  { id: 'ipscan',  label: 'IP Scanner',      sub: 'Ping sweep subnet',      icon: '🌐' },
  { id: 'ocr',     label: 'PDF to Word',     sub: 'OCR & convert to .docx', icon: '📝' },
  { id: 'chat',    label: 'AI Assistant',    sub: 'Ask about networking',   icon: '🤖' },
]

export default function App() {
  const [page, setPage]               = useState('network')
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

  const coreActive   = CORE_PAGES.find(p => p.id === page)
  const scriptActive = SCRIPTS.find(s => s.id === page)
  const activeLabel  = coreActive?.label ?? scriptActive?.name  ?? ''
  const activeSub    = coreActive?.sub   ?? scriptActive?.sub   ?? ''

  return (
    <div className="shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">I</div>
          <div className="sidebar-brand-text">
            <h1>IJAZ Tools</h1>
            <p>Network operations</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Core tools */}
          {CORE_PAGES.map(p => (
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

          {/* Divider + section label */}
          <div style={{ margin: '8px 4px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
              Python Scripts
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Script tools */}
          {SCRIPTS.map(s => (
            <button
              key={s.id}
              className={`nav-btn${page === s.id ? ' active' : ''}`}
              onClick={() => setPage(s.id)}
            >
              <div className="nav-btn-icon">{s.icon}</div>
              <div>
                <div className="nav-btn-label">{s.name}</div>
                <div className="nav-btn-sub">{s.sub}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-status">
            <span className={`dot ${backendOnline ? 'dot-green' : 'dot-red'}`} />
            Backend {backendOnline ? 'online · port 8000' : 'offline'}
          </div>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header className="topbar">
        <div>
          <div className="topbar-title">{activeLabel}</div>
          <div className="topbar-sub">{activeSub}</div>
        </div>
        <div className="topbar-right">
          <span className={`badge ${backendOnline ? 'badge-green' : 'badge-red'}`}>
            {backendOnline ? '● Online' : '○ Offline'}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main">
        {page === 'network' && <NetworkPage />}
        {page === 'nmap'    && <NmapPage />}
        {page === 'ipscan'  && <IpScanPage />}
        {page === 'ocr'     && <OcrPage />}
        {page === 'chat'    && <ChatPage />}
        {scriptActive && <ScriptPage key={page} script={scriptActive} />}
      </main>

    </div>
  )
}
