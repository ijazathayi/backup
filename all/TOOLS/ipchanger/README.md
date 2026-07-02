# IP Changer

A local network configuration + IP masking tool for Windows.

## Features

| Page | Description |
|------|-------------|
| Dashboard | Live view of all network adapters — IP, subnet, gateway, DNS, DHCP/Static |
| **IP Rotator** | Rotate your visible public IP via free proxies or Tor — auto-rotates every N seconds |
| Set Static IP | Assign a fixed IP with subnet, gateway, and DNS presets |
| DHCP / Renew | Switch to DHCP, release & renew leases, flush DNS cache |
| Ping Test | Test connectivity and latency with live stats |

## IP Rotator — How it works

### Free Proxy Mode
- Fetches thousands of free HTTP/SOCKS5 proxies from public sources
- Tests each one for speed and availability
- Rotates to a new working proxy every N seconds (configurable: 5–60s)
- Shows the visible IP that websites see at each rotation
- Point your browser's proxy setting to the active proxy address

### Tor Mode
- Requests a new Tor circuit (new exit node) every N seconds
- Each circuit gives a different exit IP from anywhere in the world
- Requires Tor installed with ControlPort enabled (see below)
- Point your browser SOCKS5 proxy to `127.0.0.1:9050`

## Stack

- **Backend**: Python + FastAPI (port 8001)
- **Frontend**: React + Vite (port 5174)

## Setup

### Requirements
- Python 3.9+
- Node.js 18+
- Run as **Administrator** for IP/netsh changes

### Install
```
install.bat
```

### Start
```
start.bat
```

Open: http://localhost:5174

## Tor Setup (optional)

1. Download Tor Expert Bundle from https://www.torproject.org/download/
2. Add `tor.exe` to your system PATH
3. Create/edit `torrc`:
   ```
   SocksPort 9050
   ControlPort 9051
   HashedControlPassword [run: tor --hash-password ijaztools]
   ```
4. Start Tor: `tor -f torrc`
5. Restart the backend — Tor mode will show as Available

## Notes

- Free proxies are public and unreliable — they rotate frequently
- For serious anonymity, Tor is more reliable
- The backend runs on port **8001** to avoid conflicts with other tools
