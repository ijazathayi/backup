import { useState, useEffect, useRef } from 'react'

const COMMON_DNS = [
  { label: 'Google (8.8.8.8 / 8.8.4.4)',       dns1: '8.8.8.8',   dns2: '8.8.4.4' },
  { label: 'Cloudflare (1.1.1.1 / 1.0.0.1)',   dns1: '1.1.1.1',   dns2: '1.0.0.1' },
  { label: 'OpenDNS (208.67.222.222)',           dns1: '208.67.222.222', dns2: '208.67.220.220' },
  { label: 'Quad9 (9.9.9.9)',                   dns1: '9.9.9.9',   dns2: '149.112.112.112' },
]

export default function StaticIpPage() {
  const [adapters, setAdapters] = useState([])
  const [form, setForm] = useState({
    adapter: '',
    ip: '',
    subnet: '255.255.255.0',
    gateway: '',
    dns1: '8.8.8.8',
    dns2: '8.8.4.4',
  })
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [done, setDone]       = useState(false)
  const wsRef    = useRef(null)
  const termRef  = useRef(null)

  // Load adapter names
  useEffect(() => {
    fetch('/api/adapters/names')
      .then(r => r.json())
      .then(d => {
        setAdapters(d.adapters || [])
        if (d.adapters?.length) setForm(f => ({ ...f, adapter: d.adapters[0] }))
      })
      .catch(() => {})
  }, [])

  // Auto-fill from current adapter config
  const fillFromAdapter = () => {
    fetch('/api/adapters')
      .then(r => r.json())
      .then(list => {
        const a = list.find(x => x.name === form.adapter)
        if (!a) return
        setForm(f => ({
          ...f,
          ip:      a.ip      || f.ip,
          subnet:  a.subnet  || f.subnet,
          gateway: a.gateway || f.gateway,
          dns1:    a.dns?.[0] || f.dns1,
          dns2:    a.dns?.[1] || f.dns2,
        }))
      })
      .catch(() => {})
  }

  const applyDnsPreset = preset => {
    setForm(f => ({ ...f, dns1: preset.dns1, dns2: preset.dns2 }))
  }

  const scrollBottom = () => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }

  const handleSubmit = e => {
    e.preventDefault()
    setOutput('')
    setDone(false)
    setRunning(true)

    const ws = new WebSocket(`ws://${location.host}/ws/run`)
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({ action: 'set-static', ...form }))

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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="col gap-16">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Set Static IP</div>
            <div className="card-sub">Assign a fixed IP address to a network adapter</div>
          </div>
          <span className="badge badge-orange">⚠ Requires Admin</span>
        </div>

        <form className="col gap-12" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
          {/* Adapter */}
          <div className="field">
            <label className="field-label">Network Adapter</label>
            <div className="row gap-8">
              <select className="select" value={form.adapter} onChange={e => set('adapter', e.target.value)} disabled={running}>
                {adapters.length === 0
                  ? <option value="">Loading adapters…</option>
                  : adapters.map(a => <option key={a} value={a}>{a}</option>)
                }
              </select>
              <button type="button" className="btn btn-sm" onClick={fillFromAdapter} disabled={running || !form.adapter}>
                📋 Fill Current
              </button>
            </div>
          </div>

          {/* IP + Subnet */}
          <div className="grid-2">
            <div className="field">
              <label className="field-label">IP Address</label>
              <input className="input" placeholder="192.168.1.100" value={form.ip}
                onChange={e => set('ip', e.target.value)} disabled={running} required />
            </div>
            <div className="field">
              <label className="field-label">Subnet Mask</label>
              <input className="input" placeholder="255.255.255.0" value={form.subnet}
                onChange={e => set('subnet', e.target.value)} disabled={running} />
            </div>
          </div>

          {/* Gateway */}
          <div className="field">
            <label className="field-label">Default Gateway <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
            <input className="input" placeholder="192.168.1.1" value={form.gateway}
              onChange={e => set('gateway', e.target.value)} disabled={running} />
          </div>

          {/* DNS */}
          <div className="field">
            <label className="field-label">DNS Servers</label>
            <div className="row wrap gap-8 mt-4" style={{ marginBottom: 8 }}>
              {COMMON_DNS.map(p => (
                <button key={p.label} type="button" className="btn btn-xs" onClick={() => applyDnsPreset(p)} disabled={running}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid-2">
              <input className="input" placeholder="Primary DNS" value={form.dns1}
                onChange={e => set('dns1', e.target.value)} disabled={running} />
              <input className="input" placeholder="Secondary DNS" value={form.dns2}
                onChange={e => set('dns2', e.target.value)} disabled={running} />
            </div>
          </div>

          <div className="row gap-8 mt-4">
            <button type="submit" className="btn btn-primary" disabled={running || !form.adapter || !form.ip}>
              {running ? <><span className="spinner" /> Applying…</> : '⚡ Apply Static IP'}
            </button>
            {done && <span className="badge badge-green">✓ Done</span>}
          </div>
        </form>
      </div>

      {/* Terminal output */}
      {output && (
        <div className="terminal-wrap">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: '#f87171' }} />
            <div className="terminal-dot" style={{ background: '#fbbf24' }} />
            <div className="terminal-dot" style={{ background: '#34d399' }} />
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-3)' }}>netsh output</span>
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
