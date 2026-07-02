"""
IP Changer — Backend
FastAPI server for changing, releasing, renewing, and monitoring IP configuration on Windows.
Also provides proxy rotation and Tor circuit switching for public IP masking.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import re
import socket
import subprocess
import platform
from concurrent.futures import ThreadPoolExecutor
from proxy_engine import proxy_rotator, tor_controller

app = FastAPI(title="IP Changer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=10)

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def run_cmd(cmd: str, timeout: int = 15) -> str:
    """Run a shell command and return combined stdout+stderr."""
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True,
        timeout=timeout, errors="replace"
    )
    return result.stdout + result.stderr


def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def parse_ipconfig() -> list[dict]:
    """Parse ipconfig /all output into a list of adapter dicts."""
    out = run_cmd("ipconfig /all", timeout=10)
    adapters = []
    current = None

    for raw in out.splitlines():
        # New adapter block
        if raw and not raw[0].isspace() and raw.strip().endswith(":"):
            if current:
                adapters.append(current)
            current = {
                "name": raw.strip().rstrip(":"),
                "description": "",
                "mac": "",
                "dhcp": False,
                "ip": "",
                "subnet": "",
                "gateway": "",
                "dns": [],
                "status": "unknown",
            }
            continue

        if current is None:
            continue

        line = raw.strip()

        if "Description" in line:
            current["description"] = line.split(":", 1)[-1].strip()
        elif "Physical Address" in line:
            current["mac"] = line.split(":", 1)[-1].strip()
        elif "DHCP Enabled" in line:
            current["dhcp"] = "Yes" in line
        elif "IPv4 Address" in line:
            ip = line.split(":", 1)[-1].strip().rstrip("(Preferred)").strip()
            current["ip"] = ip
            current["status"] = "connected" if ip else "disconnected"
        elif "Subnet Mask" in line:
            current["subnet"] = line.split(":", 1)[-1].strip()
        elif "Default Gateway" in line:
            gw = line.split(":", 1)[-1].strip()
            if gw:
                current["gateway"] = gw
        elif "DNS Servers" in line:
            dns = line.split(":", 1)[-1].strip()
            if dns:
                current["dns"].append(dns)
        elif current.get("dns") and raw.startswith("   ") and re.match(r"^\d{1,3}\.\d{1,3}", line):
            current["dns"].append(line)

    if current:
        adapters.append(current)

    # Filter out loopback and empty adapters
    return [a for a in adapters if a["name"] and "Loopback" not in a["name"]]


def get_adapter_names() -> list[str]:
    """Return list of network adapter names from netsh."""
    out = run_cmd("netsh interface show interface", timeout=10)
    names = []
    for line in out.splitlines():
        parts = line.split()
        if len(parts) >= 4 and parts[0] in ("Enabled", "Disabled"):
            name = " ".join(parts[3:])
            names.append(name)
    return names


# ─────────────────────────────────────────────
# REST Endpoints
# ─────────────────────────────────────────────

@app.get("/api/status")
def status():
    return {"status": "online", "version": "1.0.0"}


@app.get("/api/myip")
def my_ip():
    return {"ip": get_local_ip()}


@app.get("/api/adapters")
def list_adapters():
    """Return all network adapters with their current config."""
    return parse_ipconfig()


@app.get("/api/adapters/names")
def adapter_names():
    """Return just the adapter names for dropdowns."""
    return {"adapters": get_adapter_names()}


@app.get("/api/public-ip")
async def public_ip():
    """Fetch the machine's public/external IP."""
    loop = asyncio.get_running_loop()
    def _fetch():
        try:
            import urllib.request
            with urllib.request.urlopen("https://api.ipify.org?format=json", timeout=5) as r:
                return json.loads(r.read().decode())
        except Exception:
            return {"ip": "unavailable"}
    result = await loop.run_in_executor(executor, _fetch)
    return result


@app.post("/api/set-static")
async def set_static(body: dict):
    """
    Set a static IP on an adapter.
    Body: { adapter, ip, subnet, gateway, dns1, dns2 }
    """
    adapter = body.get("adapter", "").strip()
    ip      = body.get("ip", "").strip()
    subnet  = body.get("subnet", "255.255.255.0").strip()
    gateway = body.get("gateway", "").strip()
    dns1    = body.get("dns1", "8.8.8.8").strip()
    dns2    = body.get("dns2", "8.8.4.4").strip()

    if not adapter or not ip:
        return JSONResponse({"error": "adapter and ip are required"}, status_code=400)

    # Validate IP format
    ip_re = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")
    for val, name in [(ip, "IP"), (subnet, "Subnet"), (gateway, "Gateway")]:
        if val and not ip_re.match(val):
            return JSONResponse({"error": f"Invalid {name} address: {val}"}, status_code=400)

    loop = asyncio.get_running_loop()

    def _apply():
        lines = []
        # Set IP + subnet + gateway
        cmd = f'netsh interface ip set address name="{adapter}" static {ip} {subnet}'
        if gateway:
            cmd += f" {gateway} 1"
        lines.append(f"$ {cmd}")
        lines.append(run_cmd(cmd))

        # Set DNS
        if dns1:
            c = f'netsh interface ip set dns name="{adapter}" static {dns1}'
            lines.append(f"$ {c}")
            lines.append(run_cmd(c))
        if dns2:
            c = f'netsh interface ip add dns name="{adapter}" {dns2} index=2'
            lines.append(f"$ {c}")
            lines.append(run_cmd(c))

        return "\n".join(lines)

    output = await loop.run_in_executor(executor, _apply)
    return {"output": output, "adapter": adapter, "ip": ip}


@app.post("/api/set-dhcp")
async def set_dhcp(body: dict):
    """Switch an adapter back to DHCP."""
    adapter = body.get("adapter", "").strip()
    if not adapter:
        return JSONResponse({"error": "adapter is required"}, status_code=400)

    loop = asyncio.get_running_loop()

    def _apply():
        lines = []
        c1 = f'netsh interface ip set address name="{adapter}" dhcp'
        c2 = f'netsh interface ip set dns name="{adapter}" dhcp'
        for c in [c1, c2]:
            lines.append(f"$ {c}")
            lines.append(run_cmd(c))
        return "\n".join(lines)

    output = await loop.run_in_executor(executor, _apply)
    return {"output": output, "adapter": adapter}


@app.post("/api/release-renew")
async def release_renew(body: dict):
    """Release and renew DHCP lease."""
    adapter = body.get("adapter", "").strip()
    loop = asyncio.get_running_loop()

    def _apply():
        lines = []
        suffix = f' "{adapter}"' if adapter else ""
        for cmd in [f"ipconfig /release{suffix}", f"ipconfig /renew{suffix}"]:
            lines.append(f"$ {cmd}")
            lines.append(run_cmd(cmd, timeout=30))
        return "\n".join(lines)

    output = await loop.run_in_executor(executor, _apply)
    return {"output": output}


@app.post("/api/flush-dns")
async def flush_dns():
    """Flush the DNS resolver cache."""
    loop = asyncio.get_running_loop()
    output = await loop.run_in_executor(executor, lambda: run_cmd("ipconfig /flushdns"))
    return {"output": output}


@app.post("/api/ping")
async def ping_host(body: dict):
    """Ping a host and return results."""
    host = body.get("host", "8.8.8.8").strip()
    count = min(int(body.get("count", 4)), 10)

    if not re.match(r"^[a-zA-Z0-9.\-_]+$", host):
        return JSONResponse({"error": "Invalid host"}, status_code=400)

    loop = asyncio.get_running_loop()
    output = await loop.run_in_executor(
        executor,
        lambda: run_cmd(f"ping -n {count} {host}", timeout=30)
    )
    return {"output": output, "host": host}


# ─────────────────────────────────────────────
# WebSocket — live adapter monitor
# ─────────────────────────────────────────────

@app.websocket("/ws/monitor")
async def ws_monitor(websocket: WebSocket):
    """Push adapter info every 3 seconds."""
    await websocket.accept()
    try:
        while True:
            loop = asyncio.get_running_loop()
            adapters = await loop.run_in_executor(executor, parse_ipconfig)
            local_ip = await loop.run_in_executor(executor, get_local_ip)
            await websocket.send_text(json.dumps({
                "type": "update",
                "adapters": adapters,
                "local_ip": local_ip,
            }))
            await asyncio.sleep(3)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


# ─────────────────────────────────────────────
# WebSocket — streaming command output
# ─────────────────────────────────────────────

@app.websocket("/ws/run")
async def ws_run(websocket: WebSocket):
    """
    Stream a command's output line-by-line.
    Client sends: { "action": "set-static"|"set-dhcp"|"release-renew"|"flush-dns"|"ping", ...params }
    Server sends: { "type": "output"|"done"|"error", "data": "..." }
    """
    await websocket.accept()
    proc = None
    try:
        raw    = await websocket.receive_text()
        params = json.loads(raw)
        action = params.get("action", "").strip()

        # Build command list based on action
        cmds = []

        if action == "set-static":
            adapter = params.get("adapter", "")
            ip      = params.get("ip", "")
            subnet  = params.get("subnet", "255.255.255.0")
            gateway = params.get("gateway", "")
            dns1    = params.get("dns1", "8.8.8.8")
            dns2    = params.get("dns2", "8.8.4.4")

            if not adapter or not ip:
                await websocket.send_text(json.dumps({"type": "error", "data": "adapter and ip required"}))
                return

            cmd = f'netsh interface ip set address name="{adapter}" static {ip} {subnet}'
            if gateway:
                cmd += f" {gateway} 1"
            cmds.append(cmd)
            if dns1:
                cmds.append(f'netsh interface ip set dns name="{adapter}" static {dns1}')
            if dns2:
                cmds.append(f'netsh interface ip add dns name="{adapter}" {dns2} index=2')

        elif action == "set-dhcp":
            adapter = params.get("adapter", "")
            if not adapter:
                await websocket.send_text(json.dumps({"type": "error", "data": "adapter required"}))
                return
            cmds = [
                f'netsh interface ip set address name="{adapter}" dhcp',
                f'netsh interface ip set dns name="{adapter}" dhcp',
            ]

        elif action == "release-renew":
            adapter = params.get("adapter", "")
            suffix = f' "{adapter}"' if adapter else ""
            cmds = [f"ipconfig /release{suffix}", f"ipconfig /renew{suffix}"]

        elif action == "flush-dns":
            cmds = ["ipconfig /flushdns"]

        elif action == "ping":
            host  = params.get("host", "8.8.8.8")
            count = min(int(params.get("count", 4)), 10)
            cmds  = [f"ping -n {count} {host}"]

        else:
            await websocket.send_text(json.dumps({"type": "error", "data": f"Unknown action: {action}"}))
            return

        loop = asyncio.get_running_loop()

        for cmd in cmds:
            await websocket.send_text(json.dumps({"type": "output", "data": f"\n$ {cmd}\n"}))

            proc = subprocess.Popen(
                cmd, shell=True,
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, bufsize=1, errors="replace"
            )

            while True:
                try:
                    line = await asyncio.wait_for(
                        loop.run_in_executor(executor, proc.stdout.readline),
                        timeout=2.0,
                    )
                except asyncio.TimeoutError:
                    await websocket.send_text(json.dumps({"type": "heartbeat"}))
                    if proc.poll() is not None:
                        break
                    continue

                if not line:
                    break
                await websocket.send_text(json.dumps({"type": "output", "data": line}))

            proc.wait()

        await websocket.send_text(json.dumps({"type": "done", "data": "\n[Done]"}))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"type": "error", "data": str(e)}))
        except Exception:
            pass
    finally:
        if proc and proc.poll() is None:
            proc.kill()
        try:
            await websocket.close()
        except Exception:
            pass


# ─────────────────────────────────────────────
# Proxy Rotator — REST + WebSocket
# ─────────────────────────────────────────────

@app.get("/api/proxy/state")
def proxy_state():
    return proxy_rotator.state()


@app.post("/api/proxy/refresh")
async def proxy_refresh():
    """Fetch and test a fresh proxy list (runs in background)."""
    loop = asyncio.get_running_loop()
    asyncio.ensure_future(proxy_rotator.refresh_proxies(loop))
    return {"ok": True, "msg": "Proxy refresh started"}


@app.post("/api/proxy/start")
async def proxy_start(body: dict):
    interval     = int(body.get("interval", 10))
    system_proxy = bool(body.get("system_proxy", True))
    loop = asyncio.get_running_loop()
    await proxy_rotator.start(loop, interval, system_proxy)
    return {"ok": True}


@app.post("/api/proxy/stop")
async def proxy_stop():
    await proxy_rotator.stop()
    return {"ok": True}


@app.post("/api/proxy/rotate-now")
async def proxy_rotate_now():
    """Manually trigger one rotation."""
    loop = asyncio.get_running_loop()
    asyncio.ensure_future(proxy_rotator.rotate(loop))
    return {"ok": True}


@app.post("/api/proxy/clear-system")
async def proxy_clear_system():
    """Immediately remove system-wide proxy and restore direct connection."""
    from proxy_engine import clear_system_proxy
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, clear_system_proxy)
    return {"ok": True, "msg": "System proxy cleared"}


@app.websocket("/ws/proxy")
async def ws_proxy(websocket: WebSocket):
    """Push proxy rotator state every second."""
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps({
                "type": "state",
                **proxy_rotator.state(),
            }))
            await asyncio.sleep(1)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


# ─────────────────────────────────────────────
# Tor Controller — REST + WebSocket
# ─────────────────────────────────────────────

@app.get("/api/tor/state")
def tor_state():
    return tor_controller.state()


@app.post("/api/tor/start")
async def tor_start(body: dict):
    interval = int(body.get("interval", 10))
    loop = asyncio.get_running_loop()
    await tor_controller.start(loop, interval)
    return {"ok": True}


@app.post("/api/tor/stop")
async def tor_stop():
    await tor_controller.stop()
    return {"ok": True}


@app.post("/api/tor/new-circuit")
async def tor_new_circuit():
    """Manually request a new Tor circuit."""
    loop = asyncio.get_running_loop()
    ok = await loop.run_in_executor(None, tor_controller.new_circuit)
    return {"ok": ok}


@app.websocket("/ws/tor")
async def ws_tor(websocket: WebSocket):
    """Push Tor state every second."""
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(json.dumps({
                "type": "state",
                **tor_controller.state(),
            }))
            await asyncio.sleep(1)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
