# Principle of Operation

This project uses an Raspberry Pi 4 microcontroller with sensors and actuators. The basic flow is as follows:

1. **Initialization:** Configure GPIOs and initialize sensors and modules.
2. **Sensor Reading:** Periodically read data from sensors.
3. **Decision Logic:** Compare sensor readings with predefined thresholds or conditions.
4. **Actuation:** Activate actuators (e.g., pump, relay, servo) if conditions are met.
5. **Communication:** Publish data to a server or display locally via OLED or web interface.
6. **Loop:** Repeat the cycle at a fixed interval.
