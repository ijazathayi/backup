import asyncio
import subprocess
import re
from typing import AsyncGenerator
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=10)

COMMON_PORTS = {
    20: "FTP Data - Used for transferring files.",
    21: "FTP Control - Used for transferring files.",
    22: "SSH (Secure Shell) - Used for secure remote login.",
    23: "Telnet - Unencrypted text communications.",
    25: "SMTP (Simple Mail Transfer Protocol) - Used for email routing.",
    53: "DNS (Domain Name System) - Used to resolve domain names.",
    80: "HTTP (Hypertext Transfer Protocol) - Used for unencrypted web traffic.",
    110: "POP3 - Used for receiving emails.",
    143: "IMAP - Used for receiving emails.",
    443: "HTTPS (HTTP Secure) - Used for secure web traffic.",
    445: "SMB - Used for file sharing on Windows networks.",
    1433: "MSSQL - Default port for Microsoft SQL Server.",
    3306: "MySQL - Default port for MySQL databases.",
    3389: "RDP (Remote Desktop Protocol) - Used for remote desktop connections.",
    5432: "PostgreSQL - Default port for PostgreSQL databases.",
    8080: "HTTP Alternate - Commonly used for web proxies or alternative to port 80.",
    8443: "HTTPS Alternate - Commonly used for alternative secure web traffic."
}

def enrich_nmap_output(line: str) -> str:
    match = re.match(r'^(\d+)/(tcp|udp)\s+open\s+.*', line.strip())
    if match:
        port = int(match.group(1))
        if port in COMMON_PORTS:
            return line.rstrip() + f"  => Explanation: {COMMON_PORTS[port]}\n"
        else:
            return line.rstrip() + "  => Explanation: Open port, service unspecified or custom.\n"
    return line

class NmapService:
    @staticmethod
    async def run_scan(target: str, flags: str) -> AsyncGenerator[str, None]:
        command = ["nmap"] + flags.split() + [target]
        
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            errors='replace'
        )

        loop = asyncio.get_running_loop()

        while True:
            try:
                line = await asyncio.wait_for(
                    loop.run_in_executor(executor, process.stdout.readline), 
                    timeout=3.0
                )
                if not line:
                    break
                line = enrich_nmap_output(line)
                yield line
            except asyncio.TimeoutError:
                # Keep-alive to prevent websocket timeout during long scans
                yield "KEEP_ALIVE"
        
        process.wait()
