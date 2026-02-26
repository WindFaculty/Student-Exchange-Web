#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>
Adafruit_BME280 bme;

// Wi-Fi credentials and configuration
#include "config.h"

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!bme.begin(0x76)) { Serial.println("BME280 not found"); while (1); }
}

void loop() {
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0F;
  Serial.print("Temp:"); Serial.print(temperature);
  Serial.print(" C, Humidity:"); Serial.print(humidity);
  Serial.print(" %, Pressure:"); Serial.println(pressure);
  delay(5000);
}
