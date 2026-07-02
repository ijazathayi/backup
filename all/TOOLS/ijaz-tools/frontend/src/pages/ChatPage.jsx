import { useState, useRef, useEffect } from 'react'

const WS_URL = `ws://${location.host}/ws/chat`
const LS_KEY  = 'ijaz_openai_key'

const SUGGESTIONS = [
  'What do the nmap flags -sV -T4 -A mean?',
  'How do I scan for open ports on my subnet?',
  'Explain what a SYN scan is and when to use it',
  'What services typically run on port 443, 8080, 3389?',
  'How can I detect devices on my local network?',
  'What is banner grabbing and how does it work?',
]

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, marginRight: 10, marginTop: 2 }}>
          AI
        </div>
      )}
      <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: isUser ? 'var(--accent)' : 'var(--surface-2)', border: `1px solid ${isUser ? 'var(--accent)' : 'var(--border)'}`, color: isUser ? '#fff' : 'var(--text)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {msg.content}
        {msg.streaming && <span className="pulse" style={{ color: isUser ? 'rgba(255,255,255,.6)' : 'var(--accent)' }}>▌</span>}
      </div>
      {isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-3)', color: 'var(--text-2)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, marginLeft: 10, marginTop: 2 }}>
          U
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [thinking, setThinking]     = useState(false)
  const [error, setError]           = useState('')
  const [apiKey, setApiKey]         = useState(() => localStorage.getItem(LS_KEY) || '')
  const [showKeyInput, setShowKey]  = useState(false)
  const [keyDraft, setKeyDraft]     = useState('')
  const wsRef     = useRef(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => () => wsRef.current?.close(), [])

  const saveKey = () => {
    const k = keyDraft.trim()
    if (!k) return
    localStorage.setItem(LS_KEY, k)
    setApiKey(k)
    setKeyDraft('')
    setShowKey(false)
    setError('')
  }

  const removeKey = () => {
    localStorage.removeItem(LS_KEY)
    setApiKey('')
    setShowKey(false)
  }

  const send = (text) => {
    const content = (text ?? input).trim()
    if (!content || thinking) return

    if (!apiKey) {
      setError('Paste your OpenAI API key first using the key button above.')
      setShowKey(true)
      return
    }

    setInput('')
    setError('')

    const userMsg = { role: 'user', content }
    const history = [...messages, userMsg]
    setMessages([...history, { role: 'assistant', content: '', streaming: true }])
    setThinking(true)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({
      messages: history.map(m => ({ role: m.role, content: m.content })),
      api_key: apiKey,
    }))

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'token') {
        setMessages(prev => {
          const u = [...prev]
          const last = u[u.length - 1]
          if (last?.role === 'assistant') u[u.length - 1] = { ...last, content: last.content + msg.data }
          return u
        })
      } else if (msg.type === 'done') {
        setMessages(prev => {
          const u = [...prev]
          const last = u[u.length - 1]
          if (last?.role === 'assistant') u[u.length - 1] = { ...last, streaming: false }
          return u
        })
        setThinking(false)
        ws.close()
        inputRef.current?.focus()
      } else if (msg.type === 'error') {
        setMessages(prev => prev.filter(m => !(m.role === 'assistant' && m.streaming)))
        setError(msg.data)
        setThinking(false)
        ws.close()
      }
    }

    ws.onerror = () => { setMessages(prev => prev.filter(m => !(m.role === 'assistant' && m.streaming))); setError('WebSocket error — is the backend running?'); setThinking(false) }
    ws.onclose = () => setThinking(false)
  }

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const clearChat = () => { wsRef.current?.close(); setMessages([]); setError(''); setThinking(false); inputRef.current?.focus() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-h) - 48px)' }}>

      {/* ── Header ── */}
      <div className="card" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', borderBottom: 'none', padding: '12px 16px' }}>
        <div className="row-between">
          <div className="row gap-10">
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>AI Network Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Powered by OpenAI · network & security focused</div>
            </div>
          </div>
          <div className="row gap-8">
            {messages.length > 0 && <button className="btn btn-xs" onClick={clearChat}>Clear</button>}
            <button
              className={`btn btn-xs ${apiKey ? 'badge-green' : ''}`}
              style={{ borderColor: apiKey ? 'var(--green)' : 'var(--yellow)', color: apiKey ? 'var(--green)' : 'var(--yellow)' }}
              onClick={() => { setShowKey(v => !v); setKeyDraft('') }}
            >
              🔑 {apiKey ? 'Key set' : 'Set API key'}
            </button>
          </div>
        </div>

        {/* ── Key input panel ── */}
        {showKeyInput && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
              Paste your OpenAI API key — stored only in your browser (localStorage), never sent to any server except OpenAI.
            </div>
            <div className="row gap-8">
              <input
                className="input"
                type="password"
                placeholder="sk-proj-..."
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={saveKey} disabled={!keyDraft.trim()}>Save</button>
              {apiKey && <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={removeKey}>Remove</button>}
            </div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderBottom: 'none' }}>
        {messages.length === 0 ? (
          <div className="col gap-16" style={{ alignItems: 'center', paddingTop: 32 }}>
            <div style={{ fontSize: 40 }}>🤖</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Ask me anything</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Network scanning, nmap flags, port analysis, security concepts</div>
            </div>
            {!apiKey && (
              <div style={{ padding: '10px 16px', background: 'var(--yellow-dim)', border: '1px solid var(--yellow)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--yellow)', textAlign: 'center' }}>
                ⚠️ Set your OpenAI API key using the <strong>🔑 Set API key</strong> button above to start chatting.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, width: '100%', maxWidth: 640, marginTop: 4 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{ padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-2)', fontSize: 12, textAlign: 'left', cursor: 'pointer', lineHeight: 1.4, transition: 'border-color .15s, color .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
            {thinking && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="row gap-8" style={{ paddingLeft: 38 }}><span className="spinner" /><span style={{ fontSize: 12, color: 'var(--text-3)' }}>Thinking…</span></div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: '10px 20px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderTop: 'none', color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
        <textarea ref={inputRef} className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Ask about nmap, ports, network scanning… (Enter to send, Shift+Enter for newline)"
          disabled={thinking} rows={1}
          style={{ resize: 'none', minHeight: 40, maxHeight: 120, lineHeight: 1.5, paddingTop: 9, paddingBottom: 9, overflow: 'auto' }}
        />
        <button className="btn btn-primary" onClick={() => send()} disabled={thinking || !input.trim()} style={{ alignSelf: 'flex-end', flexShrink: 0, minHeight: 40 }}>
          {thinking ? <span className="spinner" /> : '↑ Send'}
        </button>
      </div>

    </div>
  )
}
