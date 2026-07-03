import { useState, useEffect, useRef } from 'react'
import './css/hud-overlay.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeatherData {
  temp_C: string
  temp_F: string
  weatherDesc: string
  humidity: string
  windspeedKmph: string
  pressure: string
  visibility: string
  location: string
  country: string
  sunrise: string
  sunset: string
  feelsLikeC: string
}

interface SystemMetrics {
  cpu: number
  ram: number
  gpu: number
  hddRead: number
  hddWrite: number
  netUp: number
  netDown: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(kb: number): string {
  if (kb < 1024) return `${kb.toFixed(1)} KB/s`
  return `${(kb / 1024).toFixed(2)} MB/s`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Smooth random walk between min/max
function smoothRandom(prev: number, min: number, max: number, step: number) {
  const delta = (Math.random() - 0.5) * step * 2
  return Math.min(max, Math.max(min, prev + delta))
}

// Simple sparkline data
function makeSparkline(len = 20, min = 10, max = 90): number[] {
  const arr: number[] = []
  let v = Math.random() * (max - min) + min
  for (let i = 0; i < len; i++) {
    v = smoothRandom(v, min, max, 12)
    arr.push(v)
  }
  return arr
}

// ─── Sparkline SVG ───────────────────────────────────────────────────────────

function Sparkline({ data, color = '#00d4ff', height = 28 }: { data: number[]; color?: string; height?: number }) {
  const w = 80
  const h = height
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  )
}

// ─── Bar Meter ───────────────────────────────────────────────────────────────

function HUDBar({ value, label, color = '#00d4ff' }: { value: number; label: string; color?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="hud-bar-row">
      <span className="hud-bar-label">{label}</span>
      <div className="hud-bar-track">
        <div
          className="hud-bar-fill"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="hud-bar-val" style={{ color }}>{pct.toFixed(0)}%</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HUDOverlay({ hidden = false }: { hidden?: boolean }) {
  // ── Clock ──
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Uptime counter (seconds since mount) ──
  const startTime = useRef(Date.now())
  const [uptime, setUptime] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setUptime(Math.floor((Date.now() - startTime.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])
  const uptimeStr = `${pad(Math.floor(uptime / 3600))}:${pad(Math.floor((uptime % 3600) / 60))}:${pad(uptime % 60)}`

  // ── Weather ──
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherStatus, setWeatherStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    fetch('https://wttr.in/?format=j1', { signal: controller.signal })
      .then(r => r.json())
      .then((data: any) => {
        const cur = data.current_condition[0]
        const area = data.nearest_area[0]
        const today = data.weather[0]
        setWeather({
          temp_C: cur.temp_C,
          temp_F: cur.temp_F,
          weatherDesc: cur.weatherDesc[0].value,
          humidity: cur.humidity,
          windspeedKmph: cur.windspeedKmph,
          pressure: cur.pressure,
          visibility: cur.visibility,
          feelsLikeC: cur.FeelsLikeC,
          location: area.areaName[0].value,
          country: area.country[0].value,
          sunrise: today.astronomy[0].sunrise,
          sunset: today.astronomy[0].sunset,
        })
        setWeatherStatus('ok')
      })
      .catch(() => setWeatherStatus('error'))
    return () => controller.abort()
  }, [])

  // ── System Metrics (smooth animated) ──
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45, ram: 62, gpu: 38, hddRead: 3.2, hddWrite: 1.1, netUp: 120, netDown: 580,
  })
  const [cpuHistory, setCpuHistory] = useState<number[]>(makeSparkline(20, 20, 85))
  const [netHistory, setNetHistory] = useState<number[]>(makeSparkline(20, 5, 90))
  const [ramHistory, setRamHistory] = useState<number[]>(makeSparkline(20, 40, 80))

  // Seed RAM from navigator.deviceMemory if available
  const deviceRam: number = (navigator as any).deviceMemory ?? 0

  // Try performance.memory for live RAM %
  const getMemPercent = () => {
    const mem = (performance as any).memory
    if (mem) {
      return Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100)
    }
    return null
  }

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(prev => {
        const liveMem = getMemPercent()
        return {
          cpu: smoothRandom(prev.cpu, 15, 92, 8),
          ram: liveMem !== null ? liveMem : smoothRandom(prev.ram, 40, 85, 5),
          gpu: smoothRandom(prev.gpu, 10, 78, 10),
          hddRead: smoothRandom(prev.hddRead, 0, 9, 1.5),
          hddWrite: smoothRandom(prev.hddWrite, 0, 6, 1),
          netUp: smoothRandom(prev.netUp, 10, 500, 60),
          netDown: smoothRandom(prev.netDown, 50, 1200, 120),
        }
      })
      setCpuHistory(prev => [...prev.slice(1), smoothRandom(prev[prev.length - 1], 15, 92, 8)])
      setNetHistory(prev => [...prev.slice(1), smoothRandom(prev[prev.length - 1], 5, 90, 12)])
      setRamHistory(prev => [...prev.slice(1), smoothRandom(prev[prev.length - 1], 40, 80, 5)])
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Screen / System info ──
  const screenInfo = `${screen.width}×${screen.height}`
  const connection = (navigator as any).connection
  const netType = connection?.effectiveType ?? 'N/A'
  const netRtt = connection?.rtt ?? '–'

  // ── Time format ──
  const hh = now.getHours()
  const mm = now.getMinutes()
  const ss = now.getSeconds()
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const hh12 = hh % 12 || 12
  const timeStr = `${pad(hh12)}:${pad(mm)}:${pad(ss)}`
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  // ── CPU color ──
  const cpuColor = metrics.cpu > 80 ? '#ff3355' : metrics.cpu > 60 ? '#ffaa00' : '#00d4ff'
  const ramColor = metrics.ram > 80 ? '#ff3355' : metrics.ram > 60 ? '#ffaa00' : '#00ff88'

  if (hidden) return null

  return (
    <div className="hud-overlay" aria-hidden="true">

      {/* ══ TOP-LEFT: JARVIS Identity + Uptime ══ */}
      <div className="hud-panel hud-top-left">
        <div className="hud-panel-label">◈ JARVIS OS</div>
        <div className="hud-identity-row">
          <span className="hud-version">Ver 2.5</span>
          <span className="hud-status-dot" />
          <span className="hud-status-text">ONLINE</span>
        </div>
        <div className="hud-row"><span className="hud-key">SCREEN</span><span className="hud-val">{screenInfo}</span></div>
        <div className="hud-row"><span className="hud-key">NET TYPE</span><span className="hud-val">{netType.toUpperCase()}</span></div>
        <div className="hud-row"><span className="hud-key">LATENCY</span><span className="hud-val">{netRtt} ms</span></div>
        <div className="hud-row"><span className="hud-key">UPTIME</span><span className="hud-val uptime">{uptimeStr}</span></div>
        {deviceRam > 0 && (
          <div className="hud-row"><span className="hud-key">DEVICE RAM</span><span className="hud-val">{deviceRam} GB</span></div>
        )}
      </div>

      {/* ══ TOP-RIGHT: Clock + Date ══ */}
      <div className="hud-panel hud-top-right">
        <div className="hud-panel-label">◈ SYSTEM CLOCK</div>
        <div className="hud-clock">
          <span className="hud-clock-time">{timeStr}</span>
          <span className="hud-clock-ampm">{ampm}</span>
        </div>
        <div className="hud-clock-date">{dateStr}</div>
        <div className="hud-tz">
          {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </div>
      </div>

      {/* ══ LEFT: CPU + RAM Metrics ══ */}
      <div className="hud-panel hud-left-metrics">
        <div className="hud-panel-label">◈ CENTRAL PROCESSING UNIT</div>
        <HUDBar value={metrics.cpu} label="CPU" color={cpuColor} />
        <div className="hud-sparkline-row">
          <Sparkline data={cpuHistory} color={cpuColor} />
        </div>
        <div className="hud-divider" />
        <div className="hud-panel-label">◈ RANDOM ACCESS MEMORY</div>
        <HUDBar value={metrics.ram} label="RAM" color={ramColor} />
        <div className="hud-sparkline-row">
          <Sparkline data={ramHistory} color={ramColor} />
        </div>
        <div className="hud-divider" />
        <div className="hud-panel-label">◈ GPU</div>
        <HUDBar value={metrics.gpu} label="GPU" color="#a78bfa" />
      </div>

      {/* ══ RIGHT: Weather Panel ══ */}
      <div className="hud-panel hud-right-weather">
        <div className="hud-panel-label">◈ ATMOSPHERIC DATA</div>
        {weatherStatus === 'loading' && (
          <div className="hud-loading">
            <span className="hud-blink">FETCHING DATA</span>
          </div>
        )}
        {weatherStatus === 'error' && (
          <div className="hud-error">⚠ SIGNAL LOST</div>
        )}
        {weatherStatus === 'ok' && weather && (
          <>
            <div className="hud-location">
              {weather.location}, {weather.country}
            </div>
            <div className="hud-temp-row">
              <span className="hud-temp-big">{weather.temp_C}°C</span>
              <span className="hud-temp-sub">{weather.temp_F}°F</span>
            </div>
            <div className="hud-weather-desc">{weather.weatherDesc.toUpperCase()}</div>
            <div className="hud-divider" />
            <div className="hud-row"><span className="hud-key">FEELS LIKE</span><span className="hud-val">{weather.feelsLikeC}°C</span></div>
            <div className="hud-row"><span className="hud-key">HUMIDITY</span><span className="hud-val">{weather.humidity}%</span></div>
            <div className="hud-row"><span className="hud-key">WIND</span><span className="hud-val">{weather.windspeedKmph} km/h</span></div>
            <div className="hud-row"><span className="hud-key">PRESSURE</span><span className="hud-val">{weather.pressure} mb</span></div>
            <div className="hud-row"><span className="hud-key">VISIBILITY</span><span className="hud-val">{weather.visibility} km</span></div>
            <div className="hud-divider" />
            <div className="hud-row"><span className="hud-key">SUNRISE</span><span className="hud-val sunrise">{weather.sunrise}</span></div>
            <div className="hud-row"><span className="hud-key">SUNSET</span><span className="hud-val sunset">{weather.sunset}</span></div>
          </>
        )}
      </div>

      {/* ══ BOTTOM-LEFT: Network Traffic ══ */}
      <div className="hud-panel hud-bottom-left">
        <div className="hud-panel-label">◈ NETWORK TRAFFIC</div>
        <div className="hud-net-grid">
          <div className="hud-net-col">
            <span className="hud-net-dir">▲ UP</span>
            <span className="hud-net-val up">{formatBytes(metrics.netUp)}</span>
          </div>
          <div className="hud-net-col">
            <span className="hud-net-dir">▼ DOWN</span>
            <span className="hud-net-val down">{formatBytes(metrics.netDown)}</span>
          </div>
        </div>
        <div className="hud-sparkline-row">
          <Sparkline data={netHistory} color="#00ff88" height={22} />
        </div>
      </div>

      {/* ══ BOTTOM-RIGHT: Storage Activity ══ */}
      <div className="hud-panel hud-bottom-right">
        <div className="hud-panel-label">◈ DISK I/O</div>
        <div className="hud-row"><span className="hud-key">READ</span><span className="hud-val">{metrics.hddRead.toFixed(1)} MB/s</span></div>
        <div className="hud-row"><span className="hud-key">WRITE</span><span className="hud-val">{metrics.hddWrite.toFixed(1)} MB/s</span></div>
        <HUDBar value={(metrics.hddRead / 10) * 100} label="R" color="#00d4ff" />
        <HUDBar value={(metrics.hddWrite / 6) * 100} label="W" color="#ffd700" />
      </div>

    </div>
  )
}
