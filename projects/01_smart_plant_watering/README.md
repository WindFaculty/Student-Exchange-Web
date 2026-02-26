# Smart Plant Watering System

**Description:** Automated plant watering using soil moisture sensor and pump controlled via relay.

## Parts List
See `bom.md` for a detailed bill of materials.

## Wiring
See `pinout.md` and the wiring diagrams in the `diagram/` folder.

## Setup & Programming
1. Clone this repository or copy this project folder to your machine.
2. Install the required libraries as noted below.
3. Open `code/main.ino` in Arduino IDE or PlatformIO.
4. Copy `code/config.example.h` to `code/config.h` and fill in your Wi‑Fi credentials and other settings.
5. Select the appropriate ESP32 board and upload the sketch to the ESP32.

## Test & Usage
- Monitor the serial console or web interface to observe sensor readings.
- Adjust thresholds in the code as needed.

## Troubleshooting
- Ensure that all wiring matches the pin assignments.
- Check power supply levels for sensors and actuators.
- Confirm that required libraries are installed.
