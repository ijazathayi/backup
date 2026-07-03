import os
import threading
import speech_recognition as sr
import pyttsx3
import google.generativeai as genai
import subprocess
import webbrowser
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in .env")

# Initialize TTS
tts_engine = pyttsx3.init()
voices = tts_engine.getProperty('voices')
# Try to find a good English voice
for voice in voices:
    if "Zira" in voice.name or "Hazel" in voice.name or "female" in voice.name.lower():
        tts_engine.setProperty('voice', voice.id)
        break

class VoiceAssistantCore:
    def __init__(self, ui_signals):
        self.signals = ui_signals
        self.recognizer = sr.Recognizer()
        self.is_listening = False
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    def speak(self, text):
        self.signals.add_log.emit(text, "AI")
        # Run TTS in a separate thread to not block UI
        def _speak():
            tts_engine.say(text)
            tts_engine.runAndWait()
        threading.Thread(target=_speak, daemon=True).start()

    def process_command(self, text):
        text = text.lower().strip()
        self.signals.add_log.emit(text, "USER")
        
        # Local commands
        if "open youtube" in text:
            self.speak("Opening YouTube")
            webbrowser.open("https://youtube.com")
            return
        elif "open chrome" in text:
            self.speak("Opening Chrome")
            subprocess.Popen(["start", "chrome"], shell=True)
            return
        elif "open code" in text or "open vs code" in text:
            self.speak("Opening VS Code")
            subprocess.Popen(["code"], shell=True)
            return
        elif "open notepad" in text:
            self.speak("Opening Notepad")
            subprocess.Popen(["notepad.exe"])
            return
        elif "time" in text:
            import datetime
            now = datetime.datetime.now().strftime("%I:%M %p")
            self.speak(f"The time is {now}")
            return
            
        # Send to AI if not a local command
        self.ask_ai(text)

    def ask_ai(self, text):
        if not API_KEY:
            self.speak("My AI core is offline. Please check your Gemini API key.")
            return
            
        def _query():
            try:
                self.signals.add_log.emit("Thinking...", "INFO")
                system_instruction = "You are a local PC voice assistant. Keep answers concise. User says: "
                response = self.model.generate_content(system_instruction + text)
                reply = response.text.replace("*", "").replace("#", "")
                self.speak(reply)
            except Exception as e:
                self.signals.add_log.emit(f"AI Error: {str(e)}", "ERROR")
                self.speak("I encountered an error connecting to the AI server.")
                
        threading.Thread(target=_query, daemon=True).start()

    def start_listening(self):
        if self.is_listening:
            return
            
        self.is_listening = True
        self.signals.update_status.emit("SYSTEM: ONLINE | LISTENING: TRUE")
        
        def _listen():
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                self.signals.add_log.emit("Microphone calibrated. Ready.", "SUCCESS")
                
                while self.is_listening:
                    try:
                        audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                        text = self.recognizer.recognize_google(audio)
                        if text:
                            self.process_command(text)
                    except sr.WaitTimeoutError:
                        continue
                    except sr.UnknownValueError:
                        # Didn't understand, just ignore quietly
                        continue
                    except sr.RequestError as e:
                        self.signals.add_log.emit(f"Speech API Error: {e}", "ERROR")
                        
        self.listen_thread = threading.Thread(target=_listen, daemon=True)
        self.listen_thread.start()

    def stop_listening(self):
        self.is_listening = False
        self.signals.update_status.emit("SYSTEM: ONLINE | LISTENING: FALSE")
        self.signals.add_log.emit("Stopped listening.", "INFO")
