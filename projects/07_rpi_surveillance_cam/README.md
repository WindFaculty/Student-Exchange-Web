# Raspberry Pi Surveillance Camera

**Description:** Motion-triggered surveillance system using PIR sensor and camera with web streaming.

## Parts List
See `bom.md` for a detailed bill of materials.

## Wiring
See `pinout.md` and the wiring diagrams in the `diagram/` folder.

## Setup & Programming
1. Clone this repository or copy this project folder to your machine.
2. Install the required libraries as noted below.
3. Install Python dependencies with `pip install -r code/requirements.txt`.
4. Copy `code/config.example.json` to `code/config.json` and fill in any configuration (e.g., Wi‑Fi credentials).
5. Run `python3 code/main.py` to start the application.

## Test & Usage
- Monitor the serial console or web interface to observe sensor readings.
- Adjust thresholds in the code as needed.

## Troubleshooting
- Ensure that all wiring matches the pin assignments.
- Check power supply levels for sensors and actuators.
- Confirm that required libraries are installed.
