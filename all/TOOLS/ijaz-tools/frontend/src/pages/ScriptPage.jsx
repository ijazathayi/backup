import { useState, useRef, useEffect } from 'react'
import { useMyIp } from '../hooks/useMyIp.js'

const WS_URL = `ws://${location.host}/ws/script`

export default function ScriptPage({ script }) {
  const [target, setTarget]   = useState('127.0.0.1')
  const { fetchIp, fetching } = useMyIp()
  const [flags, setFlags]     = useState('-sV')
  const [running, setRunning] = useState(false)
  const [lines, setLines]     = useState([])
  const [error, setError]     = useState('')
  const wsRef    = useRef(null)
  const bottomRef = useRef(null)

  // Auto-scroll terminal as lines arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  // Kill WS if user navigates away mid-run
  useEffect(() => () => wsRef.current?.close(), [])

  const run = () => {
    setError('')
    setLines([])
    setRunning(true)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ script: script.id, target, flags }))
    }

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'output') {
        setLines(p => [...p, msg.data])
      } else if (msg.type === 'done') {
        setLines(p => [...p, msg.data])   // exit code line
        setRunning(false)
        ws.close()
      } else if (msg.type === 'error') {
        setError(msg.data)
        setRunning(false)
        ws.close()
      }
      // heartbeat — no action needed, just keeps connection alive
    }

    ws.onerror = () => {
      setError('WebSocket error — is the backend running?')
      setRunning(false)
    }

    ws.onclose = () => setRunning(false)
  }

  const stop = () => {
    wsRef.current?.close()
    setRunning(false)
    setLines(p => [...p, '\n[Stopped by user]'])
  }

  const cmdPreview = `python ${script.example
    .replace('192.168.1.1', target || '192.168.1.1')
    .replace('-sV', flags || '-sV')}`

  return (
    <div className="col gap-16">

      {/* ── Info banner ── */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius)',
          background: 'var(--surface-3)', display: 'grid', placeItems: 'center',
          fontSize: 24, flexShrink: 0,
        }}>
          {script.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{script.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{script.desc}</div>
        </div>
      </div>

      {/* ── Controls + Terminal ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* Left: inputs */}
        <div className="card col gap-12">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="card-title">Configuration</div>
          </div>

          {script.needsTarget && (
            <div className="field">
              <label className="field-label">Target IP / Subnet</label>
              <input
                className="input"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="127.0.0.1 or 192.168.1.0/24"
                disabled={running}
              />
              <div className="row gap-8 mt-4">
                <button type="button" className="btn btn-sm" onClick={() => fetchIp(setTarget)} disabled={running || fetching}>
                  {fetching ? <span className="spinner" /> : '📍 My IP'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => fetchIp(setTarget, 24)} disabled={running || fetching}>
                  Subnet /24
                </button>
                <button type="button" className="btn btn-sm" onClick={() => fetchIp(setTarget, 25)} disabled={running || fetching}>
                  Subnet /25
                </button>
              </div>
            </div>
          )}

          {script.needsFlags && (
            <div className="field">
              <label className="field-label">Flags</label>
              <input
                className="input"
                value={flags}
                onChange={e => setFlags(e.target.value)}
                placeholder="-sV"
                disabled={running}
              />
            </div>
          )}

          {/* command preview */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Command</div>
            <code style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>
              {cmdPreview}
            </code>
          </div>

          {error && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius)',
              color: 'var(--red)',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {running ? (
            <button className="btn btn-danger" onClick={stop}>
              ■ Stop
            </button>
          ) : (
            <button className="btn btn-primary" onClick={run}>
              ▶ Run
            </button>
          )}
        </div>

        {/* Right: streaming terminal */}
        <div className="terminal-wrap">
          <div className="terminal-header">
            <span className="terminal-dot" style={{ background: '#f87171' }} />
            <span className="terminal-dot" style={{ background: '#fbbf24' }} />
            <span className="terminal-dot" style={{ background: '#34d399' }} />
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)' }}>
              {script.name}
            </span>
            {running && (
              <span className="row gap-8" style={{ marginLeft: 'auto' }}>
                <span className="spinner" />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Running…</span>
              </span>
            )}
            {lines.length > 0 && !running && (
              <button
                className="btn btn-xs"
                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-3)' }}
                onClick={() => setLines([])}
              >
                Clear
              </button>
            )}
          </div>
          <div className="terminal" style={{ minHeight: 360, maxHeight: 560 }}>
            {lines.length === 0 && !running
              ? <span style={{ color: 'var(--text-3)' }}>Hit Run — output streams here live…</span>
              : lines.join('')}
            {running && lines.length === 0 && (
              <span className="pulse" style={{ color: 'var(--text-3)' }}>Starting…</span>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

      </div>
    </div>
  )
}
