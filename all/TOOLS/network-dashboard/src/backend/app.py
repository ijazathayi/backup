from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import random
import time
import threading
import subprocess
import re
import concurrent.futures

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# -------------------
# Sample Data & State
# -------------------
current_mode = "wifi"

logs = [
    "[INFO] System started",
    "[SCAN] Network scan initiated",
]

cached_subnets = None
subnets_last_fetch = 0

def get_interface_subnets():
    global cached_subnets, subnets_last_fetch
    if cached_subnets and (time.time() - subnets_last_fetch < 30):
        return cached_subnets
    try:
        output = subprocess.check_output("ipconfig", shell=True, text=True)
        wifi_subnet = ""
        hotspot_subnet = ""
        current_adapter = ""
        
        for raw_line in output.split('\n'):
            line = raw_line.strip()
            if raw_line and not raw_line[0].isspace() and line.endswith(':'):
                current_adapter = line.lower()
            elif "IPv4 Address" in line:
                ip = line.split(':')[-1].strip()
                subnet = ".".join(ip.split('.')[:3]) + "."
                if "wi-fi" in current_adapter:
                    wifi_subnet = subnet
                elif "local area connection*" in current_adapter:
                    hotspot_subnet = subnet
        cached_subnets = (wifi_subnet, hotspot_subnet)
        subnets_last_fetch = time.time()
        return cached_subnets
    except:
        return "", ""

def get_real_devices():
    try:
        wifi_subnet, hotspot_subnet = get_interface_subnets()
        
        # If Hotspot is selected but the Windows Hotspot interface is off, fallback to Wi-Fi so the user still sees their network
        if current_mode == "hotspot" and hotspot_subnet == "":
            target_subnet = wifi_subnet
        else:
            target_subnet = wifi_subnet if current_mode == "wifi" else hotspot_subnet
        
        if not target_subnet:
            return []

        output = subprocess.check_output("arp -a", shell=True, text=True)
        devices = []
        for line in output.split('\n'):
            if "dynamic" in line.lower():
                parts = line.split()
                if len(parts) >= 2:
                    ip = parts[0]
                    mac = parts[1]
                    if ip.startswith(target_subnet):
                        devices.append({
                            "name": "Unknown Device",
                            "ip": ip,
                            "status": mac
                        })
        return devices
    except Exception as e:
        print(f"Error getting devices: {e}")
        return []

cached_ports = 0
ports_last_fetch = 0

def get_real_open_ports():
    global cached_ports, ports_last_fetch
    if time.time() - ports_last_fetch < 10:
        return cached_ports
    try:
        output = subprocess.check_output("netstat -an", shell=True, text=True)
        count = 0
        for line in output.split('\n'):
            if "LISTENING" in line:
                count += 1
        cached_ports = count
        ports_last_fetch = time.time()
        return count
    except Exception as e:
        print(f"Error getting ports: {e}")
        return 0

last_bytes_recv = 0
last_bytes_sent = 0
last_time = time.time()

def get_real_bandwidth_details():
    global last_bytes_recv, last_bytes_sent, last_time
    try:
        output = subprocess.check_output("netstat -e", shell=True, text=True)
        lines = output.split('\n')
        for line in lines:
            if line.startswith("Bytes"):
                parts = line.split()
                received = int(parts[1])
                sent = int(parts[2])
                
                current_time = time.time()
                time_diff = current_time - last_time
                
                if time_diff > 0:
                    recv_bps = max(0, (received - last_bytes_recv) / time_diff)
                    sent_bps = max(0, (sent - last_bytes_sent) / time_diff)
                else:
                    recv_bps = 0
                    sent_bps = 0
                    
                last_bytes_recv = received
                last_bytes_sent = sent
                last_time = current_time
                
                # Calculate a percentage relative to an assumed max speed (e.g., 50 MB/s for wifi)
                max_bytes = 50.0 * 1024 * 1024
                recv_pct = min(100, int((recv_bps / max_bytes) * 100))
                sent_pct = min(100, int((sent_bps / max_bytes) * 100))
                
                mb_per_sec = (recv_bps + sent_bps) / (1024 * 1024)
                
                return f"{mb_per_sec:.2f} MB/s", recv_pct, sent_pct
    except Exception as e:
        pass
    return "0.00 MB/s", 0, 0

def get_ping_stats():
    try:
        output = subprocess.check_output("ping -n 1 -w 1000 8.8.8.8", shell=True, text=True)
        if "100% loss" in output or "unreachable" in output.lower() or "could not find host" in output.lower():
            return 0, 0
        
        time_ms = 0
        match = re.search(r"time[=<](\d+)ms", output)
        if match:
            time_ms = int(match.group(1))
            
        stability = max(0, min(100, 100 - (time_ms // 5)))
        return 100, stability
    except:
        return 0, 0

# -------------------
# REST API
# -------------------
@app.route("/devices")
def get_devices_route():
    return jsonify(get_real_devices())


@app.route("/stats")
def get_stats():
    return jsonify({
        "online": random.randint(5, 20),
        "ports": random.randint(20, 80),
        "bandwidth": f"{random.randint(50, 200)} MB/s",
        "threats": random.randint(0, 5)
    })


@app.route("/logs")
def get_logs():
    return jsonify(logs[-20:])

@app.route("/scan_device/<ip>")
def scan_device(ip):
    if not re.match(r"^\d{1,3}(\.\d{1,3}){3}$", ip):
        return jsonify({"error": "Invalid IP format"}), 400
        
    try:
        results = []
        
        # 1. Ping test
        results.append("=== PING TEST ===")
        try:
            ping_cmd = f"ping -n 4 {ip}"
            ping_out = subprocess.check_output(ping_cmd, shell=True, text=True, stderr=subprocess.STDOUT)
            results.append(ping_out.strip())
        except subprocess.CalledProcessError as e:
            results.append(f"Ping failed: {e.output.strip() if hasattr(e, 'output') and e.output else 'Host unreachable'}")
            
        results.append("\n=== DEEP SCAN (OS, SERVICES, PORTS) ===")
        
        # 2. Nmap Aggressive Scan
        try:
            cmd = f"nmap -A -T4 -F {ip}"
            output = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.STDOUT)
            results.append(output.strip())
        except subprocess.CalledProcessError as e:
            results.append(f"[Warning: Aggressive scan failed, falling back to basic version scan]\n")
            try:
                cmd = f"nmap -sV -F {ip}"
                output = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.STDOUT)
                results.append(output.strip())
            except Exception as e2:
                results.append(f"Nmap scan failed: {str(e2)}")
                
        return jsonify({"output": "\n".join(results), "target": ip})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/scan_ports")
def scan_host_ports():
    try:
        output = subprocess.check_output("ipconfig", shell=True, text=True)
        my_ip = None
        current_adapter = ""
        # Find exactly the active host IP depending on mode
        for raw_line in output.split('\n'):
            line = raw_line.strip()
            if raw_line and not raw_line[0].isspace() and line.endswith(':'):
                current_adapter = line.lower()
            elif "IPv4 Address" in line:
                ip = line.split(':')[-1].strip()
                if current_mode == "hotspot" and "local area connection*" in current_adapter:
                    my_ip = ip
                    break
                elif "wi-fi" in current_adapter:
                    # Capture wifi IP but keep searching if we want hotspot
                    my_ip = ip
                    if current_mode == "wifi":
                        break
        
        if not my_ip:
            return jsonify({"error": "Could not determine host IP address."}), 400
            
        cmd = f"nmap -F -sV {my_ip}"
        scan_out = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.STDOUT)
        return jsonify({"output": scan_out, "target": my_ip})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# -------------------
# SOCKET LIVE UPDATES
# -------------------
@socketio.on('change_mode')
def handle_change_mode(data):
    global current_mode
    current_mode = data.get('mode', 'wifi')
    print(f"Mode changed to {current_mode}")
    # Push immediate stats update on mode switch
    push_stats_update()

@socketio.on('force_refresh')
def handle_force_refresh():
    print("Manual refresh triggered")
    socketio.emit("new_log", {"log": "[SCAN] Active network scan started (takes ~3s)..."})
    socketio.start_background_task(run_scan_and_update)

def run_scan_and_update():
    active_scan_subnet()
    push_stats_update()
    socketio.emit("new_log", {"log": "[SCAN] Network scan complete!"})

def ping_ip(ip):
    # -n 1 for windows, -w 500 for 500ms timeout
    cmd = f"ping -n 1 -w 500 {ip}"
    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def active_scan_subnet():
    wifi_subnet, hotspot_subnet = get_interface_subnets()
    if current_mode == "hotspot" and hotspot_subnet == "":
        target_subnet = wifi_subnet
    else:
        target_subnet = wifi_subnet if current_mode == "wifi" else hotspot_subnet
        
    if not target_subnet:
        return
        
    ips = [f"{target_subnet}{i}" for i in range(1, 255)]
    # Use ThreadPoolExecutor to run pings in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        executor.map(ping_ip, ips)

def push_stats_update():
    real_devices = get_real_devices()
    open_ports = get_real_open_ports()
    bandwidth, download_pct, upload_pct = get_real_bandwidth_details()
    packet_health, ping_stability = get_ping_stats()
        
    stats = {
        "online": len(real_devices),
        "ports": open_ports,
        "bandwidth": bandwidth,
        "threats": random.randint(0, 1),
        "traffic": {
            "download": download_pct,
            "upload": upload_pct,
            "packetHealth": packet_health,
            "pingStability": ping_stability
        }
    }
        
    socketio.emit("stats_update", {
        "stats": stats,
        "devices": real_devices
    })

def generate_live_data():
    while True:
        socketio.sleep(3)

        new_log = random.choice([
            "[LIVE] Monitoring network traffic...",
            "[SCAN] Open port detected: 443",
            "[WARNING] High bandwidth usage detected",
            "[ALERT] Suspicious packet received",
            f"[INFO] Active in {current_mode.upper()} mode"
        ])

        logs.append(new_log)

        socketio.emit("new_log", {"log": new_log})
        push_stats_update()


# Start background task
socketio.start_background_task(generate_live_data)


# -------------------
# RUN SERVER
# -------------------
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)