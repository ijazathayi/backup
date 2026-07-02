import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import NmapReader from "./NmapReader";

const socket = io("http://localhost:5000");



export default function App() {

  useEffect(() => {
    socket.on("new_log", (data) => {
      setLogs((prev) => [data.log, ...prev.slice(0, 19)]);
    });

    socket.on("stats_update", (data) => {
      setStats(data.stats);
      setDevices(data.devices);
    });

    return () => {
      socket.off("new_log");
      socket.off("stats_update");
    };
  }, []);

  const [networkMode, setNetworkMode] = useState("wifi");

  const [devices, setDevices] = useState([]);

  const [logs, setLogs] = useState([
    "[INFO] Initializing connection to backend...",
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState({
    online: 0,
    ports: 0,
    bandwidth: "0.00 MB/s",
    threats: 0,
    traffic: {
      download: 0,
      upload: 0,
      packetHealth: 0,
      pingStability: 0
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalTitle, setTerminalTitle] = useState("");
  const [terminalContent, setTerminalContent] = useState("");
  const [terminalLoading, setTerminalLoading] = useState(false);

  const [nmapReaderOpen, setNmapReaderOpen] = useState(false);

  const handleDeviceClick = async (device) => {
    setTerminalTitle(`DEEP SCAN: ${device.ip}`);
    setTerminalContent("");
    setTerminalLoading(true);
    setTerminalOpen(true);
    try {
      const res = await fetch(`http://localhost:5000/scan_device/${device.ip}`);
      const data = await res.json();
      setTerminalContent(data.output || data.error || "No data received.");
    } catch (e) {
      setTerminalContent(`Error: ${e.message}`);
    } finally {
      setTerminalLoading(false);
    }
  };

  const handlePortsClick = async () => {
    setModalTitle("LOCAL HOST SCAN");
    setModalContent("");
    setModalLoading(true);
    setModalOpen(true);
    try {
      const res = await fetch(`http://localhost:5000/scan_ports`);
      const data = await res.json();
      setModalContent(data.output || data.error || "No data received.");
    } catch (e) {
      setModalContent(`Error: ${e.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Removing the local interval since data comes from the backend
  useEffect(() => {
    // Optionally fetch initial data here
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-black to-teal-900/20 blur-3xl"></div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)] tracking-widest">
              NETWORK MONITOR
            </h1>

            <p className="text-gray-400 mt-2">
              Real-Time Cyberpunk Monitoring Dashboard
            </p>
          </div>

          {/* Actions Container */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Network Mode Toggle */}
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-xl">
              <button
                onClick={() => { 
                  setNetworkMode("wifi"); 
                  setLogs((prev) => ["[INFO] Switched to WI-FI mode", ...prev]);
                  socket.emit("change_mode", { mode: "wifi" }); 
                }}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                  networkMode === "wifi"
                    ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-cyan-500/50"
                    : "text-gray-500 hover:text-gray-300 transparent border border-transparent"
                }`}
              >
                WI-FI
              </button>
              <button
                onClick={() => { 
                  setNetworkMode("hotspot"); 
                  setLogs((prev) => ["[INFO] Switched to HOTSPOT mode", ...prev]);
                  socket.emit("change_mode", { mode: "hotspot" }); 
                }}
                className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                  networkMode === "hotspot"
                    ? "bg-red-500/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500/50"
                    : "text-gray-500 hover:text-gray-300 transparent border border-transparent"
                }`}
              >
                HOTSPOT
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                if (isRefreshing) return;
                setIsRefreshing(true);
                setLogs((prev) => ["[INFO] Force refreshing network data...", ...prev]);
                socket.emit("force_refresh");
                setTimeout(() => setIsRefreshing(false), 3000);
              }}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${
                isRefreshing 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 opacity-70 cursor-wait"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]"
              }`}
            >
              <span className={`text-xl leading-none ${isRefreshing ? "animate-spin" : ""}`}>⟳</span> 
              {isRefreshing ? "SCANNING..." : "REFRESH"}
            </button>

            {/* Nmap Reader Button */}
            <button
              onClick={() => setNmapReaderOpen(true)}
              className="px-6 py-2 rounded-full font-bold transition-all duration-300 flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            >
              NMAP DECODER
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Devices Online"
            value={stats.online}
            glow="cyan"
          />

          <div onClick={handlePortsClick} className="cursor-pointer">
            <StatCard title="Open Ports" value={stats.ports} glow="cyan" />
          </div>

          <StatCard
            title="Bandwidth"
            value={stats.bandwidth}
            glow="cyan"
          />

          <StatCard
            title="Threat Alerts"
            value={stats.threats}
            glow="cyan"
          />
        </div>

        {/* Main Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Devices */}
          <GlassPanel title="Connected Devices" color="cyan">
            <div className="space-y-4">
              {devices.map((device, index) => (
                <div
                  key={index}
                  onClick={() => handleDeviceClick(device)}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:border-cyan-400 hover:bg-cyan-900/20 cursor-pointer transition-all duration-300"
                >
                  <div>
                    <h2 className="font-bold text-lg">{device.name}</h2>

                    <p className="text-gray-400 text-sm">{device.ip}</p>
                  </div>

                  <span
                    className="px-4 py-1 rounded-full text-sm font-bold bg-cyan-500/20 text-cyan-400 font-mono tracking-widest"
                  >
                    {device.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Traffic */}
          <GlassPanel title="Live Traffic" color="cyan">
            <div className="space-y-6">
              <TrafficBar label="Download" width={`${stats.traffic?.download || 0}%`} value={`${stats.traffic?.download || 0}%`} />
              <TrafficBar label="Upload" width={`${stats.traffic?.upload || 0}%`} value={`${stats.traffic?.upload || 0}%`} />
              <TrafficBar label="Packet Health" width={`${stats.traffic?.packetHealth || 0}%`} value={`${stats.traffic?.packetHealth || 0}%`} />
              <TrafficBar label="Ping Stability" width={`${stats.traffic?.pingStability || 0}%`} value={`${stats.traffic?.pingStability || 0}%`} />
            </div>

            {/* Animated Graph */}
            <div className="mt-8 h-56 bg-black/40 rounded-2xl border border-white/10 flex items-end justify-around p-4 overflow-hidden">
              {[40, 80, 60, 100, 70, 85, 55, 95, 65, 75].map(
                (height, index) => (
                  <div
                    key={index}
                    className="w-5 rounded-t-xl bg-gradient-to-t from-cyan-600 to-teal-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.7)]"
                    style={{
                      height: `${height}%`,
                    }}
                  ></div>
                )
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Packet Logs */}
        <div className="mt-8">
          <GlassPanel title="Packet Sniffer Logs" color="cyan">
            <div className="bg-black/60 rounded-2xl border border-white/10 p-4 h-72 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <p
                  key={index}
                  className={`mb-2 ${
                    log.includes("ALERT")
                      ? "text-red-500 font-bold"
                      : log.includes("WARNING")
                      ? "text-yellow-400"
                      : log.includes("SCAN")
                      ? "text-teal-300"
                      : "text-cyan-500"
                  }`}
                >
                  {log}
                </p>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Cyber Modal */}
      <CyberModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
        content={modalContent} 
        loading={modalLoading} 
      />

      {/* Draggable Terminal */}
      <DraggableTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        title={terminalTitle}
        content={terminalContent}
        loading={terminalLoading}
      />

      <NmapReader 
        isOpen={nmapReaderOpen}
        onClose={() => setNmapReaderOpen(false)}
      />
    </div>
  );
}

/* ========================= */
/* Components */
/* ========================= */

function GlassPanel({ title, children, color }) {
  const colors = {
    cyan: "border-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.15)] text-cyan-300",
    green: "border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.15)] text-green-300",
    purple: "border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.15)] text-purple-300",
    red: "border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.15)] text-red-400",
    blue: "border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)] text-blue-400",
  };

  return (
    <div
      className={`bg-white/5 border rounded-3xl p-6 backdrop-blur-xl ${colors[color]}`}
    >
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {children}
    </div>
  );
}

function StatCard({ title, value, glow }) {
  const glowStyles = {
    cyan: "border-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]",
    green: "border-green-500/20 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.15)]",
    purple: "border-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    red: "border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    blue: "border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  };

  return (
    <div
      className={`bg-white/5 border rounded-3xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 ${glowStyles[glow]}`}
    >
      <p className="text-gray-400 mb-3">{title}</p>

      <h2 className="text-4xl font-extrabold">{value}</h2>
    </div>
  );
}

function TrafficBar({ label, width, value }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span>{label}</span>

        <span>{value}</span>
      </div>

      <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-teal-400 shadow-[0_0_15px_rgba(34,211,238,0.7)]"
          style={{
            width,
          }}
        ></div>
      </div>
    </div>
  );
}

function CyberModal({ isOpen, onClose, title, content, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border border-cyan-500/50 rounded-xl w-full max-w-4xl shadow-[0_0_30px_rgba(34,211,238,0.3)] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-cyan-500/30">
          <h2 className="text-2xl font-bold text-cyan-400 tracking-widest">{title}</h2>
          <button onClick={onClose} className="text-cyan-500 hover:text-cyan-300 text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow font-mono text-sm text-cyan-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="animate-pulse tracking-widest">INITIATING SCAN...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap">{content}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

function DraggableTerminal({ isOpen, onClose, title, content, loading }) {
  const [position, setPosition] = useState({ x: -24, y: -24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setPosition({ x: -24, y: -24 });
    }
  }, [isOpen]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-0 right-0 z-50 flex flex-col animate-slide-up"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="bg-black/95 border border-cyan-500/50 rounded-xl w-[500px] shadow-[0_0_30px_rgba(34,211,238,0.4)] flex flex-col max-h-[500px] min-h-[300px]">
        <div 
          className="flex justify-between items-center p-3 border-b border-cyan-500/30 bg-cyan-900/20 rounded-t-xl cursor-move"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-lg font-bold text-cyan-400 tracking-widest font-mono flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {title}
          </h2>
          <button onClick={onClose} className="text-cyan-500 hover:text-cyan-300 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow font-mono text-sm text-cyan-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="animate-pulse tracking-widest text-xs">INITIATING DEEP SCAN...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-xs">{content}</pre>
          )}
        </div>
      </div>
    </div>
  );
}