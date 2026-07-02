#!/usr/bin/python3
import subprocess
import socket
import platform
import ipaddress
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_local_ip():
    """Get LAN IP instead of 127.0.1.1"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80)) # Doesn't send data
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

def ping_host(ip):
    """Ping a single IP. Return IP if alive, None if dead"""
    system = platform.system()
    if system == "Windows":
        cmd = ["ping", "-n", "1", "-w", "200", ip]
    else: # Linux, macOS, Termux
        cmd = ["ping", "-c", "1", "-W", "1", ip]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, errors="ignore", timeout=2)
        # Windows shows "TTL", Linux shows "ttl="
        if "TTL" in res.stdout or "ttl=" in res.stdout.lower():
            return ip
    except subprocess.TimeoutExpired:
        pass
    return None

def scan_network():
    local_ip = get_local_ip()
    print(f"Your IP: {local_ip}")

    # Get /24 subnet, e.g. 192.168.1.0/24
    network = ipaddress.ip_network(f"{local_ip}/24", strict=False)
    print(f"Scanning {network}...\n")

    alive_hosts = []
    # Scan with 100 threads in parallel
    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = {executor.submit(ping_host, str(ip)): ip for ip in network.hosts()}
        for future in as_completed(futures):
            result = future.result()
            if result:
                print(f"Device found: {result}")
                alive_hosts.append(result)

    print(f"\nDone. Found {len(alive_hosts)} devices.")
    return alive_hosts

if __name__ == "__main__":
    scan_network()