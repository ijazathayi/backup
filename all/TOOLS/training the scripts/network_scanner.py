import socket
import subprocess
import re
from concurrent.futures import ThreadPoolExecutor
import platform

def get_local_ip():
    """Gets the local IP address of the machine."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # We don't actually need to connect to this IP, it's just to route the packet
        # and figure out which interface IP we are using.
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def ping_host(ip):
    """Pings a single IP address and returns True if it responds."""
    # -n on Windows, -c on Linux for number of packets
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    
    # Wait time for ping. -w is in milliseconds on Windows, seconds on Linux/Mac
    wait_param = '-w'
    wait_val = '500' if platform.system().lower() == 'windows' else '1'
    
    command = ['ping', param, '1', wait_param, wait_val, ip]
    
    try:
        # Hide the console window on Windows
        creationflags = subprocess.CREATE_NO_WINDOW if platform.system().lower() == 'windows' else 0
        subprocess.check_output(command, stderr=subprocess.STDOUT, creationflags=creationflags)
        return True
    except subprocess.CalledProcessError:
        return False
    except FileNotFoundError:
        return False

def scan_network():
    print("--- Network Scanner Initializing ---")
    local_ip = get_local_ip()
    print(f"Your local IP is: {local_ip}")
    
    if local_ip == '127.0.0.1':
        print("Could not determine local IP. Make sure you are connected to a network (WiFi or Hotspot).")
        return

    # Assume a standard /24 subnet for the local network
    # E.g., if IP is 192.168.1.5, base is 192.168.1.
    ip_parts = local_ip.split('.')
    base_ip = f"{ip_parts[0]}.{ip_parts[1]}.{ip_parts[2]}."
    
    print(f"Scanning subnet: {base_ip}0/24...")
    print("Sending ping requests (this might take a few seconds)...\n")

    # Use multi-threading to speed up the ping process for all 254 IPs
    active_ips = []
    with ThreadPoolExecutor(max_workers=100) as executor:
        ips_to_ping = [f"{base_ip}{i}" for i in range(1, 255)]
        # Map ping_host to all IPs concurrently
        results = executor.map(ping_host, ips_to_ping)
        
        for ip, is_active in zip(ips_to_ping, results):
            if is_active:
                active_ips.append(ip)

    # After pinging, the devices will be cached in our system's ARP table.
    # We can query the ARP table to get their MAC addresses.
    print("\n--- Devices Found on Network ---")
    try:
        arp_output = subprocess.check_output(['arp', '-a']).decode('utf-8', errors='ignore')
        
        # Regex to parse the ARP table output from Windows command line
        arp_pattern = re.compile(r'^\s*([0-9\.]+)\s+([0-9a-fA-F\-]+)\s+(\w+)', re.MULTILINE)
        arp_table = {}
        
        for match in arp_pattern.finditer(arp_output):
            arp_table[match.group(1)] = match.group(2)
        
        print(f"{'IP Address':<18} | {'MAC Address':<20} | {'Status'}")
        print("-" * 60)
        
        # Ensure our own IP is printed nicely
        print(f"{local_ip:<18} | {'(Your Device)':<20} | Active")
        
        for ip in active_ips:
            if ip != local_ip:
                mac = arp_table.get(ip, "Unknown")
                print(f"{ip:<18} | {mac:<20} | Active")
                
    except Exception as e:
        print(f"Error querying ARP table: {e}")
        # Fallback if ARP fails
        for ip in active_ips:
            print(f"IP: {ip}")

if __name__ == "__main__":
    scan_network()
