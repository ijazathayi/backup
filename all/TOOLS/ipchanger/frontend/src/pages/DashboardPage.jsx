import { useState, useEffect, useRef } from 'react'

const WS_URL = `ws://${location.host}/ws/monitor`

export default function DashboardPage() {
  const [adapters, setAdapters] = useState([])
  const [localIp, setLocalIp]   = useState('—')
  const [publicIp, setPublicIp] = useState('loading…')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  // WebSocket live monitor
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen  = () => setConnected(true)
      ws.onclose = () => { setConnected(false); setTimeout(connect, 3000) }
      ws.onerror = () => ws.close()

      ws.onmessage = ev => {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'update') {
          setAdapters(msg.adapters || [])
          setLocalIp(msg.local_ip || '—')
        }
      }
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  // Fetch public IP once
  useEffect(() => {
    fetch('/api/public-ip')
      .then(r => r.json())
      .then(d => setPublicIp(d.ip || 'unavailable'))
      .catch(() => setPublicIp('unavailable'))
  }, [])

  const connectedAdapters = adapters.filter(a => a.ip)

  return (
    <div className="col gap-16">
      {/* ── Stats row ── */}
      <div className="grid-3">
        <div className="stat-tile">
          <div className="stat-tile-label">Local IP</div>
          <div className="stat-tile-value">{localIp}</div>
          <div className="stat-tile-detail">LAN address</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Public IP</div>
          <div className="stat-tile-value" style={{ fontSize: 16, paddingTop: 4 }}>{publicIp}</div>
          <div className="stat-tile-detail">External address</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Active Adapters</div>
          <div className="stat-tile-value">{connectedAdapters.length}</div>
          <div className="stat-tile-detail">of {adapters.length} total</div>
        </div>
      </div>

      {/* ── Adapter cards ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Network Adapters</div>
            <div className="card-sub">Live view — refreshes every 3 seconds</div>
          </div>
          <div className="row gap-8">
            {connected
              ? <span className="badge badge-green"><span className="dot dot-green" style={{ marginRight: 4 }} />Live</span>
              : <span className="badge badge-red pulse">Reconnecting…</span>
            }
          </div>
        </div>

        {adapters.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📡</div>
            <div className="empty-title">Loading adapters…</div>
            <div className="empty-sub">Waiting for backend</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Adapter</th>
                  <th>IP Address</th>
                  <th>Subnet</th>
                  <th>Gateway</th>
                  <th>DNS</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adapters.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      {a.mac && <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{a.mac}</div>}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: a.ip ? 'var(--accent)' : 'var(--text-3)' }}>
                      {a.ip || '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>{a.subnet || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>{a.gateway || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)' }}>
                      {a.dns?.length ? a.dns.join(', ') : '—'}
                    </td>
                    <td>
                      {a.dhcp
                        ? <span className="badge badge-blue">DHCP</span>
                        : <span className="badge badge-orange">Static</span>
                      }
                    </td>
                    <td>
                      {a.ip
                        ? <span className="badge badge-green">● Connected</span>
                        : <span className="badge badge-red">○ No IP</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
