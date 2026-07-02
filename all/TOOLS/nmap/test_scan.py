import asyncio
import sys
import os

# Add the current directory to sys.path so we can import backend
sys.path.insert(0, os.path.abspath('.'))

from backend.nmap_service import NmapService

async def main():
    target = "127.0.0.1"
    flags = "-T4 -A -v"
    print(f"Starting scan on {target} with flags {flags}...")
    
    try:
        async for line in NmapService.run_scan(target, flags):
            print(f"OUTPUT: {line.strip()}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    # Windows requires ProactorEventLoop for subprocesses, which is default in 3.8+
    asyncio.run(main())
