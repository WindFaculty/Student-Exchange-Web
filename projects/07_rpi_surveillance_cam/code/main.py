import json, time, threading
from flask import Flask, Response, render_template_string
from gpiozero import MotionSensor, Buzzer
from picamera import PiCamera
import io

# Load configuration
try:
    with open('config.json') as f:
        config = json.load(f)
except Exception:
    config = {}

app = Flask(__name__)
camera = PiCamera()
camera.resolution = (640, 480)

motion = MotionSensor(17)
buzzer = Buzzer(27)

frame_buffer = io.BytesIO()

def gen_frames():
    global frame_buffer
    while True:
        frame_buffer.seek(0)
        camera.capture(frame_buffer, format='jpeg')
        data = frame_buffer.getvalue()
        yield (b'--frame
'
               b'Content-Type: image/jpeg

' + data + b'
')
        frame_buffer = io.BytesIO()
        time.sleep(0.1)

@app.route('/')
def index():
    return render_template_string('<h1>Raspberry Pi Surveillance Camera</h1><img src="/video_feed">')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def motion_detected():
    buzzer.on()
    time.sleep(0.5)
    buzzer.off()

# Attach motion detection event
motion.when_motion = motion_detected

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
