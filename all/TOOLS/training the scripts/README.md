# PyNmap 🐍 - Python Educational Network Mapper

PyNmap is a lightweight, educational command-line tool written in Python. It is designed to replicate the basic functionality of the popular security tool **Nmap**. It demonstrates how host discovery, port scanning, and banner grabbing (service version detection) work at a conceptual level using standard Python sockets.

## Prerequisites
- Python 3.x installed on your system.
- No third-party modules are required (it only uses standard Python libraries like `socket`, `argparse`, `subprocess`, and `concurrent.futures`).

## How It Works
1. **Host Discovery:** Pings the target IP address to verify if the machine is active on the network.
2. **Port Scanning:** Performs a multi-threaded TCP connect scan on standard networking ports to see which services are listening.
3. **Banner Grabbing:** Connects to open ports to extract the welcome message (banner) broadcasted by the service, identifying the software name and version.

---

## 🛠️ Usage Guide

You must run PyNmap from your command line / terminal. 

### Basic Syntax
```bash
python pynmap.py <target> [options]
```

### Options
| Flag | Description |
|---|---|
| `<target>` | **Required.** The IP address, domain name, or subnet you want to scan. |
| `-p`, `--ports` | **Optional.** A comma-separated list of specific ports to scan. If omitted, the tool scans the top 20 most common networking ports. |
| `-sV`, `--version` | **Optional.** Enables Service Version Detection (banner grabbing) on any open ports found. |

---

## 🚀 Examples

### 1. Basic Port Scan on a Single IP
Scan the default common ports on a single device on your network (e.g., `172.23.69.102`):
```bash
python pynmap.py 172.23.69.102
```

### 2. Service Version Detection
Scan the target and attempt to determine exactly what software versions are running on the open ports using the `-sV` flag:
```bash
python pynmap.py 172.23.69.102 -sV
```

### 3. Scan Specific Ports
Instead of the default list, scan only Port 80 (HTTP) and Port 443 (HTTPS) to see if the target is running a web server:
```bash
python pynmap.py 172.23.69.102 -p 80,443 -sV
```

### 4. Scan an Entire Subnet (Network Sweep)
Find all active devices on your local Wi-Fi or Hotspot network (e.g., if your IP is `172.23.69.214`, your subnet is likely `172.23.69.0/24`):
```bash
python pynmap.py 172.23.69.0/24
```
*(Note: Scanning an entire subnet takes significantly longer than a single IP).*

---

## ⚠️ Disclaimer
This script was created strictly for **educational purposes** to understand the underlying mechanics of network enumeration and security auditing. You should only use this tool to scan networks and devices that you own or have explicit permission to audit.
