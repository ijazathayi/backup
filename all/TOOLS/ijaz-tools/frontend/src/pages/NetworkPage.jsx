import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = `ws://${location.host}/ws/network`

export default function NetworkPage() {
  const [mode, setMode]       = useState('wifi')
  const [connected, setConn]  = useState(false)
  const [stats, setStats]     = useState({ online: 0, ports: 0, bandwidth: '0.00 MB/s', traffic: { download: 0, upload: 0, packetHealth: 0, pingStability: 0 } })
  const [devices, setDevices] = useState([])
  const [scanResult, setScan] = useState(null)
  const [scanning, setScanning] = useState(null)   // ip being scanned
  const wsRef = useRef(null)

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConn(true)
      ws.send(JSON.stringify({ type: 'set_mode', mode }))
    }
    ws.onclose = () => {
      setConn(false)
      setTimeout(connect, 3000)
    }
    ws.onerror = () => ws.close()
    ws.onmessage = e => {
      const d = JSON.parse(e.data)
      if (d.type === 'update') {
        setStats(d.stats)
        setDevices(d.devices)
      }
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, []) // eslint-disable-line

  const changeMode = m => {
    setMode(m)
    wsRef.current?.send(JSON.stringify({ type: 'set_mode', mode: m }))
  }

  const refresh = () => wsRef.current?.send(JSON.stringify({ type: 'set_mode', mode }))

  const scanDevice = async ip => {
    setScanning(ip)
    setScan(null)
    try {
      const r = await fetch(`/api/network/scan/${ip}`)
      const d = await r.json()
      setScan(d)
    } catch (e) {
      setScan({ error: e.message })
    } finally {
      setScanning(null)
    }
  }

  const scanHost = async () => {
    setScanning('host')
    setScan(null)
    try {
      const r = await fetch(`/api/network/scan-host?mode=${mode}`)
      const d = await r.json()
      setScan(d)
    } catch (e) {
      setScan({ error: e.message })
    } finally {
      setScanning(null)
    }
  }

  return (
    <div className="col gap-16">
      {/* ── Header row ── */}
      <div className="row-between wrap gap-8">
        <div className="seg">
          <button className={`seg-btn${mode === 'wifi' ? ' active' : ''}`} onClick={() => changeMode('wifi')}>Wi-Fi</button>
          <button className={`seg-btn${mode === 'hotspot' ? ' active' : ''}`} onClick={() => changeMode('hotspot')}>Hotspot</button>
        </div>
        <div className="row gap-8">
          <button className="btn btn-sm" onClick={refresh}>↻ Refresh</button>
          <button className="btn btn-sm" onClick={scanHost} disabled={scanning === 'host'}>
            {scanning === 'host' ? <><span className="spinner" /> Scanning…</> : '🔍 Scan My Ports'}
          </button>
          <span className={`dot ${connected ? 'dot-green' : 'dot-red'}`} />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{connected ? 'Live' : 'Reconnecting…'}</span>
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid-4">
        <StatTile label="Devices Online"  value={stats.online}    detail="ARP discovered" />
        <StatTile label="Open Ports"      value={stats.ports}     detail="Listening locally" />
        <StatTile label="Bandwidth"       value={stats.bandwidth} detail="Current throughput" />
        <StatTile label="Ping to 8.8.8.8" value={stats.traffic?.packetHealth > 0 ? 'Reachable' : 'Unreachable'} detail={`Stability ${stats.traffic?.pingStability ?? 0}%`} />
      </div>

      {/* ── Traffic + Devices ── */}
      <div className="grid-2">
        {/* Traffic */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Traffic Health</div>
              <div className="card-sub">Live network metrics</div>
            </div>
          </div>
          <div className="col gap-12">
            <ProgressRow label="Download"      value={stats.traffic?.download ?? 0} />
            <ProgressRow label="Upload"        value={stats.traffic?.upload ?? 0} />
            <ProgressRow label="Packet Health" value={stats.traffic?.packetHealth ?? 0} />
            <ProgressRow label="Ping Stability"value={stats.traffic?.pingStability ?? 0} />
          </div>
        </div>

        {/* Devices */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Connected Devices</div>
              <div className="card-sub">Click a device to deep-scan it</div>
            </div>
            <span className="badge badge-blue">{devices.length}</span>
          </div>
          {devices.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No devices found</div>
              <div className="empty-sub">Make sure the backend is running and hit Refresh</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>MAC</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(d => (
                    <tr key={d.ip}>
                      <td style={{ fontFamily: 'monospace' }}>{d.ip}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-3)' }}>{d.mac}</td>
                      <td>
                        <button
                          className="btn btn-xs"
                          onClick={() => scanDevice(d.ip)}
                          disabled={!!scanning}
                        >
                          {scanning === d.ip ? <span className="spinner" /> : 'Scan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Scan result ── */}
      {(scanResult || scanning) && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Scan Result</div>
              <div className="card-sub">{scanResult?.target ?? 'Running…'}</div>
            </div>
            {scanResult && (
              <button className="btn btn-xs" onClick={() => setScan(null)}>✕ Close</button>
            )}
          </div>
          <div className="terminal-wrap">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#f87171' }} />
              <span className="terminal-dot" style={{ background: '#fbbf24' }} />
              <span className="terminal-dot" style={{ background: '#34d399' }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)' }}>
                {scanResult?.target ?? 'scanning…'}
              </span>
            </div>
            <div className="terminal" style={{ minHeight: 200, maxHeight: 420 }}>
              {scanning && !scanResult
                ? <span className="pulse" style={{ color: 'var(--text-3)' }}>Running scan…</span>
                : (scanResult?.output ?? scanResult?.error ?? '')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, detail }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
      <div className="stat-tile-detail">{detail}</div>
    </div>
  )
}

function ProgressRow({ label, value }) {
  return (
    <div className="progress-row">
      <div className="progress-row-top">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}
