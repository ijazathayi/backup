# from scapy.all import ARP, Ether, srp
# import requests, socket

# def get_vendor(mac):
#     try:
#         r = requests.get(f"https://api.macvendors.com/{mac}", timeout=1)
#         return r.text if r.status_code == 200 else "Unknown"
#     except: return "Unknown"

# s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# s.connect(("8.8.8.8", 80))
# my_ip = s.getsockname()[0]
# s.close()
# subnet = ".".join(my_ip.split(".")[0:3]) + ".0/24"

# ans, _ = srp(Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=subnet), timeout=2, verbose=0)
# print("IP" + " "*18 + "MAC" + " "*21 + "Vendor")
# print("-" * 70)
# for snd,rcv in ans:
#     vendor = get_vendor(rcv.hwsrc)
#     print(f"{rcv.psrc:<16} {rcv.hwsrc:<20} {vendor}")
















#  find new devices connected to your hotspot using ARP scanning
from scapy.all import sniff, DHCP

def dhcp_monitor(pkt): 
    if pkt.haslayer(DHCP):
        mac = pkt.src
        hostname = "unknown"
        for opt in pkt[DHCP].options:
            if opt[0] == 'hostname':
                hostname = opt[1].decode()
            if opt[0] == 'vendor_class_id':
                vendor = opt[1].decode()
                print(f"New device: {mac} | Hostname: {hostname} | Vendor: {vendor}")

print("Monitoring DHCP... connect a new device to hotspot")
sniff(prn=dhcp_monitor, filter="udp and (port 67 or 68)", store=0)







# import nmap
# import socket

# s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# s.connect(("8.8.8.8", 80))
# my_ip = s.getsockname()[0]
# s.close()
# gateway = ".".join(my_ip.split(".")[0:3]) + ".1"

# nm = nmap.PortScanner()
# print(f"Scanning {gateway} for OS...")
# nm.scan(gateway, arguments="-O") # -O = OS detection

# for host in nm.all_hosts():
#     if 'osmatch' in nm[host]:
#         for os in nm[host]['osmatch']:
#             print(f"{host} -> {os['name']} {os['accuracy']}%")



# find what device with mac address is connected to your hotspot
# import requests

# def get_vendor(mac):
#     try:
#         r = requests.get(f"https://api.macvendors.com/{mac}", timeout=2)
#         return r.text if r.status_code == 200 else "Unknown"
#     except:
#         return "Lookup failed"

# # Example with your results
# mac = "a4:50:46:xx:xx:xx"
# print(get_vendor(mac)) # Might say "Samsung Electronics Co Ltd"






# from scapy.all import sniff, IP

# def os_from_ttl(pkt):
#     if pkt.haslayer(IP):
#         ip = pkt[IP].src
#         ttl = pkt[IP].ttl
#         if ttl <= 64: os = "Linux/Android"
#         elif ttl <= 128: os = "Windows"
#         elif ttl <= 255: os = "iOS/macOS/Cisco"
#         else: os = "Unknown"
#         print(f"{ip} -> TTL {ttl} -> Likely {os}")

# print("Waiting for traffic... open a website on another device")
# sniff(prn=os_from_ttl, filter="ip", store=0)





























