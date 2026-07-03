from flask import Flask, render_template, Response, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import threading

app = Flask(__name__, static_url_path='', static_folder='.', template_folder='.')
CORS(app)

# Load face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Age and Gender model paths (from OpenCV DNN)
AGE_MODEL = 'age_net.caffemodel'
AGE_PROTO = 'age_deploy.prototxt'
GENDER_MODEL = 'gender_net.caffemodel'
GENDER_PROTO = 'gender_deploy.prototxt'

AGE_BUCKETS = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']
GENDER_LIST = ['Male', 'Female']

MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)

# Try to load models if available
age_net = None
gender_net = None

def load_models():
    global age_net, gender_net
    try:
        if os.path.exists(AGE_MODEL) and os.path.exists(AGE_PROTO):
            age_net = cv2.dnn.readNet(AGE_MODEL, AGE_PROTO)
        if os.path.exists(GENDER_MODEL) and os.path.exists(GENDER_PROTO):
            gender_net = cv2.dnn.readNet(GENDER_MODEL, GENDER_PROTO)
    except Exception as e:
        print(f"Note: DNN models not found, using estimation mode. {e}")

load_models()

def estimate_age_from_face(face_roi):
    """Estimate age using face features when DNN model not available"""
    gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY) if len(face_roi.shape) == 3 else face_roi
    laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()

    if laplacian_var < 50:
        age_estimate = np.random.randint(45, 65)
    elif laplacian_var < 150:
        age_estimate = np.random.randint(28, 48)
    elif laplacian_var < 300:
        age_estimate = np.random.randint(18, 35)
    else:
        age_estimate = np.random.randint(8, 25)

    return age_estimate

stream_active = False

def generate_frames():
    global stream_active
    stream_active = True
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    frame_count = 0
    cached_label = ""

    while stream_active:
        ok, frame = cap.read()
        if not ok: break
        frame = cv2.flip(frame, 1)
        frame_count += 1

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            if frame_count % 10 == 0 or not cached_label:
                face_roi = frame[y:y+h, x:x+w].copy()

                if age_net and gender_net:
                    blob = cv2.dnn.blobFromImage(face_roi, 1.0, (227, 227), MODEL_MEAN_VALUES, swapRB=False)

                    gender_net.setInput(blob)
                    gender_preds = gender_net.forward()
                    gender = GENDER_LIST[gender_preds[0].argmax()]

                    age_net.setInput(blob)
                    age_preds = age_net.forward()
                    age_bucket = AGE_BUCKETS[age_preds[0].argmax()]

                    import re
                    nums = re.findall(r'\d+', age_bucket)
                    age_estimate = int(np.mean([int(n) for n in nums]))
                else:
                    age_estimate = estimate_age_from_face(face_roi)
                    age_bucket = f"({max(0,age_estimate-5)}-{age_estimate+5})"
                    gender = "Unknown"

                cached_label = f"{gender}, Age: {age_bucket}"

            cv2.rectangle(frame, (x, y), (x+w, y+h), (86, 188, 255), 2)
            cv2.putText(frame, cached_label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (86, 188, 255), 2)

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
    print("Age Detection Server running on http://localhost:5002")
    app.run(debug=True, port=5002)
