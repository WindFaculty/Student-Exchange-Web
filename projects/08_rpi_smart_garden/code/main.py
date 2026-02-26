import json, time
from gpiozero import LED, PWMOutputDevice
import Adafruit_DHT

# Load configuration
try:
    with open('config.json') as f:
        config = json.load(f)
except Exception:
    config = {}

# Setup pins
PUMP_PIN = 22
pump = LED(PUMP_PIN)
DHT_PIN = 4

# Soil moisture via ADC may need ADS1115; here we simulate using fixed value
def read_soil_moisture():
    # Placeholder for actual analog reading
    return 500  # 0-1023

while True:
    humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, DHT_PIN)
    moisture = read_soil_moisture()
    print(f'Temp: {temperature:.1f} C, Humidity: {humidity:.1f} %, Moisture: {moisture}')
    if moisture < 400:
        pump.on()
        time.sleep(5)
        pump.off()
    time.sleep(10)
