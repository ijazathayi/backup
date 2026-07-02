from fastapi import FastAPI, WebSocket, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.nmap_service import NmapService
import json
import asyncio
import socket
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/myip")
def get_my_ip():
    try:
        # Create a dummy socket to find the local IP used for internet routing
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return {"ip": ip}
    except Exception:
        return {"ip": "127.0.0.1"}

@app.websocket("/ws/scan")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        params = json.loads(data)
        target = params.get("target")
        flags = params.get("flags", "")
        
        if not target:
            await websocket.send_text(json.dumps({"error": "Backend: Target is required"}))
            await websocket.close()
            return
            
        async for line in NmapService.run_scan(target, flags):
            await websocket.send_text(json.dumps({"type": "output", "data": line}))
            
        await websocket.send_text(json.dumps({"type": "done"}))
    except Exception as e:
        err_msg = traceback.format_exc()
        await websocket.send_text(json.dumps({"error": err_msg}))
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
