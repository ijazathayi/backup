from flask import Flask, render_template, Response, jsonify
from flask_cors import CORS
import cv2
import threading

app = Flask(__name__, static_url_path='', static_folder='.', template_folder='.')
CORS(app)

# Load OpenCV Haar Cascades
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')

stream_active = False

def generate_frames():
    global stream_active
    stream_active = True
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    while stream_active:
        ok, frame = cap.read()
        if not ok: break
        frame = cv2.flip(frame, 1)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            face_roi_gray = gray[y:y+h, x:x+w]
            face_roi_color = frame[y:y+h, x:x+w]

            eyes = eye_cascade.detectMultiScale(face_roi_gray, scaleFactor=1.1, minNeighbors=5)
            smiles = smile_cascade.detectMultiScale(face_roi_gray, scaleFactor=1.8, minNeighbors=20)

            # Draw rectangle on original image
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 100), 2)
            cv2.putText(frame, f'Face', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 100), 2)

            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(face_roi_color, (ex, ey), (ex+ew, ey+eh), (255, 100, 0), 1)

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
    print("Face Detection Server running on http://localhost:5001")
    app.run(debug=True, port=5001)
