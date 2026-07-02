import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [target, setTarget] = useState('');
  const [flags, setFlags] = useState('-sV -T4 -O -F --version-light');
  const [output, setOutput] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFindingIp, setIsFindingIp] = useState(false);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const terminalEndRef = useRef(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  const startScan = (e) => {
    e.preventDefault();
    if (!target.trim()) {
      setError('Frontend: Target IP or Domain is required before starting the scan.');
      return;
    }
    
    setError(null);
    setOutput([]);
    setIsScanning(true);

    ws.current = new WebSocket('ws://localhost:8000/ws/scan');
    
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ target, flags }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'output') {
        if (message.data === 'KEEP_ALIVE') return;
        setOutput((prev) => [...prev, message.data]);
      } else if (message.type === 'done') {
        setIsScanning(false);
        ws.current.close();
      } else if (message.error) {
        setError(message.error);
        setIsScanning(false);
        ws.current.close();
      }
    };

    ws.current.onerror = (err) => {
      setError('WebSocket connection error. Is the backend running?');
      setIsScanning(false);
    };
    
    ws.current.onclose = () => {
      setIsScanning(false);
    };
  };

  const stopScan = () => {
    if (ws.current) {
      ws.current.close();
      setIsScanning(false);
    }
  };

  const findMyIp = async () => {
    setIsFindingIp(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/myip');
      const data = await response.json();
      if (data.ip) {
        setTarget(data.ip);
      }
    } catch (err) {
      setError('Could not fetch IP. Is the backend running?');
    } finally {
      setIsFindingIp(false);
    }
  };

  const findMySubnet = async (cidr) => {
    setIsFindingIp(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/myip');
      const data = await response.json();
      if (data.ip) {
        setTarget(`${data.ip}/${cidr}`);
      }
    } catch (err) {
      setError('Could not fetch IP. Is the backend running?');
    } finally {
      setIsFindingIp(false);
    }
  };


  const nmapCommands = [
    {
      group: "Host Discovery",
      commands: [
        { name: 'List Scan (No Ping)', flags: '-sL' },
        { name: 'Ping Scan (Disable Port Scan)', flags: '-sn' },
        { name: 'Treat all hosts as online', flags: '-Pn' },
        { name: 'TCP SYN/ACK, UDP discovery', flags: '-PS/PA/PU/PY' },
        { name: 'ICMP echo/timestamp/netmask request', flags: '-PE/PP/PM' },
        { name: 'Traceroute', flags: '--traceroute' }
      ]
    },
    {
      group: "Scan Techniques",
      commands: [
        { name: 'TCP SYN (Stealth) Scan', flags: '-sS' },
        { name: 'TCP Connect Scan', flags: '-sT' },
        { name: 'UDP Scan', flags: '-sU' },
        { name: 'TCP NULL Scan', flags: '-sN' },
        { name: 'TCP FIN Scan', flags: '-sF' },
        { name: 'TCP Xmas Scan', flags: '-sX' },
        { name: 'TCP ACK Scan', flags: '-sA' }
      ]
    },
    {
      group: "Port Specification",
      commands: [
        { name: 'Fast Scan (Top 100 ports)', flags: '-F' },
        { name: 'Scan all 65535 ports', flags: '-p-' },
        { name: 'Scan specific ports (e.g. 80,443)', flags: '-p 80,443' },
        { name: 'Scan top 2000 ports', flags: '--top-ports 2000' }
      ]
    },
    {
      group: "Service & OS Detection",
      commands: [
        { name: 'Enable OS Detection', flags: '-O' },
        { name: 'Service/Version Detection', flags: '-sV' },
        { name: 'Light Version Detection', flags: '-sV --version-light' },
        { name: 'Aggressive OS & Service Detection', flags: '-A' }
      ]
    },
    {
      group: "Timing & Performance",
      commands: [
        { name: 'Paranoid (T0)', flags: '-T0' },
        { name: 'Sneaky (T1)', flags: '-T1' },
        { name: 'Polite (T2)', flags: '-T2' },
        { name: 'Normal (T3)', flags: '-T3' },
        { name: 'Aggressive (T4)', flags: '-T4' },
        { name: 'Insane (T5)', flags: '-T5' }
      ]
    },
    {
      group: "Script Engine (NSE)",
      commands: [
        { name: 'Default Scripts', flags: '-sC' },
        { name: 'Vulnerability Scripts', flags: '--script vuln' },
        { name: 'Safe Scripts', flags: '--script safe' },
        { name: 'Malware Discovery', flags: '--script malware' }
      ]
    },
    {
      group: "Firewall Evasion",
      commands: [
        { name: 'Fragment Packets', flags: '-f' },
        { name: 'Specify MTU (e.g. 24)', flags: '--mtu 24' },
        { name: 'Decoy Scan', flags: '-D RND:10' },
        { name: 'Spoof MAC Address', flags: '--spoof-mac 0' }
      ]
    },
    {
      group: "Common Combos",
      commands: [
        { name: 'Quick Scan', flags: '-T4 -F' },
        { name: 'Intense Scan', flags: '-T4 -A -v' },
        { name: 'Intense Scan (All TCP Ports)', flags: '-p 1-65535 -T4 -A -v' },
        { name: 'Intense Scan + UDP', flags: '-sS -sU -T4 -A -v' }
      ]
    }
  ];

  return (
    <div className="app-container">
      <div className="glass-panel sidebar">
        <h1 className="brand-title">
          <span className="gradient-text">Nmap</span> Studio
        </h1>
        
        <form className="scan-form" onSubmit={startScan}>
          <div className="form-group">
            <label>Target IP / Domain</label>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="e.g. 192.168.1.1 or scanme.nmap.org" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isScanning}
              />
            </div>
            <div className="button-group">
              <button 
                type="button" 
                className="find-ip-btn" 
                onClick={findMyIp}
                disabled={isScanning || isFindingIp}
                title="Find local IP address"
              >
                {isFindingIp ? '...' : 'My IP'}
              </button>
              <button 
                type="button" 
                className="find-ip-btn" 
                onClick={() => findMySubnet(24)}
                disabled={isScanning || isFindingIp}
                title="Scan local subnet (/24)"
              >
                {isFindingIp ? '...' : 'Subnet /24'}
              </button>
              <button 
                type="button" 
                className="find-ip-btn" 
                onClick={() => findMySubnet(25)}
                disabled={isScanning || isFindingIp}
                title="Scan local subnet (/25)"
              >
                {isFindingIp ? '...' : 'Subnet /25'}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>Nmap Flags</label>
            <input 
              type="text" 
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              disabled={isScanning}
            />
          </div>

          <div className="form-group">
            <label>Command Presets</label>
            <select 
              className="command-select"
              onChange={(e) => {
                if (e.target.value) setFlags(e.target.value);
              }}
              defaultValue=""
              disabled={isScanning}
            >
              <option value="" disabled>Select a command preset to populate flags...</option>
              {nmapCommands.map((group, gIdx) => (
                <optgroup key={gIdx} label={group.group}>
                  {group.commands.map((cmd, cIdx) => (
                    <option key={cIdx} value={cmd.flags}>
                      {cmd.name} ({cmd.flags})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="action-buttons">
            {!isScanning ? (
              <button type="submit" className="primary-btn pulse-glow">
                Start Scan
              </button>
            ) : (
              <button type="button" className="danger-btn" onClick={stopScan}>
                Stop Scan
              </button>
            )}
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="main-content">
        <div className="terminal-container glass-panel">
          <div className="terminal-header">
            <div className="mac-buttons">
              <span className="close"></span>
              <span className="minimize"></span>
              <span className="maximize"></span>
            </div>
            <div className="terminal-title">Terminal Output</div>
          </div>
          <div className="terminal-body">
            {output.length === 0 && !isScanning && (
              <div className="terminal-placeholder">
                Enter a target and start a scan...
              </div>
            )}
            {output.map((line, idx) => (
              <div key={idx} className="terminal-line">{line}</div>
            ))}
            {isScanning && (
              <div className="terminal-line scanning-indicator">Scanning...<span className="cursor"></span></div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
