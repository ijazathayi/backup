
# arp scan with mobile hotspot.  
from scapy.all import ARP, Ether, srp, conf
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
my_ip = s.getsockname()[0]
s.close()
subnet = ".".join(my_ip.split(".")[0:3]) + ".0/24"
gateway = ".".join(my_ip.split(".")[0:3]) + ".1"

print(f"Your IP: {my_ip}")
print(f"Hotspot gateway: {gateway}")
print(f"Scanning {subnet}\n")

# Try to find gateway + any other devices
arp = ARP(pdst=subnet)
ether = Ether(dst="ff:ff:ff:ff")
packet = ether/arp

ans, unans = srp(packet, timeout=3, verbose=0)
if ans:
    print("IP" + " "*18 + "MAC")
    print("-" * 40)
    for snd,rcv in ans:
        device = "Phone/Gateway" if rcv.psrc == gateway else "Device"
        print(f"{rcv.psrc:<16} {rcv.hwsrc} {device}")
else:
    print("No devices replied. Hotspot likely has client isolation enabled.")


# arp scanning with wifib 

# from scapy.all import ARP, Ether, srp

# def arp_scan(subnet="192.168.1.0/24"):
#     # Craft ARP request packet
#     arp = ARP(pdst=subnet)
#     ether = Ether(dst="ff:ff:ff:ff:ff:ff")
#     packet = ether/arp

#     result = srp(packet, timeout=2, verbose=0)[0]

#     devices = []
#     for sent, received in result:
#         devices.append({'ip': received.psrc, 'mac': received.hwsrc})

#     return devices

# if __name__ == "__main__":
#     clients = arp_scan("192.168.1.0/24")
#     print("IP" + " "*18 + "MAC")
#     print("-" * 40)
#     for client in clients:
#         print(f"{client['ip']:<16} {client['mac']}")





# from scapy.all import arping
# arping("172.23.69.1") # Phone is usually.1







# from scapy.all import get_if_list, get_if_addr, conf
# import socket

# print("Your interfaces:")
# for iface in get_if_list():
#     try:
#         ip = get_if_addr(iface)
#         if ip!= "0.0.0.0":
#             print(f"{iface} -> {ip}")
#     except:
#         pass

# # Also show your actual LAN IP
# s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# s.connect(("8.8.8.8", 80))
# print(f"\nYour real LAN IP: {s.getsockname()[0]}")
# s.close()               







# from scapy.all import ARP, Ether, srp, conf

# print("Using interface:", conf.iface)
# arp = ARP(pdst="192.168.1.1") # ping just your router first
# ether = Ether(dst="ff:ff:ff:ff:ff:ff")
# packet = ether/arp

# print("Sending packet...")
# ans, unans = srp(packet, timeout=2, verbose=1)
# print(f"Got {len(ans)} answers")

# for s,r in ans:
#     print(f"{r.psrc} is at {r.hwsrc}")









