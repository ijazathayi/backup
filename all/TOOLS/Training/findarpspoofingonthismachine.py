# Defensive script: Detect ARP spoofing on your network
from scapy.all import sniff, ARP

gateway_ip = "172.23.69.1" # your hotspot IP
gateway_mac = None

def detect_arp_spoof(pkt):
    global gateway_mac
    if pkt.haslayer(ARP) and pkt[ARP].op == 2: # is-at response
        if pkt[ARP].psrc == gateway_ip:
            if gateway_mac is None:
                gateway_mac = pkt[ARP].hwsrc
                print(f"Gateway MAC: {gateway_mac}")
            elif pkt[ARP].hwsrc != gateway_mac:
                print(f"ALERT: Possible ARP spoof! Gateway {gateway_ip} claimed by {pkt[ARP].hwsrc} but was {gateway_mac}")

print("Monitoring for ARP spoofing... Ctrl+C to stop")
sniff(prn=detect_arp_spoof, filter="arp", store=0)



# from scapy.all import ARP, sniff
# import time

# known_macs = set({"8a:c2:56:34:11:70"}) # Add your devices here: {"aa:bb:cc:dd:ee:ff"}

# def arp_monitor(pkt):
#     if ARP in pkt and pkt[ARP].op == 1: # who-has
#         if pkt[ARP].hwsrc not in known_macs:
#             print(f"[{time.ctime()}] New device: {pkt[ARP].psrc} - {pkt[ARP].hwsrc}")
#             known_macs.add(pkt[ARP].hwsrc) # avoid spam

# print("Monitoring for new devices...")
# sniff(prn=arp_monitor, filter="arp", store=0)