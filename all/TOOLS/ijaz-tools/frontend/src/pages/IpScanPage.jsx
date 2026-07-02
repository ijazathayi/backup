import { useState, useRef } from 'react'
import { useMyIp } from '../hooks/useMyIp.js'

const WS_URL = `ws://${location.host}/ws/ipscan`

export default function IpScanPage() {
  const [subnet, setSubnet]   = useState('')
  const { fetchIp, fetching } = useMyIp()
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal]     = useState(0)
  const [found, setFound]     = useState([])
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')
  const wsRef = useRef(null)

  const startScan = e => {
    e.preventDefault()
    setError('')
    setFound([])
    setProgress(0)
    setTotal(0)
    setDone(false)
    setScanning(true)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({ subnet }))
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'start')    { setTotal(msg.total) }
      if (msg.type === 'found')    { setFound(p => [...p, msg.ip]) }
      if (msg.type === 'progress') { setProgress(msg.pct) }
      if (msg.type === 'done')     { setScanning(false); setDone(true); ws.close() }
      if (msg.type === 'error')    { setError(msg.data); setScanning(false); ws.close() }
    }
    ws.onerror = () => { setError('WebSocket error — is the backend running?'); setScanning(false) }
    ws.onclose = () => setScanning(false)
  }

  const stopScan = () => { wsRef.current?.close(); setScanning(false) }

  return (
    <div className="col gap-16">
      {/* ── Form ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Ping Sweep</div>
            <div className="card-sub">Discover live hosts on a subnet using ICMP ping</div>
          </div>
        </div>

        <form className="col gap-12" onSubmit={startScan} style={{ maxWidth: 520 }}>
          <div className="field">
            <label className="field-label">Subnet (CIDR)</label>
            <input
              className="input"
              placeholder="192.168.1.0/24"
              value={subnet}
              onChange={e => setSubnet(e.target.value)}
              disabled={scanning}
            />
            <div className="row gap-8 mt-4">
              <button type="button" className="btn btn-sm" onClick={() => fetchIp(setSubnet)} disabled={scanning || fetching}>
                {fetching ? <span className="spinner" /> : '📍 My IP'}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => fetchIp(setSubnet, 'subnet')} disabled={scanning || fetching}>
                Subnet /24
              </button>
              <button type="button" className="btn btn-sm" onClick={() => fetchIp(setSubnet, 25)} disabled={scanning || fetching}>
                Subnet /25
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="row gap-8">
            {scanning ? (
              <button type="button" className="btn btn-danger" onClick={stopScan}>■ Stop</button>
            ) : (
              <button type="submit" className="btn btn-primary">▶ Start Sweep</button>
            )}
          </div>
        </form>
      </div>

      {/* ── Progress ── */}
      {(scanning || done) && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Sweep Progress</div>
              <div className="card-sub">
                {done
                  ? `Done — found ${found.length} of ${total} hosts`
                  : `Scanning ${total} hosts…`}
              </div>
            </div>
            {scanning && <><span className="spinner" /></>}
          </div>
          <div className="progress-row">
            <div className="progress-row-top">
              <span>{scanning ? 'Scanning…' : 'Complete'}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%`, background: done ? 'var(--green)' : 'var(--accent)' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {found.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Hosts</div>
              <div className="card-sub">Responded to ICMP ping</div>
            </div>
            <span className="badge badge-green">{found.length} found</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {found.map((ip, i) => (
                  <tr key={ip}>
                    <td style={{ color: 'var(--text-3)', width: 40 }}>{i + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{ip}</td>
                    <td><span className="badge badge-green">● Alive</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {done && found.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🔇</div>
          <div className="empty-title">No hosts responded</div>
          <div className="empty-sub">All hosts in the subnet are down or blocking ICMP</div>
        </div>
      )}
    </div>
  )
}
