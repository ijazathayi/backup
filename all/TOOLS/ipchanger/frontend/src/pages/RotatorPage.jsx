import { useState, useEffect, useRef } from 'react'

const TEST_CONCURRENCY = 500  // must match backend proxy_engine.py

// ── tiny helpers ──────────────────────────────────────────────
const levelColor = l =>
  l === 'success' ? 'var(--green)'
  : l === 'error' ? 'var(--red)'
  : l === 'warn'  ? 'var(--yellow)'
  : 'var(--text-3)'

function LogFeed({ log, termRef }) {
  return (
    <div className="terminal-wrap">
      <div className="terminal-header">
        <div className="terminal-dot" style={{ background: '#f87171' }} />
        <div className="terminal-dot" style={{ background: '#fbbf24' }} />
        <div className="terminal-dot" style={{ background: '#34d399' }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-3)' }}>rotation log</span>
      </div>
      <div className="terminal" ref={termRef} style={{ maxHeight: 280 }}>
        {log.length === 0
          ? <span style={{ color: 'var(--text-3)' }}>No activity yet…</span>
          : log.map((e, i) => (
            <div key={i}>
              <span style={{ color: 'var(--text-3)' }}>[{e.ts}] </span>
              <span style={{ color: levelColor(e.level) }}>{e.msg}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Proxy Rotator panel ───────────────────────────────────────
function ProxyPanel() {
  const [state, setState]     = useState(null)
  const [interval, setInterval_] = useState(10)
  const wsRef   = useRef(null)
  const termRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`ws://${location.host}/ws/proxy`)
      wsRef.current = ws
      ws.onmessage = ev => {
        const d = JSON.parse(ev.data)
        setState(d)
        setTimeout(() => {
          if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
        }, 30)
      }
      ws.onclose = () => setTimeout(connect, 2000)
      ws.onerror = () => ws.close()
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  const post = (path, body = {}) =>
    fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  const handleStart = () => post('/api/proxy/start', { interval })
  const handleStop  = () => post('/api/proxy/stop')
  const handleRefresh = () => post('/api/proxy/refresh')
  const handleRotateNow = () => post('/api/proxy/rotate-now')

  const s = state

  return (
    <div className="col gap-16">
      {/* ── Stats ── */}
      <div className="grid-3">
        <div className="stat-tile">
          <div className="stat-tile-label">Visible IP</div>
          <div className="stat-tile-value" style={{ fontSize: 16, paddingTop: 4 }}>
            {s?.current_ip || '—'}
          </div>
          <div className="stat-tile-detail">What websites see</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Working Proxies</div>
          <div className="stat-tile-value">{s?.alive_proxies ?? '—'}</div>
          <div className="stat-tile-detail">of {s?.total_proxies ?? 0} fetched</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Rotations</div>
          <div className="stat-tile-value">{s?.rotation_count ?? 0}</div>
          <div className="stat-tile-detail">
            {s?.running ? <span style={{ color: 'var(--green)' }}>● Running</span> : 'Stopped'}
          </div>
        </div>
      </div>

      {/* ── Current proxy ── */}
      {s?.current && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Active Proxy</div>
              <div className="card-sub">Traffic is being routed through this server</div>
            </div>
            <span className="badge badge-green">● Active</span>
          </div>
          <div className="grid-3" style={{ gap: 12 }}>
            <div>
              <div className="field-label">Address</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>
                {s.current.host}:{s.current.port}
              </div>
            </div>
            <div>
              <div className="field-label">Protocol</div>
              <div style={{ marginTop: 4 }}>
                <span className="badge badge-blue">{s.current.protocol.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <div className="field-label">Latency</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, marginTop: 4, color: 'var(--yellow)' }}>
                {s.current.latency_ms}ms
              </div>
            </div>
          </div>

          <div className="divider" />

          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            <strong style={{ color: 'var(--text-2)' }}>How to use:</strong> Set your browser or system proxy to{' '}
            <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4, color: 'var(--accent)' }}>
              {s.current.protocol}://{s.current.host}:{s.current.port}
            </code>
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Controls</div>
            <div className="card-sub">Fetch proxies, set rotation interval, start/stop</div>
          </div>
        </div>

        <div className="col gap-12" style={{ maxWidth: 480 }}>
          {/* Fetch progress */}
          {(s?.fetching || s?.testing) && (
            <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', fontSize: 13 }}>
              <div className="row gap-8">
                <span className="spinner" />
                {s.fetching
                  ? 'Fetching proxy lists from sources…'
                  : `Testing ${TEST_CONCURRENCY} proxies simultaneously… ${s.test_progress}%`
                }
              </div>
              {s.testing && (
                <>
                  <div className="progress-track mt-8">
                    <div className="progress-fill" style={{ width: `${s.test_progress}%` }} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
                    {s.alive_proxies} working found so far out of {s.total_proxies} total
                  </div>
                </>
              )}
            </div>
          )}

          <div className="field" style={{ maxWidth: 200 }}>
            <label className="field-label">Rotation Interval</label>
            <select className="select" value={interval} onChange={e => setInterval_(Number(e.target.value))} disabled={s?.running}>
              {[5, 10, 15, 20, 30, 60].map(n => (
                <option key={n} value={n}>Every {n}s</option>
              ))}
            </select>
          </div>

          <div className="row wrap gap-8">
            <button className="btn" onClick={handleRefresh} disabled={s?.fetching || s?.testing}>
              🔃 Fetch &amp; Test Proxies
            </button>
            {s?.running ? (
              <button className="btn btn-danger" onClick={handleStop}>■ Stop Rotation</button>
            ) : (
              <button className="btn btn-primary" onClick={handleStart} disabled={!s?.alive_proxies || s?.fetching || s?.testing}>
                ▶ Start Rotation
              </button>
            )}
            {s?.running && (
              <button className="btn btn-warning" onClick={handleRotateNow}>⚡ Rotate Now</button>
            )}
          </div>

          {!s?.alive_proxies && !s?.fetching && !s?.testing && (
            <div style={{ fontSize: 12, color: 'var(--yellow)' }}>
              ⚠ No proxies loaded yet — click "Fetch &amp; Test Proxies" first
            </div>
          )}
        </div>
      </div>

      {/* ── Log ── */}
      <LogFeed log={s?.log || []} termRef={termRef} />
    </div>
  )
}

// ── Tor panel ─────────────────────────────────────────────────
function TorPanel() {
  const [state, setState]     = useState(null)
  const [interval, setInterval_] = useState(10)
  const wsRef   = useRef(null)
  const termRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`ws://${location.host}/ws/tor`)
      wsRef.current = ws
      ws.onmessage = ev => {
        const d = JSON.parse(ev.data)
        setState(d)
        setTimeout(() => {
          if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
        }, 30)
      }
      ws.onclose = () => setTimeout(connect, 2000)
      ws.onerror = () => ws.close()
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  const post = (path, body = {}) =>
    fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  const s = state

  return (
    <div className="col gap-16">
      {/* ── Tor not available warning ── */}
      {s && !s.available && (
        <div style={{ padding: '14px 18px', background: 'var(--yellow-dim)', border: '1px solid var(--yellow)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontWeight: 700, color: 'var(--yellow)', marginBottom: 6 }}>⚠ tor.exe not found</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Place <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>tor.exe</code> in the backend folder:<br />
            <code style={{ background: 'var(--surface-3)', padding: '4px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4, color: 'var(--accent)' }}>
              ipchanger\backend\tor.exe
            </code><br /><br />
            Download from{' '}
            <a href="https://www.torproject.org/download/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
              torproject.org
            </a>{' '}→ Tor Expert Bundle
          </div>
        </div>
      )}

      {/* ── Bootstrapping indicator ── */}
      {s?.available && s?.running && !s?.tor_ready && (
        <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)' }}>
          <div className="row gap-8">
            <span className="spinner" />
            <span style={{ fontSize: 13 }}>Tor is bootstrapping — connecting to the Tor network…</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
            This takes 10–30 seconds on first run. Check the log below for progress.
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid-3">
        <div className="stat-tile">
          <div className="stat-tile-label">Exit IP (Tor)</div>
          <div className="stat-tile-value" style={{ fontSize: 16, paddingTop: 4 }}>
            {s?.current_ip || '—'}
          </div>
          <div className="stat-tile-detail">Tor exit node IP</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Circuits Rotated</div>
          <div className="stat-tile-value">{s?.rotation_count ?? 0}</div>
          <div className="stat-tile-detail">New circuits requested</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Status</div>
          <div className="stat-tile-value" style={{ fontSize: 15, paddingTop: 4 }}>
            {!s?.available
              ? <span style={{ color: 'var(--red)' }}>✗ Not found</span>
              : s?.running && !s?.tor_ready
                ? <span style={{ color: 'var(--yellow)' }} className="pulse">⏳ Bootstrapping</span>
                : s?.running && s?.tor_ready
                  ? <span style={{ color: 'var(--green)' }}>● Running</span>
                  : <span style={{ color: 'var(--text-3)' }}>Stopped</span>
            }
          </div>
          <div className="stat-tile-detail">SOCKS5 · port 9050</div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Tor Circuit Rotation</div>
            <div className="card-sub">
              Launches tor.exe automatically, requests a new exit node on a timer
            </div>
          </div>
        </div>

        <div className="col gap-12" style={{ maxWidth: 480 }}>
          <div className="field" style={{ maxWidth: 200 }}>
            <label className="field-label">Rotation Interval</label>
            <select className="select" value={interval}
              onChange={e => setInterval_(Number(e.target.value))}
              disabled={s?.running || !s?.available}>
              {[5, 10, 15, 20, 30, 60].map(n => (
                <option key={n} value={n}>Every {n}s</option>
              ))}
            </select>
          </div>

          <div className="row wrap gap-8">
            {s?.running ? (
              <button className="btn btn-danger" onClick={() => post('/api/tor/stop')}>■ Stop Tor</button>
            ) : (
              <button className="btn btn-primary"
                onClick={() => post('/api/tor/start', { interval })}
                disabled={!s?.available}>
                ▶ Start Tor
              </button>
            )}
            {s?.running && s?.tor_ready && (
              <button className="btn btn-warning" onClick={() => post('/api/tor/new-circuit')}>
                ⚡ New Circuit Now
              </button>
            )}
          </div>

          {s?.available && s?.tor_ready && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--text-2)' }}>Browser proxy:</strong> Set SOCKS5 to{' '}
              <code style={{ color: 'var(--accent)' }}>127.0.0.1:9050</code> to route browser traffic through Tor.
              All other apps already use the system proxy from the proxy rotator.
            </div>
          )}
        </div>
      </div>

      {/* ── Log ── */}
      <LogFeed log={s?.log || []} termRef={termRef} />
    </div>
  )
}

// ── Main page with mode toggle ────────────────────────────────
export default function RotatorPage() {
  const [mode, setMode] = useState('proxy')  // 'proxy' | 'tor'

  return (
    <div className="col gap-16">
      {/* ── Header + toggle ── */}
      <div className="card">
        <div className="row-between">
          <div>
            <div className="card-title" style={{ fontSize: 16 }}>IP Rotator</div>
            <div className="card-sub" style={{ marginTop: 4 }}>
              Route your traffic through rotating proxies or Tor to mask your real IP
            </div>
          </div>
          <div className="seg">
            <button className={`seg-btn${mode === 'proxy' ? ' active' : ''}`} onClick={() => setMode('proxy')}>
              🌐 Free Proxies
            </button>
            <button className={`seg-btn${mode === 'tor' ? ' active' : ''}`} onClick={() => setMode('tor')}>
              🧅 Tor Network
            </button>
          </div>
        </div>

        <div className="divider" />

        {mode === 'proxy' ? (
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Fetches thousands of free public proxies, tests them for speed, and rotates your visible IP automatically.
            Point your browser's HTTP/SOCKS5 proxy setting to the active proxy address shown below.
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Uses the Tor network to route traffic through multiple encrypted relays. Requests a new circuit (new exit IP)
            on a timer. Requires Tor to be installed and running with ControlPort enabled.
          </div>
        )}
      </div>

      {mode === 'proxy' ? <ProxyPanel /> : <TorPanel />}
    </div>
  )
}
