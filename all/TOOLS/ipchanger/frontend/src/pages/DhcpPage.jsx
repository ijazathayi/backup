import { useState, useEffect, useRef } from 'react'

export default function DhcpPage() {
  const [adapters, setAdapters] = useState([])
  const [adapter, setAdapter]   = useState('')
  const [output, setOutput]     = useState('')
  const [running, setRunning]   = useState(false)
  const [done, setDone]         = useState(false)
  const wsRef   = useRef(null)
  const termRef = useRef(null)

  useEffect(() => {
    fetch('/api/adapters/names')
      .then(r => r.json())
      .then(d => {
        setAdapters(d.adapters || [])
        if (d.adapters?.length) setAdapter(d.adapters[0])
      })
      .catch(() => {})
  }, [])

  const scrollBottom = () => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }

  const runAction = (action) => {
    setOutput('')
    setDone(false)
    setRunning(true)

    const ws = new WebSocket(`ws://${location.host}/ws/run`)
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({ action, adapter }))

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'output' || msg.type === 'done' || msg.type === 'error') {
        setOutput(p => p + (msg.data || ''))
        setTimeout(scrollBottom, 30)
      }
      if (msg.type === 'done')  { setRunning(false); setDone(true); ws.close() }
      if (msg.type === 'error') { setRunning(false); ws.close() }
    }

    ws.onerror = () => { setOutput(p => p + '\n[WebSocket error]'); setRunning(false) }
    ws.onclose = () => setRunning(false)
  }

  return (
    <div className="col gap-16">
      {/* ── DHCP Switch ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Switch to DHCP</div>
            <div className="card-sub">Remove static IP and let the router assign one automatically</div>
          </div>
          <span className="badge badge-orange">⚠ Requires Admin</span>
        </div>

        <div className="col gap-12" style={{ maxWidth: 480 }}>
          <div className="field">
            <label className="field-label">Network Adapter</label>
            <select className="select" value={adapter} onChange={e => setAdapter(e.target.value)} disabled={running}>
              {adapters.length === 0
                ? <option value="">Loading…</option>
                : adapters.map(a => <option key={a} value={a}>{a}</option>)
              }
            </select>
          </div>

          <div className="row gap-8">
            <button className="btn btn-primary" onClick={() => runAction('set-dhcp')} disabled={running || !adapter}>
              {running ? <><span className="spinner" /> Switching…</> : '🔄 Enable DHCP'}
            </button>
            {done && <span className="badge badge-green">✓ Done</span>}
          </div>
        </div>
      </div>

      {/* ── Release / Renew ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Release &amp; Renew Lease</div>
            <div className="card-sub">Force the adapter to request a new IP from the DHCP server</div>
          </div>
        </div>

        <div className="col gap-12" style={{ maxWidth: 480 }}>
          <div className="field">
            <label className="field-label">Adapter <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(leave blank for all)</span></label>
            <select className="select" value={adapter} onChange={e => setAdapter(e.target.value)} disabled={running}>
              <option value="">All adapters</option>
              {adapters.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="row gap-8">
            <button className="btn btn-warning" onClick={() => runAction('release-renew')} disabled={running}>
              {running ? <><span className="spinner" /> Running…</> : '♻ Release & Renew'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Flush DNS ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Flush DNS Cache</div>
            <div className="card-sub">Clear the local DNS resolver cache</div>
          </div>
        </div>

        <div className="row gap-8">
          <button className="btn btn-danger" onClick={() => runAction('flush-dns')} disabled={running}>
            {running ? <><span className="spinner" /> Flushing…</> : '🗑 Flush DNS'}
          </button>
        </div>
      </div>

      {/* Terminal output */}
      {output && (
        <div className="terminal-wrap">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: '#f87171' }} />
            <div className="terminal-dot" style={{ background: '#fbbf24' }} />
            <div className="terminal-dot" style={{ background: '#34d399' }} />
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-3)' }}>ipconfig output</span>
            {running && <span className="spinner" style={{ marginLeft: 'auto' }} />}
          </div>
          <div className="terminal" ref={termRef} style={{ maxHeight: 320 }}>
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
