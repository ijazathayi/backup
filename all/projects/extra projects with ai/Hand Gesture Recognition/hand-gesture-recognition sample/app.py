import cv2
import numpy as np
from flask import Flask, render_template, Response, jsonify
import threading
import math
import os

app = Flask(__name__, template_folder="templates", static_folder="static")

current_gesture = {"name": "No Hand Detected", "confidence": 0, "fingers": []}
frame_count = 0
lock = threading.Lock()

CASCADE_DIR   = cv2.data.haarcascades
face_cascade  = cv2.CascadeClassifier(os.path.join(CASCADE_DIR, "haarcascade_frontalface_default.xml"))

# ── Background subtractor — learns what's static ──────────────────────────────
bg_sub = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=40, detectShadows=False)


def get_face_mask(frame):
    """Returns a mask that is BLACK over face+neck, WHITE everywhere else."""
    h, w = frame.shape[:2]
    mask = np.ones((h, w), dtype=np.uint8) * 255
    gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
    for (fx, fy, fw, fh) in faces:
        x1 = max(fx - int(fw * 0.3), 0)
        y1 = max(fy - int(fh * 0.3), 0)
        x2 = min(fx + fw + int(fw * 0.3), w)
        y2 = min(fy + fh + int(fh * 1.6), h)   # covers neck
        cv2.rectangle(mask, (x1, y1), (x2, y2), 0, -1)
    return mask, faces


def get_skin_mask(frame):
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    s1 = cv2.inRange(ycrcb, np.array([0,133,77]), np.array([255,173,127]))
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    s2  = cv2.inRange(hsv, np.array([0,  20, 60]), np.array([22, 150, 255]))
    s3  = cv2.inRange(hsv, np.array([160,20, 60]), np.array([180,150, 255]))
    skin = cv2.bitwise_or(s1, cv2.bitwise_or(s2, s3))
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5))
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN,  k)
    skin = cv2.morphologyEx(skin, cv2.MORPH_CLOSE, k)
    skin = cv2.dilate(skin, k, iterations=1)
    return skin


def is_hand_shaped(contour, frame_shape):
    """
    Returns True only if the blob passes ALL hand-shape tests.
    Walls / background patches almost always fail at least one.
    """
    h, w = frame_shape[:2]
    area = cv2.contourArea(contour)

    # ── 1. Area: hand fills roughly 1%–15% of frame ───────────────
    total = h * w
    if not (0.01 * total < area < 0.18 * total):
        return False

    # ── 2. Aspect ratio: hand bounding box is never super-wide ────
    x, y, cw, ch = cv2.boundingRect(contour)
    aspect = cw / ch if ch > 0 else 0
    if not (0.25 < aspect < 2.2):
        return False

    # ── 3. Solidity: hand has fingers → hull > contour ────────────
    hull  = cv2.convexHull(contour)
    ha    = cv2.contourArea(hull)
    solid = area / ha if ha > 0 else 1.0
    if solid > 0.97:          # too solid → probably a flat blob (wall patch)
        return False
    if solid < 0.35:          # too jagged → noise
        return False

    # ── 4. Extent: ratio of contour area to bounding rect ─────────
    extent = area / (cw * ch) if cw * ch > 0 else 0
    if extent < 0.25:         # very sparse fill → not a hand
        return False

    # ── 5. Convexity defects: a real hand has at least 1 ─────────
    hull_idx = cv2.convexHull(contour, returnPoints=False)
    if hull_idx is None or len(hull_idx) < 3:
        return False
    try:
        defects = cv2.convexityDefects(contour, hull_idx)
    except Exception:
        return False
    if defects is None:
        return False
    depth_thresh = 0.08 * min(cw, ch)
    real_defects = sum(1 for i in range(defects.shape[0])
                       if defects[i,0,3] / 256.0 > depth_thresh)
    if real_defects < 1:      # no finger gaps at all → flat blob
        return False

    return True


def pick_best_contour(candidates, frame_shape, fg_mask):
    """
    Score each candidate by:
      - how much of it overlaps the foreground (moving) mask
      - how central-horizontal it is (hands tend to be away from edges)
      - prefers lower in frame (hands held up are still below top 20%)
    """
    h, w = frame_shape[:2]
    best_score = -1
    best = None

    for c in candidates:
        x, y, cw, ch = cv2.boundingRect(c)
        cx = x + cw / 2
        cy = y + ch / 2

        # Foreground overlap ratio
        roi_fg = fg_mask[y:y+ch, x:x+cw]
        fg_ratio = np.count_nonzero(roi_fg) / (cw * ch + 1e-5)

        # Penalise blobs stuck to top edge (likely head remnant) or very top strip
        top_penalty = 1.0 if cy > h * 0.20 else 0.3

        # Prefer blobs not squashed against left/right edges
        edge_penalty = 1.0 if 0.05 * w < cx < 0.95 * w else 0.5

        area_score = cv2.contourArea(c) / (h * w)

        score = fg_ratio * top_penalty * edge_penalty + area_score * 0.5

        if score > best_score:
            best_score = score
            best = c

    return best


def count_fingers(contour):
    if contour is None or len(contour) < 10:
        return 0, []
    hull_idx = cv2.convexHull(contour, returnPoints=False)
    if hull_idx is None or len(hull_idx) < 3:
        return 0, []
    try:
        defects = cv2.convexityDefects(contour, hull_idx)
    except Exception:
        return 0, []
    if defects is None:
        return 0, []

    x, y, cw, ch = cv2.boundingRect(contour)
    depth_thresh = 0.12 * min(cw, ch)

    gaps, pts = 0, []
    for i in range(defects.shape[0]):
        s, e, f, d = defects[i, 0]
        if d / 256.0 < depth_thresh:
            continue
        start = tuple(contour[s][0])
        end   = tuple(contour[e][0])
        far   = tuple(contour[f][0])
        a = math.dist(end, far)
        b = math.dist(start, far)
        c = math.dist(start, end)
        if b * c == 0:
            continue
        angle = math.degrees(math.acos(max(-1.0, min(1.0, (b**2+c**2-a**2)/(2*b*c)))))
        if angle < 90:
            gaps += 1
            pts.append(far)
    return min(gaps + 1, 5), pts


def classify(n, contour):
    hull  = cv2.convexHull(contour)
    solid = cv2.contourArea(contour) / (cv2.contourArea(hull) or 1)
    if solid > 0.88:
        return "✊ Fist", 91
    return {
        1: ("☝ Pointing",  88),
        2: ("✌ Victory",   87),
        3: ("🤟 Three",     83),
        4: ("🤚 Four",      84),
        5: ("🖐 Open Hand", 91),
    }.get(n, ("🤷 Unknown", 60))


def generate_frames():
    global current_gesture, frame_count

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.flip(frame, 1)
        frame_count += 1
        h, w = frame.shape[:2]

        gesture_name = "No Hand Detected"
        confidence   = 0
        fingers_out  = []

        # 1. Foreground mask (moving things)
        fg_mask = bg_sub.apply(frame)
        _, fg_mask = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7,7))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, k)

        # 2. Face exclusion mask
        face_mask, faces = get_face_mask(frame)

        # 3. Skin mask, excluding face
        skin = get_skin_mask(frame)
        skin = cv2.bitwise_and(skin, face_mask)

        # 4. Intersect skin with foreground (moving skin = hand)
        combined = cv2.bitwise_and(skin, fg_mask)
        # Fallback: if no moving skin found, use skin alone (static hand)
        if cv2.countNonZero(combined) < 500:
            combined = skin

        # 5. Find all contours
        cnts, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # 6. Filter by hand shape
        candidates = [c for c in cnts if is_hand_shaped(c, frame.shape)]

        # 7. Pick best candidate
        contour = pick_best_contour(candidates, frame.shape, fg_mask) if candidates else None

        if contour is not None:
            n, defect_pts = count_fingers(contour)
            gesture_name, confidence = classify(n, contour)
            fingers_out = [1]*n + [0]*(5-n)

            # Draw filled overlay
            overlay = frame.copy()
            cv2.drawContours(overlay, [contour], -1, (0,80,0), -1)
            cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)

            cv2.drawContours(frame, [contour], -1, (0,255,80), 2)
            hull = cv2.convexHull(contour)
            cv2.drawContours(frame, [hull], -1, (0,200,255), 1)

            for pt in defect_pts:
                cv2.circle(frame, pt, 7, (0,0,255), -1)

            bx, by, bw, bh = cv2.boundingRect(contour)
            cv2.rectangle(frame, (bx-8, by-8), (bx+bw+8, by+bh+8), (255,0,255), 2)
            ly = max(by-32, 18)
            cv2.putText(frame, "Right",           (bx, ly),    cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,0,255), 2)
            cv2.putText(frame, gesture_name,      (bx, ly+22), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0,255,80),  2)
            cv2.putText(frame, f"Fingers: {n}",   (bx, by+bh+26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,200,255), 2)

        # Frame HUD
        cv2.rectangle(frame, (0, h-36), (230, h), (140,0,0), -1)
        cv2.putText(frame, f"Frame Count = {frame_count}", (8, h-12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1)

        with lock:
            current_gesture = {"name": gesture_name, "confidence": confidence, "fingers": fingers_out}

        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"

    cap.release()


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/gesture_data")
def gesture_data():
    with lock:
        data = current_gesture.copy()
    data["frame_count"] = frame_count
    return jsonify(data)

if __name__ == "__main__":
    print("🖐  Hand Gesture Recognition → http://127.0.0.1:5000")
    app.run(debug=False, threaded=True, host="0.0.0.0", port=5000)