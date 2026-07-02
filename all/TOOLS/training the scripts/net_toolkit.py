import argparse
import sys
import time
from datetime import datetime

try:
    from scapy.all import sniff, ARP, Ether, srp, conf
except ImportError:
    print("[!] Scapy is not installed. Please run: pip install scapy")
    print("[!] Note: On Windows, Npcap (https://npcap.com/) is also required.")
    sys.exit(1)

def scan_network(target_ip):
    """
    Performs an ARP scan on the specified network target.
    """
    print(f"\n[*] Starting ARP scan on target: {target_ip}")
    print("[*] Please wait, this requires Administrator privileges...")
    
    # Hide verbose Scapy output
    conf.verb = 0
    
    try:
        # Create ARP request packet asking for the target IP
        arp = ARP(pdst=target_ip)
        # Create Ethernet broadcast packet
        ether = Ether(dst="ff:ff:ff:ff:ff:ff")
        # Stack them together
        packet = ether/arp

        # Send packet and capture responses at Layer 2
        start_time = time.time()
        result = srp(packet, timeout=3)[0]
        end_time = time.time()

        devices = []
        for sent, received in result:
            devices.append({'ip': received.psrc, 'mac': received.hwsrc})

        # Display results
        print(f"\nScan completed in {end_time - start_time:.2f} seconds.")
        print(f"Discovered {len(devices)} active devices.")
        
        if devices:
            print("\n" + "-"*45)
            print(f"{'IP Address':<20} | {'MAC Address':<20}")
            print("-" * 45)
            for device in devices:
                print(f"{device['ip']:<20} | {device['mac']:<20}")
            print("-" * 45 + "\n")
            
    except PermissionError:
        print("\n[!] ERROR: You must run this terminal/command prompt as Administrator to send raw packets.")
        sys.exit(1)
    except Exception as e:
        print(f"\n[!] An error occurred during the scan: {e}")

def sniff_packets(packet_count, packet_filter):
    """
    Sniffs packets from the network interface.
    """
    print(f"\n[*] Starting packet sniffer.")
    print(f"[*] Target count: {packet_count} packets")
    if packet_filter:
        print(f"[*] Filter applied: {packet_filter}")
    print("[*] Listening for traffic (requires Administrator privileges)...\n")
    
    def packet_callback(packet):
        # We process and print each packet as it arrives in real-time
        timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        summary = packet.summary()
        print(f"[{timestamp}] {summary}")
        
    try:
        # store=0 ensures we don't keep packets in memory, preventing RAM bloat on large captures
        sniff(count=packet_count, filter=packet_filter, prn=packet_callback, store=0)
        print(f"\n[*] Sniffing complete. Captured {packet_count} packets.")
    except PermissionError:
        print("\n[!] ERROR: You must run this terminal/command prompt as Administrator to sniff traffic.")
        sys.exit(1)
    except Exception as e:
        print(f"\n[!] An error occurred during sniffing: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Scapy Network Toolkit - Advanced Scanner and Sniffer",
        epilog="IMPORTANT: This script must be run with Administrator/Root privileges."
    )
    
    # Modes
    parser.add_argument("-m", "--mode", choices=['scan', 'sniff'], required=True, 
                        help="Mode of operation: 'scan' (ARP Network Scan) or 'sniff' (Packet Capture).")
    
    # Scan Mode Arguments
    parser.add_argument("-t", "--target", type=str, 
                        help="Target IP or Subnet for scanning (e.g., 10.204.156.0/24). Required for 'scan' mode.")
    
    # Sniff Mode Arguments
    parser.add_argument("-c", "--count", type=int, default=10, 
                        help="Number of packets to capture. Default is 10.")
    parser.add_argument("-f", "--filter", type=str, default="", 
                        help="BPF filter for sniffing (e.g., 'tcp port 80' or 'icmp').")

    args = parser.parse_args()

    # Route execution based on chosen mode
    if args.mode == 'scan':
        if not args.target:
            parser.error("The 'scan' mode requires a --target (e.g., -t 10.204.156.0/24)")
        scan_network(args.target)
        
    elif args.mode == 'sniff':
        sniff_packets(args.count, args.filter)

if __name__ == "__main__":
    main()
