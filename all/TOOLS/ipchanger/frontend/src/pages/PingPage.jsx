import { useState, useRef } from 'react'

const QUICK_HOSTS = [
  { label: 'Google DNS',    host: '8.8.8.8' },
  { label: 'Cloudflare',   host: '1.1.1.1' },
  { label: 'Gateway',      host: '192.168.1.1' },
  { label: 'Localhost',    host: '127.0.0.1' },
  { label: 'Google.com',   host: 'google.com' },
]

export default function PingPage() {
  const [host, setHost]     = useState('8.8.8.8')
  const [count, setCount]   = useState(4)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [stats, setStats]   = useState(null)
  const wsRef   = useRef(null)
  const termRef = useRef(null)

  const scrollBottom = () => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }

  const parseStats = (text) => {
    // Parse Windows ping stats
    const lossMatch = text.match(/\((\d+)% loss\)/)
    const minMatch  = text.match(/Minimum = (\d+)ms/)
    const maxMatch  = text.match(/Maximum = (\d+)ms/)
    const avgMatch  = text.match(/Average = (\d+)ms/)
    const sentMatch = text.match(/Sent = (\d+)/)
    const recvMatch = text.match(/Received = (\d+)/)

    if (!sentMatch) return null
    return {
      sent:    sentMatch?.[1] || '—',
      recv:    recvMatch?.[1] || '—',
      loss:    lossMatch?.[1]  || '0',
      min:     minMatch?.[1]   || '—',
      max:     maxMatch?.[1]   || '—',
      avg:     avgMatch?.[1]   || '—',
    }
  }

  const startPing = e => {
    e.preventDefault()
    setOutput('')
    setStats(null)
    setRunning(true)

    const ws = new WebSocket(`ws://${location.host}/ws/run`)
    wsRef.current = ws

    let fullOutput = ''

    ws.onopen = () => ws.send(JSON.stringify({ action: 'ping', host, count }))

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'output' || msg.type === 'done' || msg.type === 'error') {
        fullOutput += msg.data || ''
        setOutput(fullOutput)
        setTimeout(scrollBottom, 30)
      }
      if (msg.type === 'done') {
        setRunning(false)
        setStats(parseStats(fullOutput))
        ws.close()
      }
      if (msg.type === 'error') { setRunning(false); ws.close() }
    }

    ws.onerror = () => { setOutput(p => p + '\n[WebSocket error]'); setRunning(false) }
    ws.onclose = () => setRunning(false)
  }

  const stopPing = () => { wsRef.current?.close(); setRunning(false) }

  const lossColor = (loss) => {
    const n = parseInt(loss)
    if (n === 0)  return 'var(--green)'
    if (n < 25)   return 'var(--yellow)'
    return 'var(--red)'
  }

  return (
    <div className="col gap-16">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Ping Test</div>
            <div className="card-sub">Test connectivity and latency to any host or IP</div>
          </div>
        </div>

        <form className="col gap-12" onSubmit={startPing} style={{ maxWidth: 480 }}>
          <div className="field">
            <label className="field-label">Host / IP</label>
            <input className="input" placeholder="8.8.8.8 or google.com" value={host}
              onChange={e => setHost(e.target.value)} disabled={running} required />
            <div className="row wrap gap-8 mt-4">
              {QUICK_HOSTS.map(q => (
                <button key={q.host} type="button" className="btn btn-xs"
                  onClick={() => setHost(q.host)} disabled={running}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ maxWidth: 160 }}>
            <label className="field-label">Ping Count</label>
            <select className="select" value={count} onChange={e => setCount(Number(e.target.value))} disabled={running}>
              {[1, 2, 4, 6, 8, 10].map(n => <option key={n} value={n}>{n} pings</option>)}
            </select>
          </div>

          <div className="row gap-8">
            {running
              ? <button type="button" className="btn btn-danger" onClick={stopPing}>■ Stop</button>
              : <button type="submit" className="btn btn-primary">▶ Ping</button>
            }
          </div>
        </form>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid-3">
          <div className="stat-tile">
            <div className="stat-tile-label">Avg Latency</div>
            <div className="stat-tile-value" style={{ color: 'var(--accent)' }}>{stats.avg}ms</div>
            <div className="stat-tile-detail">Min {stats.min}ms / Max {stats.max}ms</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Packet Loss</div>
            <div className="stat-tile-value" style={{ color: lossColor(stats.loss) }}>{stats.loss}%</div>
            <div className="stat-tile-detail">{stats.recv} of {stats.sent} received</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Result</div>
            <div className="stat-tile-value" style={{ fontSize: 16, paddingTop: 4 }}>
              {parseInt(stats.loss) === 0
                ? <span style={{ color: 'var(--green)' }}>✓ Reachable</span>
                : parseInt(stats.loss) === 100
                  ? <span style={{ color: 'var(--red)' }}>✗ Unreachable</span>
                  : <span style={{ color: 'var(--yellow)' }}>⚠ Partial</span>
              }
            </div>
            <div className="stat-tile-detail">{host}</div>
          </div>
        </div>
      )}

      {/* Terminal output */}
      {output && (
        <div className="terminal-wrap">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: '#f87171' }} />
            <div className="terminal-dot" style={{ background: '#fbbf24' }} />
            <div className="terminal-dot" style={{ background: '#34d399' }} />
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-3)' }}>ping output — {host}</span>
            {running && <span className="spinner" style={{ marginLeft: 'auto' }} />}
          </div>
          <div className="terminal" ref={termRef} style={{ maxHeight: 360 }}>
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
