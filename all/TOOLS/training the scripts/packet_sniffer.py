import argparse
import sys

try:
    from scapy.all import sniff, IP, TCP, UDP, ICMP
except ImportError:
    print("Error: Scapy library is not installed.")
    print("Please install it by running: pip install scapy")
    sys.exit(1)

def packet_callback(packet):
    """
    This function is called for every packet sniffed.
    """
    # Check if the packet has an IP layer
    if IP in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        protocol = packet[IP].proto
        
        # Determine the protocol name
        proto_name = "Unknown"
        if protocol == 1:
            proto_name = "ICMP"
        elif protocol == 6:
            proto_name = "TCP"
        elif protocol == 17:
            proto_name = "UDP"

        print(f"[*] {proto_name} Packet: {src_ip} -> {dst_ip}")

        # If it's TCP or UDP, let's print the ports as well
        if TCP in packet:
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
            print(f"    Ports: {src_port} -> {dst_port}")
            if packet[TCP].payload:
                payload = bytes(packet[TCP].payload)
                if len(payload) > 0:
                    print(f"    Data: {payload[:80]}") # Print first 80 bytes
        elif UDP in packet:
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport
            print(f"    Ports: {src_port} -> {dst_port}")
            if packet[UDP].payload:
                payload = bytes(packet[UDP].payload)
                if len(payload) > 0:
                    print(f"    Data: {payload[:80]}") # Print first 80 bytes

def start_sniffer(interface=None, count=0):
    """
    Starts the packet sniffer.
    """
    print(f"[*] Starting packet sniffer...")
    if interface:
        print(f"[*] Listening on interface: {interface}")
    else:
        print("[*] Listening on default interface")
        
    print(f"[*] Press Ctrl+C to stop.")
    
    try:
        # sniff function from scapy
        # prn is the callback function applied to each packet
        # store=False tells scapy not to keep packets in memory (prevents high RAM usage)
        sniff(iface=interface, prn=packet_callback, store=False, count=count)
    except PermissionError:
        print("[-] Error: You need administrator/root privileges to run a packet sniffer.")
    except KeyboardInterrupt:
        print("\n[*] Sniffer stopped.")
    except Exception as e:
        print(f"[-] An error occurred: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="A simple packet sniffer using Scapy")
    parser.add_argument("-i", "--interface", help="Network interface to sniff on (e.g., eth0, wlan0)", default=None)
    parser.add_argument("-c", "--count", type=int, help="Number of packets to capture (0 = infinite)", default=0)
    
    args = parser.parse_args()
    
    start_sniffer(interface=args.interface, count=args.count)
