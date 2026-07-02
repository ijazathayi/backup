# Friday AI Assistant

Friday is a local multi-language voice assistant foundation inspired by the kind of system Tony Stark uses in fiction.

This is not movie-level artificial general intelligence, but it is structured like a real assistant platform:

- Rust core for the fast local control server
- Python brain for command understanding and assistant logic
- Web dashboard for microphone input, text-to-speech, and conversation view

## Project Layout

```text
friday/
  rust-core/       Local server and system command bridge
  python-brain/    Assistant reasoning, commands, and memory
  web/             Voice UI and dashboard
```

## What Friday Can Do

- Listen through the browser microphone
- Speak replies back through the browser
- Understand simple commands
- Open websites
- Search the web
- Tell the time and date
- Save and recall simple memories
- Route user commands through Python
- Run through a Rust local server

## Requirements

- Rust
- Python 3
- Chrome or Microsoft Edge

If Rust is missing, install it from:

```text
https://rustup.rs
```

If Python is missing, install Python 3 from:

```text
https://www.python.org/downloads/
```

When installing Python on Windows, enable `Add python.exe to PATH`.

## Run

From this folder:

```powershell
cd friday
.\start-friday.ps1
```

Then open:

```text
http://127.0.0.1:7878
```

Press `Start Listening`, allow microphone access, and say things like:

- "Friday, what time is it?"
- "Friday, open YouTube"
- "Friday, search for artificial intelligence"
- "Friday, remember my favorite color is blue"
- "Friday, what do you remember?"

## Notes

The Rust server calls the Python brain for assistant decisions. The browser handles voice recognition and speech output because modern browsers already provide those features safely.

## Current Machine Check

Rust and Python must be installed before the full version can run. The launcher checks this automatically.
