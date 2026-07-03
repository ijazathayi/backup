import cv2
import numpy as np
from flask import Flask, render_template, Response, jsonify
import threading

app = Flask(__name__, static_url_path='', static_folder='.', template_folder='.')

current_gesture = {"key": "none", "confidence": 0, "fingers": []}
frame_count = 0
lock = threading.Lock()
stream_active = False

# Try to load mediapipe
mp_available = False
try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    
    base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
    options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
    hands_model = vision.HandLandmarker.create_from_options(options)
    
    mp_available = True
    print("MediaPipe Tasks API loaded successfully for streaming")
except Exception as e:
    print("MediaPipe not available:", e)

def classify_gesture_from_landmarks(landmarks, hand_label='Right'):
    FINGER_TIPS = [4, 8, 12, 16, 20]
    FINGER_PIPS = [3, 6, 10, 14, 18]
    fingers_up = []

    if hand_label == 'Right':
        fingers_up.append(1 if landmarks[4].x < landmarks[3].x else 0)
    else:
        fingers_up.append(1 if landmarks[4].x > landmarks[3].x else 0)

    for tip, pip in zip(FINGER_TIPS[1:], FINGER_PIPS[1:]):
        fingers_up.append(1 if landmarks[tip].y < landmarks[pip].y else 0)

    total_up = sum(fingers_up)

    if fingers_up == [1, 0, 0, 0, 0]: return 'thumbs_up'
    elif fingers_up == [0, 0, 0, 0, 0]: return 'fist'
    elif fingers_up == [1, 1, 1, 1, 1]: return 'open_hand'
    elif fingers_up == [0, 1, 1, 0, 0]: return 'peace'
    elif fingers_up == [0, 1, 0, 0, 0]: return 'pointing'
    elif fingers_up == [1, 0, 0, 0, 1]: return 'rock'
    elif total_up == 3: return 'ok'
    elif total_up == 4: return 'four'
    else: return 'unknown'

def generate_frames():
    global current_gesture, frame_count, stream_active
    stream_active = True
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    while stream_active:
        ok, frame = cap.read()
        if not ok: break
        frame = cv2.flip(frame, 1)
        frame_count += 1
        
        gesture_key = "none"
        confidence = 0
        fingers_out = []

        if mp_available:
            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            results = hands_model.detect(mp_image)

            if results.hand_landmarks:
                for hand_landmarks, hand_handedness in zip(results.hand_landmarks, results.handedness):
                    hand_label = hand_handedness[0].category_name
                    confidence = round(float(hand_handedness[0].score), 2)
                    gesture_key = classify_gesture_from_landmarks(hand_landmarks, hand_label)
                    
                    # Convert landmarks to pixel coordinates
                    h_img, w_img, _ = frame.shape
                    pixel_landmarks = []
                    for lm in hand_landmarks:
                        cx, cy = int(lm.x * w_img), int(lm.y * h_img)
                        pixel_landmarks.append((cx, cy))
                    
                    # Draw bounding box (Red)
                    xs = [p[0] for p in pixel_landmarks]
                    ys = [p[1] for p in pixel_landmarks]
                    x_min, x_max = max(0, min(xs) - 20), min(w_img, max(xs) + 20)
                    y_min, y_max = max(0, min(ys) - 20), min(h_img, max(ys) + 20)
                    
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 0, 255), 2)
                    
                    # Text above box (Red)
                    text = gesture_key.upper().replace("_", " ")
                    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
                    text_x = x_min + (x_max - x_min) // 2 - text_size[0] // 2
                    cv2.putText(frame, text, (max(0, text_x), max(20, y_min - 10)), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    
                    # Draw connections (Green lines)
                    connections = [
                        (0,1), (1,2), (2,3), (3,4),
                        (0,5), (5,6), (6,7), (7,8),
                        (5,9), (9,10), (10,11), (11,12),
                        (9,13), (13,14), (14,15), (15,16),
                        (13,17), (17,18), (18,19), (19,20),
                        (0,17)
                    ]
                    for start, end in connections:
                        cv2.line(frame, pixel_landmarks[start], pixel_landmarks[end], (0, 255, 0), 2)
                        
                    # Draw dots (Red)
                    for point in pixel_landmarks:
                        cv2.circle(frame, point, 4, (0, 0, 255), -1)

                    break # only process the first hand

        with lock:
            current_gesture = {"key": gesture_key, "confidence": confidence, "fingers": fingers_out}

        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"

    cap.release()
    stream_active = False

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/stop_feed")
def stop_feed():
    global stream_active
    stream_active = False
    return jsonify({"success": True})

@app.route("/gesture_data")
def gesture_data():
    with lock:
        data = current_gesture.copy()
    data["frame_count"] = frame_count
    return jsonify(data)

if __name__ == "__main__":
    print("Hand Gesture Recognition Server running on http://localhost:5004")
    app.run(debug=True, port=5004)
