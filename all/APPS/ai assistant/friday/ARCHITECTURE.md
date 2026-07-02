# Friday AI Assistant – Architecture v0.2

Friday is a three-layer local voice assistant: a **Rust HTTP core**, a **Python brain**, and a **browser voice interface**.

---

## Layer 1 – Web Voice Interface (`web/`)

| File         | Role |
|--------------|------|
| `index.html` | Shell: orb, controls, settings panel, command grid, text input |
| `styles.css` | Dark glassmorphism design system |
| `app.js`     | Wake-word engine, speech recognition, TTS, history export, settings |

### Key browser features
- **Wake-word detection** — always-on background listener; says "Hey Friday" to wake without clicking anything.
- **Full-session listening** — continuous mode sends every utterance to the Python brain.
- **Text input** — type commands when voice is unavailable.
- **Settings panel** — language, voice rate/pitch, wake word, mute.
- **Chat export** — download the conversation as a `.txt` file.
- **Typing indicator** — three-dot animation while the brain is thinking.
- **Uptime badge** — polls `/api/status` every 10 seconds.

---

## Layer 2 – Rust Core (`rust-core/`)

A zero-dependency (except `serde_json` and `url`) TCP HTTP server.

| Endpoint        | Method | Purpose |
|-----------------|--------|---------|
| `/`             | GET    | Serves `web/index.html` |
| `/api/ask`      | POST   | Forwards `{ command }` to Python brain |
| `/api/status`   | GET    | Returns `{ status, version, uptime_secs }` |
| `/<file>`       | GET    | Serves any file from `web/` |

- Uses `serde_json` for correct JSON parsing.
- Proper project-root resolution (works from `cargo run` or any working directory).
- Structured console logging for every command/reply pair.

---

## Layer 3 – Python Brain (`python-brain/`)

| File          | Role |
|---------------|------|
| `brain.py`    | Intent handler – all skills live here |
| `config.json` | User settings (name, API keys, default city) |
| `memory.json` | Persistent memory items |
| `notes.json`  | Persistent notes |

### Skills (v0.2)

| Category          | Commands |
|-------------------|----------|
| **Greetings**     | hello, hi, good morning/afternoon/evening |
| **Time & Date**   | "what time is it", "what is the date" |
| **Weather**       | "weather in \<city\>" (OpenWeatherMap API) |
| **Calculator**    | "calculate 25 * 48", "what is sqrt 144" |
| **Websites**      | YouTube, Google, Gmail, GitHub, Twitter/X, Reddit, LinkedIn, Spotify, Netflix, ChatGPT |
| **Search**        | "search for \<query\>", "look up \<topic\>" |
| **YouTube Play**  | "play lo-fi music" |
| **Open Apps**     | "open calculator / notepad / vscode / spotify" etc. |
| **Volume**        | "set volume to 70", "mute", "unmute" |
| **Notes**         | "note down \<text\>", "show notes", "clear notes" |
| **Memory**        | "remember \<text\>", "what do you remember", "clear memory" |
| **Jokes**         | rotating set of 8 developer jokes |
| **Help**          | "what can you do?" |
| **AI Fallback**   | OpenAI GPT-4o-mini for unrecognised commands |

---

## Configuration (`python-brain/config.json`)

```json
{
  "user_name":        "Boss",
  "default_city":     "London",
  "weather_api_key":  "get free key at openweathermap.org",
  "openai_api_key":   "sk-...",
  "openai_model":     "gpt-4o-mini"
}
```

---

## How to Run

```powershell
.\start-friday.ps1
```

Then open **http://127.0.0.1:7878** in Chrome or Edge.

---

## How to Add a New Skill

Open `python-brain/brain.py`, add a condition inside `handle()`:

```python
if "open calculator" in text:
    return open_application("calculator")
```

---

## Future Upgrades

- Offline speech recognition (Whisper / vosk)
- Wake-word with Porcupine for true always-on desktop mode
- Computer vision (screenshot analysis)
- Plugin system (load `.py` skill files from a `skills/` folder)
- Encrypted memory store
- Multi-user profiles
- Desktop tray app (Tauri wrapper)
