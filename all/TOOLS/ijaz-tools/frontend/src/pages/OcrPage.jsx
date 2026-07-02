import { useState, useRef, useEffect } from 'react'

export default function OcrPage() {
  const [file, setFile]         = useState(null)
  const [dragging, setDragging] = useState(false)
  const [language, setLanguage] = useState('eng')
  const [deskew, setDeskew]     = useState(false)
  const [status, setStatus]     = useState(null)   // {ready, missing}
  const [processing, setProc]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    fetch('/api/ocr/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ ready: false, missing: ['backend offline'] }))
  }, [])

  const pickFile = f => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Only PDF files are supported'); return }
    setFile(f)
    setError('')
    setDone(false)
  }

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files[0])
  }

  const convert = async () => {
    if (!file) return
    setProc(true)
    setError('')
    setDone(false)

    const form = new FormData()
    form.append('file', file)
    form.append('language', language)
    form.append('deskew', deskew)

    try {
      const r = await fetch('/api/ocr/convert', { method: 'POST', body: form })

      if (!r.ok) {
        const d = await r.json()
        setError(d.error || 'Conversion failed')
        return
      }

      // Trigger browser download
      const blob = await r.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const cd   = r.headers.get('content-disposition') || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      a.download = match ? match[1] : file.name.replace('.pdf', '_ocr.docx')
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch (e) {
      setError(`Request failed: ${e.message}`)
    } finally {
      setProc(false)
    }
  }

  const LANGS = [
    ['eng', 'English'], ['ara', 'Arabic'], ['fra', 'French'],
    ['deu', 'German'], ['spa', 'Spanish'], ['ita', 'Italian'],
    ['por', 'Portuguese'], ['rus', 'Russian'], ['chi_sim', 'Chinese (Simplified)'],
    ['jpn', 'Japanese'], ['kor', 'Korean'],
  ]

  return (
    <div className="col gap-16">

      {/* ── Dep warning ── */}
      {status && !status.ready && (
        <div style={{ padding: '12px 16px', background: 'var(--yellow-dim)', border: '1px solid var(--yellow)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--yellow)' }}>
          <strong>⚠️ Missing packages:</strong> {status.missing.join(', ')}
          <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 12, background: 'rgba(0,0,0,.2)', padding: '6px 10px', borderRadius: 4 }}>
            pip install ocrmypdf python-docx pdfminer.six
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

        {/* ── Drop zone ── */}
        <div className="card col gap-16">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="card-title">PDF to Word Converter</div>
              <div className="card-sub">Upload a scanned or text PDF — get a .docx back</div>
            </div>
            {status && (
              <span className={`badge ${status.ready ? 'badge-green' : 'badge-yellow'}`}>
                {status.ready ? '● Ready' : '○ Setup needed'}
              </span>
            )}
          </div>

          {/* Drop area */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              background: dragging ? 'var(--accent-dim)' : file ? 'var(--green-dim)' : 'var(--surface-2)',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color .2s, background .2s',
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => pickFile(e.target.files[0])} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>{file ? '📄' : '📂'}</div>
            {file ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                  {(file.size / 1024).toFixed(1)} KB · click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Drop a PDF here</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>or click to browse</div>
              </>
            )}
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}

          {done && (
            <div style={{ padding: '10px 14px', background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', color: 'var(--green)', fontSize: 13 }}>
              ✅ Done — your .docx file was downloaded automatically.
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={convert}
            disabled={!file || processing || (status && !status.ready)}
            style={{ alignSelf: 'flex-start' }}
          >
            {processing
              ? <><span className="spinner" /> Converting…</>
              : '⚡ Convert to Word'}
          </button>

          {processing && (
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Running OCR… this may take a minute for large or scanned PDFs.
            </div>
          )}
        </div>

        {/* ── Options ── */}
        <div className="card col gap-12">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="card-title">Options</div>
          </div>

          <div className="field">
            <label className="field-label">OCR Language</label>
            <select className="select" value={language} onChange={e => setLanguage(e.target.value)} disabled={processing}>
              {LANGS.map(([code, name]) => (
                <option key={code} value={code}>{name} ({code})</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>
            <input type="checkbox" checked={deskew} onChange={e => setDeskew(e.target.checked)} disabled={processing} />
            Deskew pages (straighten scanned images)
          </label>

          <div className="divider" />

          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-2)' }}>How it works</strong>
            <ol style={{ paddingLeft: 16, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>PDF is uploaded to the local backend</li>
              <li>OCRmyPDF adds a text layer using Tesseract</li>
              <li>pdfminer extracts the text</li>
              <li>python-docx builds a .docx file</li>
              <li>File downloads automatically</li>
            </ol>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-2)' }}>Requirements</strong>
            <div style={{ fontFamily: 'monospace', fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', marginTop: 6 }}>
              pip install ocrmypdf python-docx pdfminer.six
            </div>
            <div style={{ marginTop: 6 }}>Also needs <strong>Tesseract OCR</strong> installed on your system.</div>
          </div>
        </div>

      </div>
    </div>
  )
}
