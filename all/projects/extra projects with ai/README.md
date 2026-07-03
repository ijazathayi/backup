# AI Projects Setup Guide

A collection of Python Flask AI/ML web applications with modern dark-themed frontends.

## Projects Overview

| Project | Port | Description |
|---------|------|-------------|
| Face Detection with OpenCV | 5001 | Detects faces, eyes, and smiles using Haar Cascades |
| Age Detection Model | 5002 | Estimates age, gender, and life stage with OpenCV DNN |
| Facial Emotion Recognition | 5003 | Detects 7 emotions using DeepFace or OpenCV fallback |
| Hand Gesture Recognition | 5004 | Recognizes 8 hand gestures with MediaPipe |
| Speech Recognition System | 5005 | Converts speech to text via Whisper or Google Speech API |

---

## Python Requirements

Install **Python 3.9+** and pip first.

### Core dependencies (all vision projects):
```bash
pip install flask flask-cors opencv-python numpy
```

### For Age & Face Detection:
```bash
pip install flask flask-cors opencv-python numpy
```

### For Emotion Recognition (better results with DeepFace):
```bash
pip install deepface
```

### For Hand Gesture (much better results with MediaPipe):
```bash
pip install mediapipe
```

### For Speech Recognition:
```bash
pip install SpeechRecognition openai-whisper pyaudio
```

> **Note:** `pyaudio` on Windows may require: `pip install pipwin && pipwin install pyaudio`

---

## Running Projects

Each project runs independently on its own port.

```bash
# Face Detection
cd "Face Detection with OpenCV"
pip install -r requirements.txt
python app.py
# → http://localhost:5001

# Age Detection
cd "Age Detection Model"
pip install -r requirements.txt
python app.py
# → http://localhost:5002

# Emotion Recognition
cd "Facial Emotion Recognition"
pip install -r requirements.txt
python app.py
# → http://localhost:5003

# Hand Gesture
cd "Hand Gesture Recognition"
pip install -r requirements.txt
python app.py
# → http://localhost:5004

# Speech Recognition
cd "Speech Recognition System"
pip install -r requirements.txt
python app.py
# → http://localhost:5005
```

---

## Optional: Age/Gender DNN Models

For the **Age Detection** project to use real DNN predictions instead of heuristic estimation, download the OpenCV age and gender models:

- `age_deploy.prototxt` + `age_net.caffemodel`
- `gender_deploy.prototxt` + `gender_net.caffemodel`

Place them in the `Age Detection Model/` folder. The app will auto-detect them.

Source: https://github.com/spmallick/learnopencv/tree/master/AgeGender

---

## Tech Stack

- **Backend:** Python, Flask, Flask-CORS
- **Vision:** OpenCV (Haar Cascades + DNN), MediaPipe
- **AI/ML:** DeepFace, OpenAI Whisper, SpeechRecognition
- **Frontend:** Vanilla JS, Web Audio API, MediaRecorder API, Fetch API
- **Style:** Dark theme, Inter font, glassmorphism, CSS gradients

---

## Browser Compatibility

- Chrome/Edge 90+ (recommended)
- Firefox 85+
- Webcam and microphone features require HTTPS or localhost
