import socket
import sys
from concurrent.futures import ThreadPoolExecutor
import time

def scan_port(ip, port):
    """
    Attempts to connect to a specific port on the given IP address.
    Returns the port number if successful (open), otherwise None.
    """
    try:
        # Create a socket object using IPv4 and TCP
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        # Set a short timeout so we don't hang on closed/filtered ports
        s.settimeout(1.0)
        
        # connect_ex returns 0 if the connection succeeded, otherwise an error indicator
        result = s.connect_ex((ip, port))
        s.close()
        
        if result == 0:
            return port
        return None
    except Exception:
        return None

def main():
    print("--- Basic Educational Port Scanner ---")
    print("This script attempts to connect to common ports on a target IP.\n")
    
    target_ip = input("Enter the target IP address to scan (e.g., 172.23.69.102): ").strip()
    
    if not target_ip:
        print("Invalid IP address.")
        sys.exit(1)

    print(f"\nScanning target: {target_ip}")
    print("This may take a minute depending on network latency...\n")

    # A list of common ports to scan (e.g., HTTP, HTTPS, SSH, FTP, etc.)
    common_ports = [
        20, 21,    # FTP
        22,        # SSH
        23,        # Telnet
        25,        # SMTP
        53,        # DNS
        80,        # HTTP
        110,       # POP3
        135, 139,  # NetBIOS
        143,       # IMAP
        443,       # HTTPS
        445,       # SMB
        3306,      # MySQL
        3389,      # RDP (Remote Desktop)
        5432,      # PostgreSQL
        8080, 8443 # Alt HTTP/HTTPS
    ]

    open_ports = []
    start_time = time.time()

    # Use ThreadPoolExecutor to scan ports concurrently
    with ThreadPoolExecutor(max_workers=20) as executor:
        # Submit all tasks
        futures = [executor.submit(scan_port, target_ip, port) for port in common_ports]
        
        for future in futures:
            result = future.result()
            if result is not None:
                open_ports.append(result)

    end_time = time.time()
    
    print("-" * 30)
    print(f"Scan completed in {end_time - start_time:.2f} seconds.")
    print("-" * 30)

    if open_ports:
        print("\nOpen Ports Found:")
        for port in sorted(open_ports):
            print(f"[*] Port {port} is OPEN")
            
        print("\nWhat this means:")
        print("Open ports indicate that a service is listening on the target device.")
        print("For example, if Port 80 is open, the device is likely running a web server.")
        print("In a real security assessment, the next step would be determining the exact software running on these ports.")
    else:
        print("\nNo open ports found from the common ports list.")
        print("The device might be ignoring requests (firewall), or isn't running these standard services.")

if __name__ == "__main__":
    main()
