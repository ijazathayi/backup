import socket
import sys

def grab_banner(ip, port, timeout=2.0):
    """
    Attempts to connect to a port and read the initial banner sent by the service.
    """
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((ip, port))
        
        # Try to receive initial data. 
        # Services like SSH, FTP, and SMTP usually send a welcome banner as soon as you connect.
        try:
            banner = s.recv(1024).decode('utf-8', errors='ignore').strip()
            if banner:
                s.close()
                return banner
        except socket.timeout:
            # If we timeout reading, it means the service expects US to talk first (like HTTP).
            pass
            
        # Send a generic HTTP request just in case it's a web server.
        # Web servers (Port 80/443) won't say anything until you ask for a webpage.
        http_request = "GET / HTTP/1.1\r\nHost: {}\r\n\r\n".format(ip)
        s.sendall(http_request.encode('utf-8'))
        
        banner = s.recv(1024).decode('utf-8', errors='ignore').strip()
        s.close()
        
        if banner:
            # We look for the "Server:" header which tells us the software version
            lines = banner.split('\n')
            for line in lines:
                if line.lower().startswith('server:'):
                    return line.strip()
            
            # If no Server header, just return the first line (e.g., HTTP/1.1 400 Bad Request)
            return lines[0].strip()
            
        return None
    except Exception as e:
        return f"Error connecting/grabbing banner: {e}"

def main():
    print("--- Educational Service Version Detector (Banner Grabber) ---")
    print("This script connects to an open port to read the 'banner' broadcasted by the service.\n")
    
    target_ip = input("Enter the target IP address: ").strip()
    port_input = input("Enter the open port to inspect (e.g., 22, 80): ").strip()
    
    if not target_ip or not port_input.isdigit():
        print("Invalid IP or Port.")
        sys.exit(1)
        
    target_port = int(port_input)
    
    print(f"\nAttempting to grab banner from {target_ip} on port {target_port}...")
    
    banner = grab_banner(target_ip, target_port)
    
    print("-" * 50)
    if banner and not banner.startswith("Error"):
        print(f"Service Banner/Version detected:\n\n{banner}\n")
        print("-" * 50)
        print("What this means:")
        print("Many network services automatically broadcast their software name and version")
        print("numbers to anyone who connects. This technique is called 'Banner Grabbing'.")
        print("Security researchers take this exact string (e.g., 'OpenSSH 8.2p1') and")
        print("search vulnerability databases to see if that specific version has known flaws.")
    elif banner and banner.startswith("Error"):
        print(banner)
    else:
        print("No banner could be retrieved.")
        print("The service might require a specific protocol handshake, or the administrator")
        print("has configured the service to hide its version information (a good security practice!).")
    print("-" * 50)

if __name__ == "__main__":
    main()
