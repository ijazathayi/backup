import { useState, useRef, useEffect } from 'react'
import { useMyIp } from '../hooks/useMyIp.js'

const WS_URL = `ws://${location.host}/ws/scan`

const PRESETS = [
  { group: 'Quick',       items: [
    { name: 'Quick scan',          flags: '-T4 -F' },
    { name: 'Ping only',           flags: '-sn' },
    { name: 'All hosts online',    flags: '-Pn' },
  ]},
  { group: 'Detection',   items: [
    { name: 'Service detection',   flags: '-sV --version-light' },
    { name: 'OS + service',        flags: '-O -sV' },
    { name: 'Aggressive',          flags: '-T4 -A -v' },
    { name: 'Default scripts',     flags: '-sC -sV' },
  ]},
  { group: 'Port range',  items: [
    { name: 'Top 100 ports',       flags: '-F' },
    { name: 'Top 2000 ports',      flags: '--top-ports 2000' },
    { name: 'All TCP ports',       flags: '-p 1-65535 -T4 -A -v' },
    { name: 'Common ports',        flags: '-p 22,80,443,3306,3389,8080' },
  ]},
  { group: 'Timing',      items: [
    { name: 'Paranoid  (T0)',      flags: '-T0' },
    { name: 'Sneaky    (T1)',      flags: '-T1' },
    { name: 'Polite    (T2)',      flags: '-T2' },
    { name: 'Normal    (T3)',      flags: '-T3' },
    { name: 'Aggressive(T4)',      flags: '-T4' },
    { name: 'Insane    (T5)',      flags: '-T5' },
  ]},
  { group: 'Scripts',     items: [
    { name: 'Vuln scripts',        flags: '--script vuln' },
    { name: 'Safe scripts',        flags: '--script safe' },
    { name: 'Malware detection',   flags: '--script malware' },
  ]},
  { group: 'Evasion',     items: [
    { name: 'Fragment packets',    flags: '-f' },
    { name: 'Decoy scan',          flags: '-D RND:10' },
    { name: 'Spoof MAC',           flags: '--spoof-mac 0' },
  ]},
]

export default function NmapPage() {
  const [target, setTarget]   = useState('')
  const [flags, setFlags]     = useState('-sV -T4 -O -F --version-light')
  const [output, setOutput]   = useState([])
  const [scanning, setScanning] = useState(false)
  const [error, setError]     = useState('')
  const { fetchIp, fetching } = useMyIp()
  const wsRef   = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output])

  const startScan = e => {
    e.preventDefault()
    if (!target.trim()) { setError('Enter a target first'); return }
    setError('')
    setOutput([])
    setScanning(true)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen  = () => ws.send(JSON.stringify({ target, flags }))
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'output')   setOutput(p => [...p, msg.data])
      else if (msg.type === 'done') { setScanning(false); ws.close() }
      else if (msg.type === 'error') { setError(msg.data); setScanning(false); ws.close() }
    }
    ws.onerror = () => { setError('WebSocket error — is the backend running?'); setScanning(false) }
    ws.onclose = () => setScanning(false)
  }

  const stopScan = () => { wsRef.current?.close(); setScanning(false) }

  return (
    <div className="col gap-16">
      <div className="grid-2">
        {/* ── Left: form ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Scan Setup</div>
              <div className="card-sub">Only scan systems you own or have permission to test</div>
            </div>
          </div>

          <form className="col gap-12" onSubmit={startScan}>
            <div className="field">
              <label className="field-label">Target IP / Domain</label>
              <input
                className="input"
                placeholder="192.168.1.1 or scanme.nmap.org"
                value={target}
                onChange={e => setTarget(e.target.value)}
                disabled={scanning}
              />
              <div className="row gap-8 mt-4">
                <button type="button" className="btn btn-sm" onClick={() => fetchIp(setTarget)} disabled={scanning || fetching}>
                  {fetching ? <span className="spinner" /> : '📍 My IP'}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => fetchIp(setTarget, 24)} disabled={scanning || fetching}>Subnet /24</button>
                <button type="button" className="btn btn-sm" onClick={() => fetchIp(setTarget, 25)} disabled={scanning || fetching}>Subnet /25</button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Flags</label>
              <input
                className="input"
                value={flags}
                onChange={e => setFlags(e.target.value)}
                disabled={scanning}
              />
            </div>

            <div className="field">
              <label className="field-label">Preset</label>
              <select
                className="select"
                defaultValue=""
                onChange={e => { if (e.target.value) setFlags(e.target.value) }}
                disabled={scanning}
              >
                <option value="" disabled>Choose a preset…</option>
                {PRESETS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(i => (
                      <option key={i.flags} value={i.flags}>{i.name} — {i.flags}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div className="row gap-8">
              {scanning ? (
                <button type="button" className="btn btn-danger" onClick={stopScan}>
                  ■ Stop Scan
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">
                  ▶ Start Scan
                </button>
              )}
              {scanning && <><span className="spinner" /><span style={{ fontSize: 12, color: 'var(--text-3)' }}>Scanning…</span></>}
            </div>
          </form>
        </div>

        {/* ── Right: quick presets ── */}
        <div className="card" style={{ overflowY: 'auto', maxHeight: 480 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Quick Presets</div>
              <div className="card-sub">Click to load flags into the form</div>
            </div>
          </div>
          <div className="col gap-8">
            {PRESETS.map(g => (
              <div key={g.group}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 6 }}>{g.group}</div>
                <div className="col gap-4">
                  {g.items.map(i => (
                    <button
                      key={i.flags}
                      className="btn btn-sm"
                      style={{ justifyContent: 'space-between', textAlign: 'left' }}
                      onClick={() => setFlags(i.flags)}
                      disabled={scanning}
                    >
                      <span>{i.name}</span>
                      <code style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 4 }}>{i.flags}</code>
                    </button>
                  ))}
                </div>
                <div className="divider" style={{ margin: '10px 0' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Terminal output ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Terminal Output</div>
            <div className="card-sub">{scanning ? 'Streaming live…' : output.length > 0 ? 'Scan complete' : 'Waiting for scan'}</div>
          </div>
          {output.length > 0 && !scanning && (
            <button className="btn btn-xs" onClick={() => setOutput([])}>Clear</button>
          )}
        </div>
        <div className="terminal-wrap">
          <div className="terminal-header">
            <span className="terminal-dot" style={{ background: '#f87171' }} />
            <span className="terminal-dot" style={{ background: '#fbbf24' }} />
            <span className="terminal-dot" style={{ background: '#34d399' }} />
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)' }}>
              {target || 'nmap'} {flags}
            </span>
          </div>
          <div className="terminal" style={{ minHeight: 300, maxHeight: 520 }}>
            {output.length === 0 && !scanning
              ? <span style={{ color: 'var(--text-3)' }}>Enter a target and start a scan…</span>
              : output.join('')}
            {scanning && <span className="pulse" style={{ color: 'var(--accent)' }}>▌</span>}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
