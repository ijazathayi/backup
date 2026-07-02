import sniff_test
capture = sniff_test.LiveCapture(interface='Wi-Fi', bpf_filter='tcp port 80')
for packet in capture.sniff_continuously(packet_count=5):
    print(packet.ip.src, packet.http.host)