# 🖐 GestureCV — Hand Gesture Recognition

Real-time hand gesture recognition using **OpenCV**, **MediaPipe**, and **Flask**.  
Shows live skeletal tracking, finger states, and gesture classification in the browser.

---

## 📁 Project Structure

```
hand-gesture-recognition/
├── app.py                  ← Flask backend + OpenCV + MediaPipe logic
├── requirements.txt        ← Python dependencies
├── templates/
│   └── index.html          ← Main UI page
└── static/
    ├── css/style.css       ← Dark-theme styling
    └── js/main.js          ← Live polling + UI updates
```

---

## 🚀 Quick Start

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the server
```bash
python app.py
```

### 3. Open in browser
```
http://127.0.0.1:5000
```

Allow camera access when prompted.

---

## 🤚 Recognized Gestures

| Gesture       | Description                        |
|---------------|------------------------------------|
| ✊ Fist        | All fingers closed                 |
| 🖐 Open Hand   | All 5 fingers extended             |
| ☝ Pointing    | Only index finger up               |
| ✌ Peace       | Index + middle up                  |
| 👍 Thumbs Up  | Only thumb extended                |
| 👌 OK         | Thumb + index form a circle        |
| 🤙 Hang Loose | Thumb + pinky extended             |
| 🤘 Rock Sign  | Index + pinky up                   |
| 🤟 Rock On    | Thumb + index + pinky up           |
| 🔫 Gun        | Thumb + index up                   |
| 🤌 Pinch      | Thumb + index close but not circle |
| 🤚 Four       | Four fingers (no thumb)            |

---

## ⚙️ How It Works

1. **OpenCV** captures webcam frames and flips them horizontally.
2. **MediaPipe Hands** detects 21 hand landmarks per hand.
3. Finger states are computed by comparing tip vs. base `y`-coordinates.
4. A rule-based classifier maps finger states → gesture label.
5. Flask streams MJPEG video to the browser via `/video_feed`.
6. The JS frontend polls `/gesture_data` every 200 ms and updates the UI.

---

## 🔧 Customization Tips

- **Add new gestures** → edit `classify_gesture()` in `app.py`.
- **Support more hands** → `max_num_hands=4` in the `Hands()` constructor.
- **Change camera** → `cv2.VideoCapture(1)` for second webcam.
- **Adjust sensitivity** → tune `min_detection_confidence` / `min_tracking_confidence`.
