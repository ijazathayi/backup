from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import base64
import io
import os
import tempfile
import json
import re
import subprocess
from gtts import gTTS
import imageio_ffmpeg
import wikipedia
import pyttsx3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, template_folder=BASE_DIR, static_folder=BASE_DIR, static_url_path='')
CORS(app)

# Try speech_recognition
sr_available = False
try:
    import speech_recognition as sr
    recognizer = sr.Recognizer()
    sr_available = True
    print("SpeechRecognition loaded successfully")
except ImportError:
    print("SpeechRecognition not available")

# Try whisper
whisper_available = False
whisper_model = None
try:
    import whisper
    whisper_model = whisper.load_model("base")
    whisper_available = True
    print("Whisper loaded successfully")
except ImportError:
    print("Whisper not available")

def generate_response(user_text):
    from datetime import datetime
    import random

    text = user_text.lower().strip()
    text = re.sub(r'\bfriday\b', '', text).strip()

    if not text or text.startswith("["):
        return "I didn't catch that clearly, sir. Could you repeat?"

    if re.search(r'\b(hello|hi|hey|good morning|good evening|good afternoon)\b', text):
        return random.choice([
            "Hello sir! F.R.I.D.A.Y. is online and at your service.",
            "Good to hear from you, sir. How can I assist?",
            "F.R.I.D.A.Y. online. Ready to help.",
        ])

    if re.search(r'\b(hear|listening|test|working|there|online|you there)\b', text):
        return "Loud and clear, sir. All systems are fully operational."

    if re.search(r'\b(who are you|your name|what are you|introduce yourself)\b', text):
        return ("I am F.R.I.D.A.Y. — Female Replacement Intelligent Digital Assistant Youth. "
                "I am your personal AI voice assistant, sir.")

    if re.search(r'\b(how are you|how do you feel|you okay)\b', text):
        return "All systems are operating at optimal efficiency. Thank you for asking, sir."

    if re.search(r'\b(time|what time|current time)\b', text):
        return f"The current time is {datetime.now().strftime('%I:%M %p')}, sir."

    if re.search(r'\b(date|today|what day|day is it)\b', text):
        return f"Today is {datetime.now().strftime('%A, %B %d, %Y')}, sir."

    if re.search(r'\b(joke|funny|laugh|humor)\b', text):
        return random.choice([
            "Why do programmers prefer dark mode? Because light attracts bugs.",
            "I told my AI to tell me a joke. It said: Error 404 — humor not found.",
            "Parallel lines have so much in common. It is a shame they will never meet.",
        ])

    if re.search(r'\b(weather|temperature|forecast|rain|sunny)\b', text):
        return "I do not have access to live weather data yet, sir. I recommend checking your weather app."

    if re.search(r'\b(thank you|thanks|appreciate|good job|well done)\b', text):
        return "Anytime, sir. That is what I am here for."

    if re.search(r'\b(bye|goodbye|see you|stop|sleep|shut down)\b', text):
        return "Understood, sir. F.R.I.D.A.Y. going into standby mode. Say Friday to reactivate."

    # Smart Wikipedia search — strip filler words to get the real query
    query = text
    for strip_phrase in ['what is', 'who is', 'tell me about', 'what are', 'where is',
                         'when did', 'when was', 'how does', 'how do', 'explain',
                         'can you tell me', 'do you know', 'define', 'meaning of',
                         'can you', 'are you able to', 'able to', 'i want to know about']:
        query = query.replace(strip_phrase, '').strip()
    query = query.replace('?', '').replace(',', '').strip()

    if len(query) > 2:
        try:
            results = wikipedia.search(query, results=3)
            if results:
                summary = wikipedia.summary(results[0], sentences=2, auto_suggest=False)
                return summary
        except wikipedia.exceptions.DisambiguationError as e:
            try:
                return wikipedia.summary(e.options[0], sentences=2, auto_suggest=False)
            except Exception:
                pass
        except Exception:
            pass

    return ("I am afraid I could not find information on that, sir. "
            "Try asking me something like 'who is Albert Einstein' or 'what is machine learning'.")


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        transcript = ""
        engine_used = ""
        language = "en-US"
        confidence = 0.0
        voice_model = "jarvis"

        if request.is_json and 'text' in request.get_json():
            transcript = request.get_json()['text']
            voice_model = request.get_json().get('voice_model', 'jarvis')
            confidence = 1.0
            engine_used = "Web Speech API (Wake Word)"
        else:
            if 'audio' in request.files:
                audio_file = request.files['audio']
                audio_data = audio_file.read()
                if 'voice_model' in request.form:
                    voice_model = request.form['voice_model']
            elif request.is_json and 'audio' in request.get_json():
                data = request.get_json()
                audio_b64 = data.get('audio', '').split(',')[-1]
                audio_data = base64.b64decode(audio_b64)
                voice_model = data.get('voice_model', 'jarvis')
            else:
                return jsonify({'success': False, 'error': 'No audio or text data provided'})

            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
                tmp.write(audio_data)
                tmp_path = tmp.name

            wav_path = tmp_path + ".wav"
            
            # Convert WebM to WAV using the bundled ffmpeg from imageio-ffmpeg
            try:
                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                subprocess.run([ffmpeg_exe, '-y', '-i', tmp_path, wav_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception as e:
                print(f"FFmpeg conversion failed: {e}")
                wav_path = tmp_path

            if whisper_available and whisper_model:
                try:
                    result = whisper_model.transcribe(wav_path)
                    transcript = result['text'].strip()
                    language = result.get('language', 'en')
                    confidence = round(abs(float(result.get('segments', [{}])[0].get('avg_logprob', -0.3))), 2) if result.get('segments') else 0.85
                    confidence = round(max(0.5, min(0.99, 1 - confidence * 0.5)), 2)
                    engine_used = "OpenAI Whisper"
                except Exception as e:
                    print(f"Whisper failed: {e}")
                    transcript = "[Whisper Error]"
                    confidence = 0.0

            elif sr_available:
                with sr.AudioFile(wav_path) as source:
                    audio = recognizer.record(source)

                # Try Google
                try:
                    transcript = recognizer.recognize_google(audio, language='en-US')
                    engine_used = "Google Speech API"
                    confidence = 0.92
                except sr.UnknownValueError:
                    transcript = "[Could not understand audio]"
                    confidence = 0.0
                except sr.RequestError:
                    # Try sphinx offline
                    try:
                        transcript = recognizer.recognize_sphinx(audio)
                        engine_used = "CMU Sphinx (Offline)"
                        confidence = 0.75
                    except:
                        transcript = "[Speech recognition service unavailable]"
                        engine_used = "Unavailable"
                        confidence = 0.0
            else:
                transcript = "[No speech recognition engine available. Install: pip install SpeechRecognition openai-whisper]"
                engine_used = "None"
                confidence = 0.0
            if os.path.exists(tmp_path): os.unlink(tmp_path)
            if os.path.exists(wav_path): os.unlink(wav_path)

        # Word stats
        words = [w for w in transcript.split() if w.strip('.,!?')]

        reply_text = ""
        reply_audio_b64 = ""
        
        if transcript and not transcript.startswith("[Could not understand"):
            reply_text = generate_response(transcript)
            
            # Generate TTS
            if voice_model == "google":
                tts = gTTS(text=reply_text, lang='en', slow=False)
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tts_tmp:
                    tts.save(tts_tmp.name)
                    with open(tts_tmp.name, 'rb') as audio_file:
                        reply_audio_b64 = base64.b64encode(audio_file.read()).decode('utf-8')
                os.unlink(tts_tmp.name)
            else:
                engine = pyttsx3.init()
                voices = engine.getProperty('voices')
                if voice_model == "friday" and len(voices) > 1:
                    engine.setProperty('voice', voices[1].id) # Usually female
                else:
                    engine.setProperty('voice', voices[0].id) # Usually male
                
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tts_tmp:
                    tmp_wav = tts_tmp.name
                
                engine.save_to_file(reply_text, tmp_wav)
                engine.runAndWait()
                with open(tmp_wav, 'rb') as audio_file:
                    reply_audio_b64 = base64.b64encode(audio_file.read()).decode('utf-8')
                os.unlink(tmp_wav)

        return jsonify({
            'success': True,
            'transcript': transcript,
            'word_count': len(words),
            'confidence': confidence,
            'language': language,
            'engine': engine_used,
            'characters': len(transcript),
            'reply_text': reply_text,
            'reply_audio': reply_audio_b64
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/languages', methods=['GET'])
def get_languages():
    languages = [
        {'code': 'en-US', 'name': 'English (US)'},
        {'code': 'en-GB', 'name': 'English (UK)'},
        {'code': 'es-ES', 'name': 'Spanish'},
        {'code': 'fr-FR', 'name': 'French'},
        {'code': 'de-DE', 'name': 'German'},
        {'code': 'it-IT', 'name': 'Italian'},
        {'code': 'pt-BR', 'name': 'Portuguese (Brazil)'},
        {'code': 'ar-SA', 'name': 'Arabic'},
        {'code': 'zh-CN', 'name': 'Chinese (Simplified)'},
        {'code': 'ja-JP', 'name': 'Japanese'},
        {'code': 'hi-IN', 'name': 'Hindi'},
        {'code': 'ur-PK', 'name': 'Urdu'},
    ]
    return jsonify({'languages': languages})

if __name__ == '__main__':
    print("Speech Recognition Server running on http://localhost:5005")
    app.run(debug=True, port=5005)
