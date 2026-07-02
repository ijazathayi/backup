import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/scan"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            payload = {"target": "127.0.0.1", "flags": "-T4 -A -v"}
            print(f"Sending payload: {payload}")
            await websocket.send(json.dumps(payload))
            
            while True:
                try:
                    response = await websocket.recv()
                    data = json.loads(response)
                    
                    if data.get("type") == "output":
                        print(f"WS RECEIVED: {data['data'].strip()}")
                    elif data.get("type") == "done":
                        print("WS DONE")
                        break
                    elif data.get("error"):
                        print(f"WS ERROR: {data['error']}")
                        break
                except websockets.exceptions.ConnectionClosed:
                    print("Connection closed by server.")
                    break
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
