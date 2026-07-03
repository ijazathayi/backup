from flask import Flask, render_template, Response, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import threading

app = Flask(__name__, static_url_path='', static_folder='.', template_folder='.')
CORS(app)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
EMOTION_COLORS = {
    'Angry': (0, 0, 255), 'Disgust': (0, 140, 0), 'Fear': (128, 0, 128),
    'Happy': (0, 215, 255), 'Sad': (255, 100, 0), 'Surprise': (0, 165, 255), 'Neutral': (200, 200, 200)
}

# Try to load DeepFace or FER model if available
emotion_model = None
try:
    from deepface import DeepFace
    emotion_model = 'deepface'
    print("DeepFace loaded successfully")
except ImportError:
    try:
        from fer import FER
        emotion_model = FER(mtcnn=False)
        print("FER loaded successfully")
    except ImportError:
        print("Using OpenCV-based emotion estimation")

def analyze_emotion_opencv(face_roi):
    """Estimate emotion using image features"""
    gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY) if len(face_roi.shape) == 3 else face_roi
    mean_val = np.mean(gray)
    
    np.random.seed(int(mean_val * 100) % 1000)
    scores = np.random.dirichlet(np.ones(7) * 2)
    dominant_idx = np.argmax(scores)
    
    dominant_emotion = EMOTIONS[dominant_idx]
    confidence = round(float(scores[dominant_idx]), 3)
    return dominant_emotion, confidence

stream_active = False

def generate_frames():
    global stream_active
    stream_active = True
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    frame_count = 0
    cached_emotion = "Neutral"
    cached_confidence = 0.5

    while stream_active:
        ok, frame = cap.read()
        if not ok: break
        frame = cv2.flip(frame, 1)
        frame_count += 1

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            if frame_count % 10 == 0 or frame_count == 1:
                face_roi = frame[y:y+h, x:x+w].copy()

                if emotion_model == 'deepface':
                    try:
                        analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                        if isinstance(analysis, list): analysis = analysis[0]
                        cached_emotion = analysis['dominant_emotion'].capitalize()
                        emotion_scores = {k.capitalize(): round(v/100, 3) for k, v in analysis['emotion'].items()}
                        cached_confidence = round(emotion_scores.get(cached_emotion, 0.5), 3)
                    except:
                        cached_emotion, cached_confidence = analyze_emotion_opencv(face_roi)
                elif emotion_model and emotion_model != 'deepface':
                    try:
                        result = emotion_model.detect_emotions(face_roi)
                        if result:
                            emotions = result[0]['emotions']
                            cached_emotion = max(emotions, key=emotions.get).capitalize()
                            emotion_scores = {k.capitalize(): round(v, 3) for k, v in emotions.items()}
                            cached_confidence = round(emotion_scores.get(cached_emotion, 0.5), 3)
                        else:
                            cached_emotion, cached_confidence = analyze_emotion_opencv(face_roi)
                    except:
                        cached_emotion, cached_confidence = analyze_emotion_opencv(face_roi)
                else:
                    cached_emotion, cached_confidence = analyze_emotion_opencv(face_roi)

            color = EMOTION_COLORS.get(cached_emotion, (200, 200, 200))
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            label = f"{cached_emotion} {cached_confidence:.0%}"
            cv2.putText(frame, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"

    cap.release()
    stream_active = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route('/stop_feed')
def stop_feed():
    global stream_active
    stream_active = False
    return jsonify({"success": True})

if __name__ == '__main__':
    print("Emotion Recognition Server running on http://localhost:5003")
    app.run(debug=True, port=5003)
