import argparse
import socket
import subprocess
import platform
import time
import ipaddress
from concurrent.futures import ThreadPoolExecutor

# A dictionary of common ports and their associated service names
COMMON_PORTS = {
    20: "ftp-data", 21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp",
    53: "domain", 80: "http", 110: "pop3", 111: "rpcbind", 135: "msrpc",
    139: "netbios-ssn", 143: "imap", 443: "https", 445: "microsoft-ds",
    993: "imaps", 995: "pop3s", 1723: "pptp", 3306: "mysql", 3389: "ms-wbt-server",
    5900: "vnc", 8080: "http-proxy", 8443: "https-alt"
}

def ping_host(ip):
    """Pings a single IP address to check if it's alive."""
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    wait_param = '-w'
    wait_val = '500' if platform.system().lower() == 'windows' else '1'
    
    command = ['ping', param, '1', wait_param, wait_val, str(ip)]
    
    try:
        creationflags = subprocess.CREATE_NO_WINDOW if platform.system().lower() == 'windows' else 0
        subprocess.check_output(command, stderr=subprocess.STDOUT, creationflags=creationflags)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def grab_banner(ip, port, timeout=1.5):
    """Connects to an open port and attempts to extract the service banner/version."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((str(ip), port))
        
        try:
            banner = s.recv(1024).decode('utf-8', errors='ignore').strip()
            if banner:
                s.close()
                # Return just the first line, truncated to keep output clean
                return banner.split('\n')[0][:50]
        except socket.timeout:
            pass
            
        # Send an HTTP GET request as a fallback for web servers
        http_request = f"GET / HTTP/1.1\r\nHost: {ip}\r\n\r\n"
        s.sendall(http_request.encode('utf-8'))
        
        banner = s.recv(1024).decode('utf-8', errors='ignore').strip()
        s.close()
        
        if banner:
            lines = banner.split('\n')
            for line in lines:
                if line.lower().startswith('server:'):
                    return line.strip()[:50]
            return lines[0].strip()[:50]
            
        return ""
    except Exception:
        return ""

def scan_port(ip, port, version_detection=False):
    """Scans a single port to check if it's open."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        result = s.connect_ex((str(ip), port))
        s.close()
        
        if result == 0:
            version = ""
            if version_detection:
                version = grab_banner(ip, port)
            return (port, True, version)
        return (port, False, "")
    except Exception:
        return (port, False, "")

def scan_target(ip, ports, version_detection=False):
    """Scans a single target IP for open ports and services."""
    print(f"\nNmap scan report for {ip}")
    
    # 1. Host discovery
    if not ping_host(ip):
        print("Host seems down. If it is really up, but blocking ping probes, try scanning its ports anyway.")
        return
        
    print("Host is up.")
    
    open_ports_info = []
    
    # 2. Port scanning
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(scan_port, ip, port, version_detection) for port in ports]
        
        for future in futures:
            port, is_open, version = future.result()
            if is_open:
                open_ports_info.append((port, version))
                
    # 3. Output formatting
    if open_ports_info:
        if version_detection:
            print(f"{'PORT':<9} {'STATE':<7} {'SERVICE':<15} {'VERSION'}")
        else:
            print(f"{'PORT':<9} {'STATE':<7} {'SERVICE':<15}")
            
        open_ports_info.sort(key=lambda x: x[0])
        for port, version in open_ports_info:
            service = COMMON_PORTS.get(port, "unknown")
            port_str = f"{port}/tcp"
            if version_detection:
                print(f"{port_str:<9} {'open':<7} {service:<15} {version}")
            else:
                print(f"{port_str:<9} {'open':<7} {service:<15}")
    else:
        print("All scanned ports are closed or filtered.")

def main():
    parser = argparse.ArgumentParser(description="PyNmap - Python-based educational network mapper")
    parser.add_argument("target", help="Target IP, hostname, or subnet (e.g. 192.168.1.5 or 192.168.1.0/24)")
    parser.add_argument("-p", "--ports", help="Comma-separated list of ports to scan (e.g. 22,80,443)")
    parser.add_argument("-sV", "--version", action="store_true", help="Probe open ports to determine service/version info")
    
    args = parser.parse_args()
    
    # Parse the user's custom ports or use the common ports list
    if args.ports:
        try:
            ports_to_scan = [int(p.strip()) for p in args.ports.split(",")]
        except ValueError:
            print("Invalid port format. Use comma-separated numbers (e.g. 80,443).")
            return
    else:
        ports_to_scan = list(COMMON_PORTS.keys())
        
    start_time = time.time()
    print(f"Starting PyNmap at {time.strftime('%Y-%m-%d %H:%M %Z')}")
    
    try:
        # Determine if target is a single IP or a network (e.g., /24 subnet)
        if '/' in args.target:
            network = ipaddress.ip_network(args.target, strict=False)
            print(f"Scanning {network.num_addresses} hosts in subnet...")
            for ip in network.hosts():
                scan_target(ip, ports_to_scan, args.version)
        else:
            # Try to resolve hostname if it's a domain name, otherwise use the IP
            try:
                ip = socket.gethostbyname(args.target)
                scan_target(ip, ports_to_scan, args.version)
            except socket.gaierror:
                print(f"Failed to resolve hostname: {args.target}")
    except ValueError:
         print(f"Invalid target format: {args.target}")
    except KeyboardInterrupt:
        print("\nScan aborted by user.")
        
    end_time = time.time()
    print(f"\nPyNmap done: scanned in {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    main()
