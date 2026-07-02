# IJAZ Tools

A unified network operations console — all tools in one place.

## Tools included

| Tool | Description |
|---|---|
| **Network Monitor** | Live device discovery, traffic health, bandwidth, port count. Deep-scan any device with nmap. |
| **Nmap Studio** | Streaming nmap scans with a full preset library. WebSocket output, port enrichment. |
| **IP Scanner** | Fast ping sweep across any subnet. Real-time progress and live host list. |
| **Training Scripts** | 7 Python network tools (PyNmap, Port Scanner, Service Detector, Packet Sniffer, MAC Lookup, Network Scanner, Net Toolkit) with an in-browser runner. |

## Stack

- **Backend** — Python FastAPI + Uvicorn, port `8000`
- **Frontend** — React 18 + Vite 5, port `5173`
- **Communication** — REST + native WebSockets (no Socket.IO, no Node.js middleman)

## Quick start

```
1. Double-click install.bat   (first time only)
2. Double-click start.bat
3. Open http://localhost:5173
```

## Manual start

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## API

Interactive docs at `http://localhost:8000/docs` (FastAPI auto-generated).

| Endpoint | Description |
|---|---|
| `GET /api/status` | Health check |
| `GET /api/myip` | Local machine IP |
| `GET /api/network/devices?mode=wifi` | ARP device list |
| `GET /api/network/stats?mode=wifi` | Live network stats |
| `GET /api/network/scan/{ip}` | Deep scan a device |
| `GET /api/network/scan-host` | Scan host's own ports |
| `POST /api/training/run` | Run a training script |
| `WS /ws/network` | Live network feed |
| `WS /ws/scan` | Streaming nmap output |
| `WS /ws/ipscan` | Ping sweep progress |

## Project structure

```
ijaz-tools/
├── backend/
│   ├── main.py          ← FastAPI app (all routes + WebSockets)
│   ├── requirements.txt
│   └── scripts/         ← Python training scripts
│       ├── pynmap.py
│       ├── network_scanner.py
│       ├── port_scanner.py
│       ├── service_detector.py
│       ├── packet_sniffer.py
│       ├── maclookup.py
│       ├── net_toolkit.py
│       └── ipconnectedscanner.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx           ← Shell (sidebar + topbar + routing)
│   │   ├── index.css         ← All styles (design tokens + components)
│   │   ├── main.jsx
│   │   └── pages/
│   │       ├── NetworkPage.jsx
│   │       ├── NmapPage.jsx
│   │       ├── IpScanPage.jsx
│   │       └── TrainingPage.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js    ← Proxies /api and /ws to backend
├── install.bat
├── start.bat
└── README.md
```
