import { useState, useEffect, useRef } from "react";
import "./App.css";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioMode, setAudioMode] = useState("unmuted");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [wakeWordMode, setWakeWordMode] = useState(true);
  const [isConversing, setIsConversing] = useState(false);
  const conversationTimeoutRef = useRef(null);

  // Voice & Speech Settings
  const [speakResponses, setSpeakResponses] = useState(true);
  const [pitch, setPitch] = useState(0.95);
  const [rate, setRate] = useState(1.05);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  // Notes State
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("voice_notes");
    return saved ? JSON.parse(saved) : [
      "Say 'note down build dashboard UI' to save a new note.",
      "Say 'clear notes' to empty this list."
    ];
  });

  // Reminders State
  const [reminders, setReminders] = useState([]);

  // Desktop Launcher Integration
  const [isLauncherRunning, setIsLauncherRunning] = useState(false);
  const [launcherError, setLauncherError] = useState("");

  const checkLauncherStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/status");
      if (response.ok) {
        const text = await response.text();
        if (text.trim() === "online") {
          setIsLauncherRunning(true);
          setLauncherError("");
          return true;
        }
      }
    } catch (e) {
      try {
        const response = await fetch("http://localhost:3001/status");
        if (response.ok) {
          const text = await response.text();
          if (text.trim() === "online") {
            setIsLauncherRunning(true);
            setLauncherError("");
            return true;
          }
        }
      } catch (err) {
        setLauncherError(err.message || "Failed to fetch");
      }
    }
    setIsLauncherRunning(false);
    return false;
  };

  useEffect(() => {
    checkLauncherStatus();
    const interval = setInterval(checkLauncherStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const [stats, setStats] = useState({
    sessions: 1,
    commands: 0,
    sensitivity: "HIGH",
    alerts: 0,
    telemetry: {
      processing: 0,
      clarity: 0,
      latency: 0,
      uplink: 0
    }
  });

  const [logs, setLogs] = useState([
    "[INFO] Initializing acoustic sensors...",
    "[SYSTEM] Voice Assistant Interface ready."
  ]);
  
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const animationRef = useRef(null);

  // Sync Notes to LocalStorage
  useEffect(() => {
    localStorage.setItem("voice_notes", JSON.stringify(notes));
  }, [notes]);

  // Load SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoiceName) {
          const preferred = availableVoices.find(v => v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural"))) || availableVoices[0];
          if (preferred) {
            setSelectedVoiceName(preferred.name);
          }
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceName]);

  // Keep a ref of parameters for the reminder interval to avoid stale closures
  const speakParamsRef = useRef({ audioMode, speakResponses, pitch, rate, selectedVoiceName, voices });
  useEffect(() => {
    speakParamsRef.current = { audioMode, speakResponses, pitch, rate, selectedVoiceName, voices };
  }, [audioMode, speakResponses, pitch, rate, selectedVoiceName, voices]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = wakeWordMode || isConversing;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        if (isConversing) {
          addLog("Listening for conversational reply...", "ACTIVE");
        } else if (wakeWordMode) {
          addLog("Listening passively for 'Adam'...", "INFO");
        } else {
          addLog("Listening...", "ACTIVE");
        }
      };

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.toLowerCase();
        
        if (wakeWordMode && !isConversing) {
          if (transcript.includes("adam")) {
             const commandText = transcript.substring(transcript.indexOf("adam") + 4).trim();
             addLog(`Wake word detected! Processing: "${commandText}"`, "SUCCESS");
             setStats(prev => ({...prev, commands: prev.commands + 1}));
             
             // Enter conversational mode
             setIsConversing(true);
             if (conversationTimeoutRef.current) clearTimeout(conversationTimeoutRef.current);
             
             if (commandText) {
                processCommand(commandText);
             } else {
                speak("Yes?");
             }
          }
        } else {
          // Conversational or manual mode (no wake word needed)
          addLog(`You: "${transcript}"`, "USER");
          setStats(prev => ({...prev, commands: prev.commands + 1}));
          
          if (isConversing) {
             if (conversationTimeoutRef.current) clearTimeout(conversationTimeoutRef.current);
          }
          processCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          addLog(`Error: ${event.error}`, "SYSTEM");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if ((wakeWordMode || isConversing) && !isSpeaking && audioMode !== "muted") {
           // Auto-restart passive listening
           setTimeout(() => {
             try { recognitionRef.current?.start(); } catch(e) {}
           }, 500);
        }
      };

      recognitionRef.current = recognition;
      
      if (wakeWordMode || isConversing) {
        try { recognition.start(); } catch(e) {}
      }
    } else {
      addLog("Speech Recognition API not supported in this browser.", "SYSTEM");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [wakeWordMode, isSpeaking, audioMode, isConversing]);

  // Hook into speak() completion to keep conversation active
  useEffect(() => {
    if (!isSpeaking && isConversing) {
       // Start conversation timeout when AI finishes speaking
       if (conversationTimeoutRef.current) clearTimeout(conversationTimeoutRef.current);
       conversationTimeoutRef.current = setTimeout(() => {
          setIsConversing(false);
          addLog("Conversation timed out, returning to passive wake word mode.", "SYSTEM");
       }, 15000); // 15 seconds to reply
    }
  }, [isSpeaking, isConversing]);

  // Simulating sound visualizer and telemetry when listening or speaking
  useEffect(() => {
    if (isListening || isSpeaking) {
      const updateAudioLevel = () => {
        setAudioLevel(Math.floor(Math.random() * 90) + 10);
        setStats(prev => ({
          ...prev,
          telemetry: {
            processing: Math.floor(Math.random() * 40) + 60,
            clarity: isListening ? Math.floor(Math.random() * 20) + 80 : 100,
            latency: Math.floor(Math.random() * 30) + 10,
            uplink: Math.floor(Math.random() * 50) + 50
          }
        }));
        animationRef.current = setTimeout(updateAudioLevel, 100);
      };
      updateAudioLevel();
    } else {
      setAudioLevel(0);
      setStats(prev => ({
        ...prev,
        telemetry: { processing: 0, clarity: 0, latency: 0, uplink: 0 }
      }));
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isListening, isSpeaking]);

  const addLog = (message, type = "INFO") => {
    setLogs((prev) => [`[${type}] ${message}`, ...prev].slice(0, 20));
  };

  const speak = (text) => {
    if (audioMode === "muted" || !speakResponses) {
      addLog(`[Silent Reply] Assistant: "${text}"`, "SUCCESS");
      return;
    }
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
    addLog(`Assistant: "${text}"`, "SUCCESS");
  };

  const triggerReminderAlert = (text) => {
    addLog(`[ALARM] Timer ended: "${text}"`, "WARNING");
    setStats(prev => ({ ...prev, alerts: prev.alerts + 1 }));
    
    const { audioMode, speakResponses, pitch, rate, selectedVoiceName, voices } = speakParamsRef.current;
    
    if (audioMode === "muted" || !speakResponses) return;
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Reminder: ${text}`);
      if (selectedVoiceName) {
        const voice = voices.find(v => v.name === selectedVoiceName);
        if (voice) utterance.voice = voice;
      }
      utterance.pitch = pitch;
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setReminders((prev) => {
        const updated = [];
        prev.forEach((r) => {
          if (r.secondsLeft <= 1) {
            triggerReminderAlert(r.text);
          } else {
            updated.push({ ...r, secondsLeft: r.secondsLeft - 1 });
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const processCommand = (text) => {
    const command = text.toLowerCase().trim();
    
    setTimeout(() => {
      // 1. HELP / CAPABILITIES
      if (command === "help" || command === "commands" || 
          command.includes("what can you do") || 
          command.includes("show commands") ||
          command.includes("what type of assist") ||
          command.includes("how can you assist") ||
          command.includes("how you can assist") ||
          command.includes("what assistance") ||
          command.includes("what help") ||
          command.includes("how to use")) {
        speak("I can help you take notes, set timers, open websites, search the web, calculate math, or tell jokes. Check the command directory on your screen.");
        return;
      }
      
      // 2. CLEAR LOGS / REFRESH
      if (command === "clear" || command === "clear logs") {
        setLogs(["[SYSTEM] Logs cleared."]);
        speak("Logs have been cleared.");
        return;
      }
      
      // 3. JOKES
      if (command.includes("joke") || command.includes("tell me a joke")) {
        const jokes = [
          "Why do programmers wear glasses? Because they can't C#.",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "There are 10 types of people in the world: those who understand binary, and those who don't.",
          "Why did the programmer quit his job? Because he didn't get arrays.",
          "What is a programmer's favorite hangout place? Foo Bar."
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        speak(randomJoke);
        return;
      }
      
      // 4. NOTE TAKING
      if (/^(note down|take note|add note)\s+/i.test(command)) {
        const noteText = text.replace(/^(note down|take note|add note)\s+/i, "").trim();
        if (noteText) {
          setNotes((prev) => [noteText, ...prev]);
          speak(`Added note: ${noteText}`);
        } else {
          speak("What note would you like me to take?");
        }
        return;
      }
      
      if (command === "clear notes" || command === "delete all notes") {
        setNotes([]);
        speak("Notes cleared.");
        return;
      }
      
      // 5. TIMER / REMINDERS
      // Matches "remind me in 10 seconds to stretch" or "timer 30 seconds to walk" or "remind me in 5 minutes to drink water"
      const reminderRegex = /(?:remind me in|timer)\s+(\d+)\s*(second|sec|minute|min|hour|hr)s?\s+(?:to\s+)?(.+)/i;
      const match = text.match(reminderRegex);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const task = match[3];
        
        let multiplier = 1;
        if (unit.startsWith("min")) multiplier = 60;
        else if (unit.startsWith("hour") || unit.startsWith("hr")) multiplier = 3600;
        
        const seconds = value * multiplier;
        const newReminder = {
          id: Date.now(),
          text: task,
          secondsLeft: seconds,
          totalSeconds: seconds
        };
        setReminders((prev) => [...prev, newReminder]);
        speak(`Reminder set for ${value} ${unit}s to ${task}.`);
        return;
      }

      // Simpler reminder matching: "timer 15 seconds"
      const simpleReminderRegex = /(?:remind me in|timer)\s+(\d+)\s*(second|sec|minute|min)s?/i;
      const simpleMatch = text.match(simpleReminderRegex);
      if (simpleMatch) {
        const value = parseInt(simpleMatch[1]);
        const unit = simpleMatch[2].toLowerCase();
        let multiplier = 1;
        if (unit.startsWith("min")) multiplier = 60;
        const seconds = value * multiplier;
        const newReminder = {
          id: Date.now(),
          text: "Timer alarm",
          secondsLeft: seconds,
          totalSeconds: seconds
        };
        setReminders((prev) => [...prev, newReminder]);
        speak(`Timer set for ${value} ${unit}s.`);
        return;
      }
      
      // 6. CALCULATOR
      if (command.startsWith("calculate ") || command.startsWith("calc ") || 
          command.includes("plus") || command.includes("minus") || 
          command.includes("times") || command.includes("divided by")) {
        
        let cleaned = command
          .replace(/calculate/g, "")
          .replace(/calc/g, "")
          .replace(/times/g, "*")
          .replace(/multiplied by/g, "*")
          .replace(/x/g, "*")
          .replace(/divided by/g, "/")
          .replace(/plus/g, "+")
          .replace(/minus/g, "-")
          .replace(/[^0-9+\-*/().\s]/g, "") // remove all non-math characters
          .trim();
        
        if (cleaned && /^[0-9+\-*/().\s]+$/.test(cleaned)) {
          try {
            const result = new Function(`return (${cleaned})`)();
            if (typeof result === 'number' && !isNaN(result)) {
              speak(`The result is ${result}.`);
              addLog(`[MATH] ${cleaned} = ${result}`, "SUCCESS");
              return;
            }
          } catch (e) {
            // fall through
          }
        }
      }
      
      // 7. OPEN WEBSITE OR WINDOWS APP
      if (command.startsWith("open ")) {
        const target = command.replace(/^open\s+/i, "").trim();
        const webSites = ["youtube", "github", "google", "gmail", "maps", "facebook", "twitter", "reddit", "stackoverflow"];
        const isWebTarget = webSites.some(w => target.includes(w)) || target.endsWith(".com") || target.endsWith(".org") || target.endsWith(".net") || target.endsWith(".io");

        if (isWebTarget) {
          let url = target;
          if (!url.startsWith("http")) {
            url = "https://" + (url.includes(".") ? url : url + ".com");
          }
          window.open(url, "_blank");
          speak(`Opening website: ${target}`);
        } else {
          const appName = target;
          
          if (isLauncherRunning) {
            fetch(`http://127.0.0.1:3001/open?name=${encodeURIComponent(appName)}`)
              .then(res => {
                if (res.ok) {
                  speak(`Opening ${appName}.`);
                  addLog(`Successfully launched local app: "${appName}"`, "SUCCESS");
                } else {
                  speak(`Failed to launch ${appName}.`);
                }
              })
              .catch(err => {
                speak(`Error communicating with launcher.`);
              });
          } else {
            let launched = true;
            if (appName === "settings" || appName === "windows settings") {
              window.location.href = "ms-settings:";
              speak("Opening Windows Settings.");
            } else if (appName === "calculator" || appName === "calc") {
              window.location.href = "ms-calculator:";
              speak("Opening Windows Calculator.");
            } else if (appName === "paint" || appName === "mspaint") {
              window.location.href = "ms-paint:";
              speak("Opening Paint.");
            } else if (appName === "clock" || appName === "alarms") {
              window.location.href = "ms-clock:";
              speak("Opening Windows Clock.");
            } else if (appName === "photos") {
              window.location.href = "ms-photos:";
              speak("Opening Photos.");
            } else if (appName === "calendar") {
              window.location.href = "ms-calendar:";
              speak("Opening Calendar.");
            } else if (appName === "store" || appName === "app store") {
              window.location.href = "ms-windows-store:";
              speak("Opening Microsoft Store.");
            } else if (appName === "word") {
              window.location.href = "ms-word:";
              speak("Opening Word.");
            } else if (appName === "excel") {
              window.location.href = "ms-excel:";
              speak("Opening Excel.");
            } else if (appName === "powerpoint") {
              window.location.href = "ms-powerpoint:";
              speak("Opening PowerPoint.");
            } else if (appName === "spotify") {
              window.location.href = "spotify:";
              speak("Opening Spotify.");
            } else if (appName === "discord") {
              window.location.href = "discord://";
              speak("Opening Discord.");
            } else {
              launched = false;
            }

            if (launched) {
              addLog(`Launched "${appName}" via Windows URI scheme`, "SUCCESS");
            } else {
              speak(`To open ${appName} locally, please run 'node launcher.js' in the project directory.`);
              addLog(`[SYSTEM] To launch "${appName}" and other desktop apps, open a terminal in the project directory and run: node launcher.js`, "WARNING");
            }
          }
        }
        return;
      }
      
      // 8. WEB SEARCH
      if (command.startsWith("search ") || command.startsWith("google ") || 
          command.startsWith("search for ") || command.startsWith("find ")) {
        const query = text.replace(/^(search for|search|google|find)\s+/i, "").trim();
        if (query) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
          speak(`Searching Google for ${query}.`);
        } else {
          speak("What query would you like to search?");
        }
        return;
      }
      
      // 9. TIME AND DATE
      if (command === "time" || command.includes("current time")) {
        const time = new Date().toLocaleTimeString();
        speak(`The current system time is ${time}.`);
        return;
      }
      if (command === "date" || command.includes("current date") || command === "today") {
        const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        speak(`Today is ${dateStr}.`);
        return;
      }
      
      // 10. MUTE / UNMUTE VIA VOICE
      if (command === "mute") {
        setAudioMode("muted");
        addLog("Audio Output MUTED via voice command", "WARNING");
        return;
      }
      if (command === "unmute") {
        setAudioMode("unmuted");
        speak("Audio Output unmuted.");
        return;
      }
      
      // 11. GENERAL CONTEXT / SYSTEM STATUS / CONVERSATIONAL BASICS
      if (command.includes("status")) {
        speak("All systems are functioning normally.");
        return;
      }
      if (command.includes("how are you")) {
        speak("I am doing great, thank you! Ready to assist you.");
        return;
      }
      if (command.includes("who are you") || command.includes("your name")) {
        speak("I am your voice assistant, ready to help with tasks.");
        return;
      }
      if (command.includes("thank you") || command.includes("thanks")) {
        speak("You're welcome! Glad to help.");
        return;
      }
      if (command.includes("hello") || command.includes("hi") || command.includes("hey")) {
        speak("Greetings! How can I assist you today?");
        return;
      }
      if (command.includes("good morning")) {
        speak("Good morning! Ready for operations.");
        return;
      }
      if (command.includes("goodbye") || command.includes("bye")) {
        speak("Goodbye. Standing by.");
        return;
      }
      
      // FALLBACK: Quiet, brief response
          // If we don't recognize the command, ask the AI backend (OpenAI)
          askAI(text);
      
    }, 400);
  };

  const askAI = async (message) => {
    addLog(`[AI] Querying for: ${message}`, "INFO");
    try {
      // try both common localhost forms
      const endpoints = ["http://127.0.0.1:5000/ask", "http://localhost:5000/ask"];
      let res = null;
      for (const url of endpoints) {
        try {
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
          });
          if (res && res.ok) break;
        } catch (e) {
          // try next
        }
      }

      if (!res) throw new Error("AI server unreachable");

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error || data?.message || `AI server error ${res.status}`;
        addLog(`AI Error: ${errMsg}`, "SYSTEM");
        // Friendly spoken message for common errors
        if (res.status === 429 || data?.code === "insufficient_quota" || (errMsg && errMsg.toLowerCase().includes("quota"))) {
          speak("AI error: Rate limit or insufficient quota. Please check your Google AI Studio plan and billing details.");
        } else if (res.status >= 500) {
          speak("AI server error. Check the server terminal for details or verify your Gemini API key.");
        } else {
          speak(errMsg);
        }
        return;
      }

      const reply = data?.reply || data?.answer || "I couldn't get a response from the AI.";
      
      // Look for a JSON action block in the response
      const jsonMatch = reply.match(/```json\n([\s\S]*?)\n```/);
      let textToSpeak = reply;
      let actionExecuted = false;

      if (jsonMatch) {
        // Remove the JSON block from the spoken text
        textToSpeak = reply.replace(/```json\n[\s\S]*?\n```/, '').trim();
        
        try {
          const actionObj = JSON.parse(jsonMatch[1]);
          addLog(`[AI ACTION] ${actionObj.action}`, "SUCCESS");
          
          if (actionObj.action === "create_file" && actionObj.path && actionObj.content) {
             // We can send this to our launcher server which will need a new endpoint to handle it
             fetch(`http://127.0.0.1:3001/api/file`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ action: "create", path: actionObj.path, content: actionObj.content })
             }).then(res => {
                if (res.ok) addLog(`File created: ${actionObj.path}`, "SUCCESS");
                else addLog(`Failed to create file: ${actionObj.path}`, "SYSTEM");
             });
             actionExecuted = true;
          } else if (actionObj.action === "message" && actionObj.text) {
             addLog(`[MESSAGE] ${actionObj.text}`, "USER");
             actionExecuted = true;
          }
        } catch (e) {
          addLog("Failed to parse AI action payload.", "SYSTEM");
        }
      }

      addLog(`AI: "${textToSpeak || (actionExecuted ? 'Action executed.' : reply)}"`, "AI");
      if (textToSpeak) {
        speak(textToSpeak);
      } else if (actionExecuted) {
        speak("Action completed.");
      }
      
    } catch (err) {
      addLog(`AI Error: ${err.message || err}`, "SYSTEM");
      speak("Sorry, I couldn't reach the AI server.");
    }
  };

  const simulateCommand = (cmdText) => {
    addLog(`You: "${cmdText}" (Simulated)`, "USER");
    setStats(prev => ({...prev, commands: prev.commands + 1}));
    processCommand(cmdText);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (isSpeaking) {
        synthRef.current?.cancel();
      }
      try {
        recognitionRef.current?.start();
      } catch (e) {
        addLog("Recognition already started.", "SYSTEM");
      }
    }
  };

  return (
    <div className="min-h-screen text-white font-mono flex flex-col p-6 gap-8 bg-[#030712] relative overflow-y-auto overflow-x-hidden">
       {/* Top Row */}
       <div className="flex justify-between items-start h-24">
          <div className="scifi-panel left">
             <div className="text-cyan-400 font-bold text-lg tracking-widest">
               Date : {new Date().toDateString()}
             </div>
          </div>

          <div className="flex gap-16 pt-2">
            <button className="jarvis-btn w-40 h-14 text-xl">START</button>
            <button className="jarvis-btn w-40 h-14 text-xl">EXIT</button>
          </div>

          <div className="scifi-panel right">
             <div className="text-cyan-400 font-bold text-lg tracking-widest">
               Time : {new Date().toLocaleTimeString('en-US', { hour12: false })}
             </div>
          </div>
       </div>

       {/* Middle Row */}
       <div className="flex flex-1 gap-4 items-center px-12">
          {/* Left Buttons */}
          <div className="grid grid-cols-2 gap-8 w-[350px]">
             <button onClick={() => simulateCommand("open youtube")} className="jarvis-btn h-16 text-lg">Youtube</button>
             <button className="jarvis-btn h-16 text-lg">History</button>
             <button className="jarvis-btn h-16 text-lg">Chrome</button>
             <button className="jarvis-btn h-16 text-lg">Vs Code</button>
          </div>

          {/* Core Visualizer */}
          <div className="flex-1 flex justify-center items-center h-[400px]">
            <div className={`core-container ${isListening || isSpeaking ? 'core-active' : ''}`}>
               <div className="core-ring core-outer"></div>
               <div className="core-ring core-middle"></div>
               <div className="core-ring core-inner"></div>
               <div className="core-ring core-center"></div>
               
               {/* Clickable Overlay */}
               <button onClick={toggleListen} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"></button>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="grid grid-cols-2 gap-8 w-[350px]">
             <button className="jarvis-btn h-16 text-lg">Ms Powerpoint</button>
             <button className="jarvis-btn h-16 text-lg">Ms Word</button>
             <button className="jarvis-btn h-16 text-lg">Postman</button>
             <button className="jarvis-btn h-16 text-lg">Steam</button>
          </div>
       </div>

       {/* Bottom Row */}
       <div className="grid grid-cols-3 gap-8 h-[280px]">
          {/* Left: Charts Placeholder */}
          <div className="bottom-panel p-6 flex flex-col justify-end items-start clip-left">
            <div className="w-full flex gap-1.5 items-end h-40 opacity-70">
              {[...Array(24)].map((_, i) => (
                 <div key={i} className="mini-bar flex-1" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
              ))}
            </div>
          </div>

          {/* Center: Globe with Nodes */}
          <div className="bottom-panel flex justify-center items-center border-t border-cyan-500/30">
            <div className="globe">
               <div className="globe-node" style={{ top: '20%', left: '30%' }}></div>
               <div className="globe-node" style={{ top: '50%', left: '70%' }}></div>
               <div className="globe-node" style={{ top: '70%', left: '40%' }}></div>
               <div className="globe-node" style={{ top: '40%', left: '20%' }}></div>
               <div className="globe-node" style={{ top: '80%', left: '60%' }}></div>
               <div className="globe-node" style={{ top: '30%', left: '80%' }}></div>
               <div className="globe-node" style={{ top: '10%', left: '50%' }}></div>
            </div>
          </div>

          {/* Right: Anatomy / Stats Placeholder */}
          <div className="bottom-panel p-6 flex items-center justify-between clip-right">
             <div className="w-1/2 flex flex-col justify-center gap-4 h-full text-cyan-400 font-mono opacity-80 pl-4">
                <p className="border-b border-cyan-500/30 pb-1">SYS.TEMP: 34°C</p>
                <p className="border-b border-cyan-500/30 pb-1">MEM.USAGE: 42%</p>
                <p className="border-b border-cyan-500/30 pb-1">NET: ACTIVE</p>
                <p className="border-b border-cyan-500/30 pb-1">SEC: SECURE</p>
                <div className="mt-2 p-2 bg-red-900/40 text-red-400 border border-red-500/50 text-center tracking-widest text-xs">
                  BIOMETRICS ONLINE
                </div>
             </div>
             <div className="w-1/2 flex items-center justify-center">
                <svg width="100" height="180" viewBox="0 0 100 200" className="opacity-70 stroke-cyan-400 fill-none" strokeWidth="2">
                   <circle cx="50" cy="20" r="15" />
                   <line x1="50" y1="35" x2="50" y2="100" />
                   <line x1="50" y1="50" x2="20" y2="80" />
                   <line x1="50" y1="50" x2="80" y2="80" />
                   <line x1="50" y1="100" x2="30" y2="180" />
                   <line x1="50" y1="100" x2="70" y2="180" />
                </svg>
             </div>
          </div>
       </div>


    </div>
  );
}
