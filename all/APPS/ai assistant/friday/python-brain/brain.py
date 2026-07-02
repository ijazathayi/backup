"""
Friday AI Assistant - Python Brain
Fetches real answers from DuckDuckGo + Wikipedia. No API keys needed.
"""

import datetime as dt
import json
import math
import os
import platform
import random
import re
import subprocess
import sys
import urllib.parse
import urllib.request
import webbrowser

ROOT        = os.path.dirname(os.path.abspath(__file__))
MEMORY_FILE = os.path.join(ROOT, "memory.json")
NOTES_FILE  = os.path.join(ROOT, "notes.json")
CONFIG_FILE = os.path.join(ROOT, "config.json")


def load_config():
    defaults = {"user_name": "Boss", "default_city": "London"}
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(defaults, f, indent=2)
        return defaults
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {**defaults, **data}


def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def reply(speech, status="ok"):
    print(json.dumps({"status": status, "speech": speech}, ensure_ascii=False))


def normalize(text):
    text = text.lower().strip()
    text = re.sub(r"^[\s,.]*(hey friday|hi friday|ok friday|friday)[,.\s]*", "", text)
    return text.strip()


# ── Web answer engine ─────────────────────────────────────────────────────────

def _http_get(url, timeout=6):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Friday-AI/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception:
        return None


def _clean(text):
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _sentences(text, n=2):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return " ".join(parts[:n])


def duckduckgo_answer(query):
    url = "https://api.duckduckgo.com/?q={}&format=json&no_redirect=1&skip_disambig=1".format(
        urllib.parse.quote_plus(query)
    )
    raw = _http_get(url)
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except Exception:
        return None

    abstract = _clean(data.get("AbstractText", ""))
    if len(abstract) > 40:
        return _sentences(abstract, 2)

    answer = _clean(data.get("Answer", ""))
    if len(answer) > 2:
        return answer

    definition = _clean(data.get("Definition", ""))
    if len(definition) > 20:
        return _sentences(definition, 2)

    for topic in data.get("RelatedTopics", []):
        if isinstance(topic, dict):
            t = _clean(topic.get("Text", ""))
            if len(t) > 30:
                return _sentences(t, 2)
    return None


def wikipedia_answer(query):
    search_url = (
        "https://en.wikipedia.org/w/api.php?action=query&list=search"
        "&srsearch={}&format=json&srlimit=1".format(urllib.parse.quote_plus(query))
    )
    raw = _http_get(search_url)
    if not raw:
        return None
    try:
        title = json.loads(raw)["query"]["search"][0]["title"]
    except Exception:
        return None

    extract_url = (
        "https://en.wikipedia.org/w/api.php?action=query&prop=extracts"
        "&exintro&explaintext&titles={}&format=json".format(urllib.parse.quote_plus(title))
    )
    raw2 = _http_get(extract_url)
    if not raw2:
        return None
    try:
        pages = json.loads(raw2)["query"]["pages"]
        extract = next(iter(pages.values())).get("extract", "")
        if len(extract) > 40:
            return _sentences(_clean(extract), 2)
    except Exception:
        return None
    return None


def clean_query(text):
    query = text.lower().strip()
    # Remove phrases like "can you tell me about", "will you tell me about", "tell me about", "tell me"
    query = re.sub(r"^(?:will|can|could|would|please)?\s*(?:you\s+)?(?:tell\s+me|show\s+me|search|find|look\s+up|explain|details)\s*(?:about|on|for|of)?\s*", "", query)
    # Remove "what is", "who is", "what are", "who are", "where is", "why is" etc. at the start
    query = re.sub(r"^(?:what|who|where|which|how|why)\s+(?:is|are|was|were|does|did|can|do|about)\s*", "", query)
    return query.strip("?.! ")


def web_answer(query):
    cleaned = clean_query(query)
    search_q = cleaned if cleaned else query
    answer = duckduckgo_answer(search_q) or wikipedia_answer(search_q)
    if answer:
        return answer
    webbrowser.open("https://www.google.com/search?q={}".format(urllib.parse.quote_plus(search_q)))
    return "I could not get a spoken answer, so I opened a browser search for {}.".format(search_q)


# ── Calculator ────────────────────────────────────────────────────────────────

_MATH_NS = {k: v for k, v in vars(math).items() if not k.startswith("_")}
_MATH_NS.update({"abs": abs, "round": round, "pow": pow, "int": int, "float": float})


def safe_calc(expr):
    cleaned = re.sub(r"[^0-9+\-*/().%^ a-z]", "", expr.lower()).replace("^", "**")
    try:
        result = eval(cleaned, {"__builtins__": {}}, _MATH_NS)  # noqa: S307
        if isinstance(result, float) and result.is_integer():
            return "The answer is {}.".format(int(result))
        return "The answer is {}.".format(result)
    except Exception:
        return "I could not calculate that. Try saying: calculate 25 times 4."


# ── Notes ─────────────────────────────────────────────────────────────────────

def add_note(text):
    notes = load_json(NOTES_FILE)
    notes.append({"text": text, "at": dt.datetime.now().isoformat(timespec="seconds")})
    save_json(NOTES_FILE, notes)
    return "Note saved: {}.".format(text)


def read_notes():
    notes = load_json(NOTES_FILE)
    if not notes:
        return "You have no saved notes."
    lines = "; ".join("{}.{}".format(i + 1, n["text"]) for i, n in enumerate(notes[-6:]))
    return "Your notes: {}.".format(lines)


def clear_notes():
    save_json(NOTES_FILE, [])
    return "All notes cleared."


# ── Memory ────────────────────────────────────────────────────────────────────

def remember(item):
    memory = load_json(MEMORY_FILE)
    memory.append({"text": item, "at": dt.datetime.now().isoformat(timespec="seconds")})
    save_json(MEMORY_FILE, memory)
    return "Got it. I will remember: {}.".format(item)


def recall():
    memory = load_json(MEMORY_FILE)
    if not memory:
        return "I have no saved memories yet."
    return "I remember: {}.".format("; ".join(m["text"] for m in memory[-6:]))


def clear_memory():
    save_json(MEMORY_FILE, [])
    return "Memory cleared."


# ── Open app ──────────────────────────────────────────────────────────────────

_APPS_WIN = {
    "calculator":   "calc.exe",
    "notepad":      "notepad.exe",
    "paint":        "mspaint.exe",
    "explorer":     "explorer.exe",
    "cmd":          "cmd.exe",
    "task manager": "taskmgr.exe",
    "settings":     "ms-settings:",
    "vscode":       "code",
    "word":         "winword",
    "excel":        "excel",
    "powerpoint":   "powerpnt",
    "chrome":       "chrome",
    "edge":         "msedge",
    "spotify":      "spotify",
}


def open_app(name):
    if platform.system() != "Windows":
        return "App launching is only supported on Windows right now."
    target = _APPS_WIN.get(name.lower())
    try:
        os.startfile(target or name)
        return "Opening {}.".format(name)
    except Exception:
        try:
            subprocess.Popen(name)
            return "Trying to open {}.".format(name)
        except Exception:
            return "I could not find an application called {}.".format(name)


# ── Volume ────────────────────────────────────────────────────────────────────

def set_volume(level):
    if platform.system() != "Windows":
        return "Volume control is only supported on Windows."
    level = max(0, min(100, int(level)))
    script = (
        "Add-Type -TypeDefinition '"
        "using System.Runtime.InteropServices;"
        "public class V"
        "{[DllImport(\"winmm.dll\")]"
        "public static extern int waveOutSetVolume(System.IntPtr h,uint v);}'; "
        "$v=[uint32]({}/100.0*65535); [V]::waveOutSetVolume([System.IntPtr]::Zero,$v*65536+$v);".format(level)
    )
    try:
        subprocess.run(["powershell", "-Command", script], timeout=5, capture_output=True)
        return "Volume set to {} percent.".format(level)
    except Exception as e:
        return "Could not change volume: {}.".format(e)


# ── Jokes & motivation ────────────────────────────────────────────────────────

_JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "Debugging is like detective work, except the suspect is usually your own code.",
    "There are 10 types of people: those who understand binary and those who don't.",
    "A SQL query walks into a bar, approaches two tables, and asks: Can I join you?",
    "Why did the developer go broke? Because they used up all their cache.",
    "Why do Java developers wear glasses? Because they don't C#.",
    "I asked my computer to play good music. It said: No such file or directory.",
    "A programmer's wife says: go get a litre of milk, if they have eggs get a dozen. He came back with 12 litres of milk.",
    "How many programmers does it take to change a lightbulb? None, that is a hardware problem.",
    "Why was the JavaScript developer sad? Because they did not know how to null their feelings.",
]
_joke_idx = [0]


def next_joke():
    j = _JOKES[_joke_idx[0] % len(_JOKES)]
    _joke_idx[0] += 1
    return j


_MOTIVATIONAL = [
    "Every expert was once a beginner. Keep going.",
    "The only way to do great work is to love what you do.",
    "Small steps every day lead to big results over time.",
    "Your only competition is who you were yesterday.",
    "Difficult roads often lead to beautiful destinations.",
    "Believe in yourself. You have survived every hard day so far.",
    "Progress, not perfection.",
    "The best time to start was yesterday. The second best time is now.",
]


# ── Main handler ──────────────────────────────────────────────────────────────

def handle(command):
    config = load_config()
    name = config.get("user_name", "Boss")
    text = normalize(command)

    if not text:
        return "I am online, {}. What can I do for you?".format(name)

    # Greetings
    if re.search(r"^(hello|hi|hey|good morning|good evening|good afternoon|greetings|howdy|what.?s up)", text):
        hour = dt.datetime.now().hour
        g = "Good morning" if hour < 12 else "Good afternoon" if hour < 18 else "Good evening"
        return "{}, {}. I am Friday. How can I help you?".format(g, name)

    # Identity
    if re.search(r"(who are you|what are you|your name|introduce yourself)", text):
        return (
            "I am Friday, your personal AI assistant built by Ijaz Corporation. "
            "I run on a Rust core and Python brain, and I fetch real answers from the web for you."
        )

    if re.search(r"(who (made|built|created) you|your (creator|developer|maker))", text):
        return "I was created by Ijaz Corporation as your personal voice AI assistant."

    # Help
    if re.search(r"(what can you do|your skills|help me|your abilities|your features)", text):
        return (
            "I can tell the time and date, do maths, answer any question by searching the web, "
            "open websites and apps, play YouTube, save notes and memories, "
            "tell jokes, give motivation, and control volume. Just speak naturally."
        )

    # Time
    if re.search(r"\btime\b", text) and not re.search(r"\b(date|day|today)\b", text):
        return "The time is {}.".format(dt.datetime.now().strftime("%I:%M %p"))

    # Date
    if re.search(r"\b(date|day|today|what day|what month|what year)\b", text):
        return "Today is {}.".format(dt.datetime.now().strftime("%A, %B %d, %Y"))

    # Calculator
    calc_m = re.search(r"(?:calculate|compute|what(?:.?s| is)|how much is|evaluate|work out|solve)\s+(.+)", text)
    if calc_m:
        return safe_calc(calc_m.group(1))
    if re.match(r"^[\d\s+\-*/().^%sqrtlogpowi]+$", text) and any(c.isdigit() for c in text):
        return safe_calc(text)

    # Notes
    note_m = re.match(r"(?:add note|take note|note down|write down|save note|note that)\s+(.+)", text)
    if note_m:
        return add_note(note_m.group(1).strip())
    if re.search(r"(read notes|show notes|my notes|list notes)", text):
        return read_notes()
    if re.search(r"clear notes|delete notes", text):
        return clear_notes()

    # Memory
    rem_m = re.match(r"remember\s+(.+)", text)
    if rem_m:
        return remember(rem_m.group(1).strip())
    if re.search(r"(what do you remember|show memory|your memory|recall|what did i tell you)", text):
        return recall()
    if re.search(r"clear memory|forget everything", text):
        return clear_memory()

    # Websites
    _sites = [
        ("youtube",       "https://www.youtube.com"),
        ("google",        "https://www.google.com"),
        ("gmail",         "https://mail.google.com"),
        ("github",        "https://github.com"),
        ("twitter",       "https://x.com"),
        ("reddit",        "https://www.reddit.com"),
        ("linkedin",      "https://www.linkedin.com"),
        ("spotify",       "https://open.spotify.com"),
        ("netflix",       "https://www.netflix.com"),
        ("chatgpt",       "https://chat.openai.com"),
        ("amazon",        "https://www.amazon.com"),
        ("wikipedia",     "https://www.wikipedia.org"),
        ("stackoverflow", "https://stackoverflow.com"),
    ]
    for keyword, url in _sites:
        if re.search(r"open\s+" + keyword, text):
            webbrowser.open(url)
            return "Opening {}.".format(keyword.capitalize())

    # YouTube play
    yt_m = re.match(r"(?:play|youtube|watch)\s+(.+)", text)
    if yt_m:
        q = yt_m.group(1).strip()
        webbrowser.open("https://www.youtube.com/results?search_query={}".format(
            urllib.parse.quote_plus(q)))
        return "Playing {} on YouTube.".format(q)

    # Open app
    app_m = re.match(r"open\s+(.+)", text)
    if app_m:
        return open_app(app_m.group(1).strip())

    # Volume
    vol_m = re.search(r"(?:set volume|volume)\s+(?:to\s+)?(\d+)", text)
    if vol_m:
        return set_volume(vol_m.group(1))
    if re.search(r"\bmute\b", text):
        return set_volume(0)
    if re.search(r"\bunmute\b|max volume|full volume", text):
        return set_volume(100)

    # Jokes
    if re.search(r"\b(joke|funny|laugh|humor|humour)\b", text):
        return next_joke()

    # Motivation
    if re.search(r"(motivate|motivation|inspire|encouragement|cheer me up|i feel (sad|down|bad|depressed|low))", text):
        return random.choice(_MOTIVATIONAL)

    # Feelings
    if re.search(r"(how are you|are you ok|you good)", text):
        return "I am running perfectly, {}. All systems online.".format(name)

    if re.search(r"(thank you|thanks|thank u|thx)", text):
        return "You are welcome, {}. Always happy to help.".format(name)

    if re.search(r"(i love you|you are (great|amazing|awesome|the best))", text):
        return "That means a lot, {}. I will always be here for you.".format(name)

    # Goodbye
    if re.search(r"\b(goodbye|bye|goodnight|good night|see you|standby|stop)\b", text):
        return "Goodbye, {}. Call me whenever you need me.".format(name)

    # Any question or search — fetch from web
    if re.search(r"\b(who|what|where|when|why|how|is|are|was|were|did|does|can|which|tell me|explain|search|find|look up)\b", text) or "?" in command:
        return web_answer(text.rstrip("?"))

    return (
        "I am not sure about that, {}. "
        "Try asking me a question and I will look it up for you.".format(name)
    )


if __name__ == "__main__":
    command_text = sys.stdin.read().strip()
    try:
        reply(handle(command_text))
    except Exception as error:
        reply("Brain error: {}".format(error), status="error")
