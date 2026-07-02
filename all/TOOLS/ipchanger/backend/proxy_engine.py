"""
Proxy Engine — fetches, tests, and rotates free SOCKS5/HTTP proxies.
Also controls Tor for circuit-based IP rotation.

Speed tuning:
  - TEST_TIMEOUT   : seconds per proxy connection attempt (low = fast, more misses)
  - TEST_CONCURRENCY: how many proxies tested simultaneously
  - executor workers must be >= TEST_CONCURRENCY
"""

import asyncio
import json
import os
import random
import re
import socket
import subprocess
import threading
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, asdict
from typing import Optional

# ── Tuning knobs ──────────────────────────────────────────────
TEST_TIMEOUT     = 3      # seconds — tight timeout kills slow proxies fast
TEST_CONCURRENCY = 500    # simultaneous proxy tests
FETCH_TIMEOUT    = 10     # seconds to download each proxy list
# ─────────────────────────────────────────────────────────────

executor = ThreadPoolExecutor(max_workers=TEST_CONCURRENCY + 20)

# ─────────────────────────────────────────────
# Data model
# ─────────────────────────────────────────────

@dataclass
class Proxy:
    host: str
    port: int
    protocol: str = "http"   # http | socks5
    country: str  = ""
    latency_ms: int = 0
    alive: bool   = False
    last_checked: float = 0.0

    def address(self) -> str:
        return f"{self.host}:{self.port}"

    def url(self) -> str:
        return f"{self.protocol}://{self.host}:{self.port}"

    def to_dict(self) -> dict:
        return asdict(self)


# ─────────────────────────────────────────────
# Proxy sources  (plain-text  host:port lists)
# ─────────────────────────────────────────────

PROXY_SOURCES = [
    # HTTP proxies
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt",
    # SOCKS5 proxies
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
]

# IP-check URLs (return plain text or JSON with the caller's IP)
IP_CHECK_URLS = [
    "https://api.ipify.org",
    "https://icanhazip.com",
    "https://ifconfig.me/ip",
]

# ─────────────────────────────────────────────
# Proxy fetcher
# ─────────────────────────────────────────────

def fetch_proxy_list(url: str, protocol: str = "http") -> list[Proxy]:
    """Download a plain host:port proxy list and return Proxy objects."""
    proxies = []
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=FETCH_TIMEOUT) as r:
            text = r.read().decode("utf-8", errors="ignore")
        for line in text.splitlines():
            line = line.strip()
            m = re.match(r"^(\d{1,3}(?:\.\d{1,3}){3}):(\d{2,5})$", line)
            if m:
                proxies.append(Proxy(host=m.group(1), port=int(m.group(2)), protocol=protocol))
    except Exception:
        pass
    return proxies


def fetch_all_proxies() -> list[Proxy]:
    """Fetch from all sources concurrently."""
    results: list[Proxy] = []
    futures = []
    with ThreadPoolExecutor(max_workers=len(PROXY_SOURCES)) as pool:
        for i, url in enumerate(PROXY_SOURCES):
            proto = "socks5" if "socks5" in url or "socks" in url.lower() else "http"
            futures.append(pool.submit(fetch_proxy_list, url, proto))
        for f in futures:
            try:
                results.extend(f.result())
            except Exception:
                pass

    # Deduplicate by address
    seen = set()
    unique = []
    for p in results:
        key = p.address()
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique


# ─────────────────────────────────────────────
# Proxy tester
# ─────────────────────────────────────────────

def test_proxy(proxy: Proxy, timeout: int = TEST_TIMEOUT) -> bool:
    """
    Test a proxy by opening a raw TCP connection first (instant fail if port closed),
    then doing a quick HTTP fetch through it.
    Returns True and sets proxy.alive / proxy.latency_ms on success.
    """
    # Fast pre-check: can we even reach the port?
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((proxy.host, proxy.port))
        s.close()
    except Exception:
        proxy.alive = False
        return False

    # Full HTTP check through the proxy
    check_url = random.choice(IP_CHECK_URLS)
    opener = urllib.request.build_opener(
        urllib.request.ProxyHandler({
            "http":  proxy.url(),
            "https": proxy.url(),
        })
    )
    try:
        t0 = time.time()
        with opener.open(check_url, timeout=timeout) as r:
            ip_text = r.read(64).decode("utf-8", errors="ignore").strip()
        elapsed = int((time.time() - t0) * 1000)
        if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip_text):
            proxy.alive        = True
            proxy.latency_ms   = elapsed
            proxy.last_checked = time.time()
            return True
    except Exception:
        pass
    proxy.alive = False
    proxy.last_checked = time.time()
    return False


def get_ip_via_proxy(proxy: Proxy, timeout: int = 8) -> str:
    """Return the public IP seen when routing through this proxy."""
    check_url = random.choice(IP_CHECK_URLS)
    handler_cls = urllib.request.ProxyHandler({
        "http":  proxy.url(),
        "https": proxy.url(),
    })
    opener = urllib.request.build_opener(handler_cls)
    try:
        with opener.open(check_url, timeout=timeout) as r:
            ip_text = r.read().decode("utf-8", errors="ignore").strip()
        if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip_text):
            return ip_text
    except Exception:
        pass
    return ""


# ─────────────────────────────────────────────
# System-wide proxy (Windows registry + WinHTTP)
# ─────────────────────────────────────────────

import winreg

_INET_SETTINGS = (
    winreg.HKEY_CURRENT_USER,
    r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
)

def _set_registry_proxy(host_port: str):
    """Enable proxy in IE/Edge/Chrome/system via registry."""
    key = winreg.OpenKey(*_INET_SETTINGS, access=winreg.KEY_SET_VALUE)
    winreg.SetValueEx(key, "ProxyEnable",  0, winreg.REG_DWORD,  1)
    winreg.SetValueEx(key, "ProxyServer",  0, winreg.REG_SZ,     host_port)
    winreg.SetValueEx(key, "ProxyOverride",0, winreg.REG_SZ,     "localhost;127.*;10.*;172.16.*;192.168.*;<local>")
    winreg.CloseKey(key)

def _clear_registry_proxy():
    """Disable system proxy in registry."""
    try:
        key = winreg.OpenKey(*_INET_SETTINGS, access=winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, "ProxyEnable", 0, winreg.REG_DWORD, 0)
        winreg.SetValueEx(key, "ProxyServer",  0, winreg.REG_SZ,    "")
        winreg.CloseKey(key)
    except Exception:
        pass

def _notify_proxy_change():
    """Tell Windows to pick up the registry change immediately."""
    try:
        import ctypes
        INTERNET_OPTION_SETTINGS_CHANGED = 39
        INTERNET_OPTION_REFRESH          = 37
        wininet = ctypes.windll.wininet
        wininet.InternetSetOptionW(0, INTERNET_OPTION_SETTINGS_CHANGED, 0, 0)
        wininet.InternetSetOptionW(0, INTERNET_OPTION_REFRESH,          0, 0)
    except Exception:
        pass

def set_system_proxy(proxy: Proxy):
    """
    Apply proxy system-wide:
      1. Windows registry  → Chrome, Edge, IE, most apps
      2. netsh winhttp     → Windows Update, some CLI tools
    Requires the backend to run as Administrator for netsh.
    """
    addr = proxy.address()
    try:
        _set_registry_proxy(addr)
        _notify_proxy_change()
    except Exception:
        pass
    try:
        subprocess.run(
            f'netsh winhttp set proxy proxy-server="{addr}" bypass-list="localhost;127.*;10.*;172.16.*;192.168.*;<local>"',
            shell=True, capture_output=True, timeout=8
        )
    except Exception:
        pass

def clear_system_proxy():
    """Remove system-wide proxy and restore direct connection."""
    try:
        _clear_registry_proxy()
        _notify_proxy_change()
    except Exception:
        pass
    try:
        subprocess.run(
            "netsh winhttp reset proxy",
            shell=True, capture_output=True, timeout=8
        )
    except Exception:
        pass

def get_system_proxy_status() -> dict:
    """Read current system proxy state from registry."""
    try:
        key = winreg.OpenKey(*_INET_SETTINGS, access=winreg.KEY_READ)
        enabled, _ = winreg.QueryValueEx(key, "ProxyEnable")
        server = ""
        try:
            server, _ = winreg.QueryValueEx(key, "ProxyServer")
        except Exception:
            pass
        winreg.CloseKey(key)
        return {"enabled": bool(enabled), "server": server}
    except Exception:
        return {"enabled": False, "server": ""}


# ─────────────────────────────────────────────
# Proxy Rotator state
# ─────────────────────────────────────────────

class ProxyRotator:
    def __init__(self):
        self._lock          = threading.Lock()
        self._all: list[Proxy]   = []
        self._alive: list[Proxy] = []
        self._current: Optional[Proxy] = None
        self._current_ip: str = ""
        self._rotation_count: int = 0
        self._running: bool   = False
        self._interval: int   = 10
        self._task: Optional[asyncio.Task] = None
        self._log: list[dict] = []
        self._fetching: bool  = False
        self._testing: bool   = False
        self._fetch_progress: int = 0
        self._test_progress: int  = 0
        self._system_proxy: bool  = True   # apply system-wide by default

    # ── Public state snapshot ──────────────────

    def state(self) -> dict:
        sys_proxy = get_system_proxy_status()
        with self._lock:
            return {
                "running":          self._running,
                "interval":         self._interval,
                "total_proxies":    len(self._all),
                "alive_proxies":    len(self._alive),
                "current":          self._current.to_dict() if self._current else None,
                "current_ip":       self._current_ip,
                "rotation_count":   self._rotation_count,
                "fetching":         self._fetching,
                "testing":          self._testing,
                "fetch_progress":   self._fetch_progress,
                "test_progress":    self._test_progress,
                "system_proxy":     self._system_proxy,
                "sys_proxy_active": sys_proxy["enabled"],
                "sys_proxy_server": sys_proxy["server"],
                "log":              self._log[-50:],
            }

    # ── Fetch + test pipeline ──────────────────

    async def refresh_proxies(self, loop: asyncio.AbstractEventLoop):
        """
        Fetch fresh proxy list then test all of them concurrently.
        Uses a semaphore so TEST_CONCURRENCY tests run at once — results
        stream in as they complete instead of waiting for full batches.
        """
        with self._lock:
            self._fetching      = True
            self._fetch_progress = 0
            self._test_progress  = 0

        self._add_log("info", "Fetching proxy lists…")
        proxies = await loop.run_in_executor(executor, fetch_all_proxies)

        with self._lock:
            self._all      = proxies
            self._fetching = False
            self._testing  = True

        total = len(proxies)
        self._add_log("info", f"Fetched {total} proxies — testing {TEST_CONCURRENCY} at a time…")

        alive      = []
        done_count = 0
        sem        = asyncio.Semaphore(TEST_CONCURRENCY)
        lock       = asyncio.Lock()

        async def _test_one(p: Proxy):
            nonlocal done_count
            async with sem:
                ok = await loop.run_in_executor(executor, test_proxy, p)
            async with lock:
                done_count += 1
                if ok:
                    alive.append(p)
                pct = min(100, int(done_count / total * 100))
                with self._lock:
                    self._test_progress = pct
                # Log a progress update every 10 %
                if done_count % max(1, total // 10) == 0:
                    self._add_log(
                        "info",
                        f"Testing… {pct}% done — {len(alive)} working so far"
                    )

        await asyncio.gather(*[_test_one(p) for p in proxies])

        # Sort fastest first
        alive.sort(key=lambda p: p.latency_ms)

        with self._lock:
            self._alive         = alive
            self._testing       = False
            self._test_progress = 100

        self._add_log("success", f"Done — {len(alive)} working proxies out of {total}")

    # ── Rotation ───────────────────────────────

    def pick_next(self) -> Optional[Proxy]:
        with self._lock:
            if not self._alive:
                return None
            # Pick from top 20 fastest, randomly
            pool = self._alive[:20]
            return random.choice(pool)

    async def rotate(self, loop: asyncio.AbstractEventLoop):
        """Switch to the next proxy, verify the new IP, apply system-wide."""
        proxy = self.pick_next()
        if not proxy:
            self._add_log("error", "No alive proxies — run Refresh first")
            return

        ip = await loop.run_in_executor(executor, get_ip_via_proxy, proxy)
        if not ip:
            with self._lock:
                if proxy in self._alive:
                    self._alive.remove(proxy)
            self._add_log("warn", f"Proxy {proxy.address()} died — skipping")
            await self.rotate(loop)
            return

        with self._lock:
            self._current    = proxy
            self._current_ip = ip
            self._rotation_count += 1
            apply_sys = self._system_proxy

        # Apply system-wide proxy so ALL apps use it
        if apply_sys:
            await loop.run_in_executor(executor, set_system_proxy, proxy)
            self._add_log(
                "success",
                f"#{self._rotation_count} → {proxy.address()} ({proxy.protocol.upper()}) "
                f"| Visible IP: {ip} | {proxy.latency_ms}ms | ✓ System proxy set"
            )
        else:
            self._add_log(
                "success",
                f"#{self._rotation_count} → {proxy.address()} ({proxy.protocol.upper()}) "
                f"| Visible IP: {ip} | {proxy.latency_ms}ms"
            )

    async def _rotation_loop(self, loop: asyncio.AbstractEventLoop):
        """Background task: rotate on interval."""
        while self._running:
            await self.rotate(loop)
            # Wait interval, but check _running every second
            for _ in range(self._interval):
                if not self._running:
                    break
                await asyncio.sleep(1)

    async def start(self, loop: asyncio.AbstractEventLoop, interval: int = 10, system_proxy: bool = True):
        with self._lock:
            if self._running:
                return
            self._running      = True
            self._interval     = max(5, interval)
            self._system_proxy = system_proxy

        mode = "system-wide" if system_proxy else "app-only"
        self._add_log("info", f"Proxy rotator started — interval {self._interval}s — mode: {mode}")

        if not self._alive:
            await self.refresh_proxies(loop)

        self._task = asyncio.ensure_future(self._rotation_loop(loop))

    async def stop(self):
        with self._lock:
            self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        # Restore direct connection
        clear_system_proxy()
        self._add_log("info", "Proxy rotator stopped — system proxy cleared ✓")

    # ── Helpers ────────────────────────────────

    def _add_log(self, level: str, msg: str):
        entry = {"ts": time.strftime("%H:%M:%S"), "level": level, "msg": msg}
        with self._lock:
            self._log.append(entry)
            if len(self._log) > 200:
                self._log = self._log[-200:]


# ─────────────────────────────────────────────
# Tor controller
# ─────────────────────────────────────────────

TOR_SOCKS_PORT    = 9050
TOR_CONTROL_PORT  = 9051
TOR_CONTROL_PASS  = "ijaztools"   # plain-text password matching torrc

# tor.exe lives next to this file (or on PATH)
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_TOR_EXE     = os.path.join(_BACKEND_DIR, "tor.exe")
_TORRC       = os.path.join(_BACKEND_DIR, "torrc")

class TorController:
    def __init__(self):
        self._lock            = threading.Lock()
        self._running: bool   = False
        self._tor_proc        = None   # subprocess.Popen for tor.exe
        self._interval: int   = 10
        self._task            = None
        self._current_ip: str = ""
        self._rotation_count: int = 0
        self._log: list[dict] = []
        self._available: bool = False
        self._tor_ready: bool = False  # True once Tor has bootstrapped
        self._check_tor()

    def _check_tor(self):
        """Check if tor.exe exists next to this file or on PATH."""
        if os.path.isfile(_TOR_EXE):
            self._available = True
            return
        try:
            r = subprocess.run(["tor", "--version"], capture_output=True, timeout=5)
            self._available = r.returncode == 0
        except Exception:
            self._available = False

    def _tor_exe_path(self) -> str:
        return _TOR_EXE if os.path.isfile(_TOR_EXE) else "tor"

    def is_available(self) -> bool:
        return self._available

    def state(self) -> dict:
        with self._lock:
            return {
                "available":       self._available,
                "running":         self._running,
                "tor_ready":       self._tor_ready,
                "interval":        self._interval,
                "current_ip":      self._current_ip,
                "rotation_count":  self._rotation_count,
                "log":             self._log[-50:],
            }

    # ── Launch / stop tor.exe ──────────────────

    def _launch_tor(self) -> bool:
        """Start tor.exe as a subprocess. Returns True when bootstrapped."""
        torrc = _TORRC if os.path.isfile(_TORRC) else None
        cmd   = [self._tor_exe_path()]
        if torrc:
            cmd += ["-f", torrc]
        else:
            # Minimal inline config if no torrc
            cmd += [
                "--SocksPort",    str(TOR_SOCKS_PORT),
                "--ControlPort",  str(TOR_CONTROL_PORT),
                "--HashedControlPassword",
                "16:872860B76453A77D60CA2BB8C1A7042072093276A3D701AD684053EC4C",
                "--DataDirectory", os.path.join(_BACKEND_DIR, "tor_data"),
            ]

        try:
            self._tor_proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                errors="replace",
                cwd=_BACKEND_DIR,
            )
            self._add_log("info", f"Launching tor.exe (pid {self._tor_proc.pid})…")

            # Wait for bootstrap (up to 60s)
            deadline = time.time() + 60
            for line in self._tor_proc.stdout:
                line = line.strip()
                if "Bootstrapped 100%" in line or "Done" in line:
                    self._add_log("success", "Tor bootstrapped — ready")
                    with self._lock:
                        self._tor_ready = True
                    return True
                if "Bootstrapped" in line:
                    pct = re.search(r"Bootstrapped (\d+)%", line)
                    if pct:
                        self._add_log("info", f"Tor bootstrapping… {pct.group(1)}%")
                if time.time() > deadline:
                    break
            return False
        except Exception as e:
            self._add_log("error", f"Failed to launch tor.exe: {e}")
            return False

    def _kill_tor(self):
        if self._tor_proc and self._tor_proc.poll() is None:
            self._tor_proc.terminate()
            try:
                self._tor_proc.wait(timeout=5)
            except Exception:
                self._tor_proc.kill()
        self._tor_proc = None
        with self._lock:
            self._tor_ready = False

    # ── Control port ──────────────────────────

    def _send_control(self, cmd: str) -> str:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(5)
            s.connect(("127.0.0.1", TOR_CONTROL_PORT))
            s.sendall(f'AUTHENTICATE "{TOR_CONTROL_PASS}"\r\n'.encode())
            s.recv(1024)
            s.sendall(f"{cmd}\r\n".encode())
            resp = s.recv(1024).decode("utf-8", errors="ignore")
            s.close()
            return resp
        except Exception as e:
            return f"ERROR: {e}"

    def new_circuit(self) -> bool:
        resp = self._send_control("SIGNAL NEWNYM")
        return "250 OK" in resp

    def get_tor_ip(self) -> str:
        check_url = random.choice(IP_CHECK_URLS)
        try:
            import socks
            import socket as _socket
            orig = _socket.socket
            socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", TOR_SOCKS_PORT)
            _socket.socket = socks.socksocket
            try:
                req = urllib.request.Request(check_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=15) as r:
                    ip = r.read().decode().strip()
                return ip if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip) else ""
            finally:
                _socket.socket = orig
        except ImportError:
            try:
                r = subprocess.run(
                    ["curl", "--socks5", f"127.0.0.1:{TOR_SOCKS_PORT}",
                     "--max-time", "10", check_url],
                    capture_output=True, text=True, timeout=15
                )
                ip = r.stdout.strip()
                return ip if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip) else ""
            except Exception:
                return ""
        except Exception:
            return ""

    # ── Rotation loop ──────────────────────────

    async def _rotation_loop(self, loop: asyncio.AbstractEventLoop):
        while self._running:
            ok = await loop.run_in_executor(executor, self.new_circuit)
            if ok:
                await asyncio.sleep(2)  # let circuit build
                ip = await loop.run_in_executor(executor, self.get_tor_ip)
                with self._lock:
                    self._current_ip = ip
                    self._rotation_count += 1
                self._add_log(
                    "success",
                    f"#{self._rotation_count} New Tor circuit | Exit IP: {ip or 'resolving…'}"
                )
            else:
                self._add_log("error", "Failed to request new Tor circuit — is Tor running?")

            for _ in range(self._interval):
                if not self._running:
                    break
                await asyncio.sleep(1)

    async def start(self, loop: asyncio.AbstractEventLoop, interval: int = 10):
        with self._lock:
            if self._running:
                return
            self._running  = True
            self._interval = max(5, interval)

        self._add_log("info", f"Starting Tor — interval {self._interval}s")

        # Launch tor.exe if not already running
        tor_ready = self._tor_ready
        if not tor_ready:
            ok = await loop.run_in_executor(executor, self._launch_tor)
            if not ok:
                with self._lock:
                    self._running = False
                self._add_log("error", "Tor failed to bootstrap — check tor.exe path")
                return

        self._task = asyncio.ensure_future(self._rotation_loop(loop))

    async def stop(self):
        with self._lock:
            self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self._kill_tor()
        self._add_log("info", "Tor stopped")

    def _add_log(self, level: str, msg: str):
        entry = {"ts": time.strftime("%H:%M:%S"), "level": level, "msg": msg}
        with self._lock:
            self._log.append(entry)
            if len(self._log) > 200:
                self._log = self._log[-200:]


# ─────────────────────────────────────────────
# Singletons
# ─────────────────────────────────────────────

proxy_rotator  = ProxyRotator()
tor_controller = TorController()
