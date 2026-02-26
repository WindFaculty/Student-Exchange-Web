#include <Wire.h>
#include <Adafruit_INA219.h>
Adafruit_INA219 ina219;

// Wi-Fi credentials and configuration
#include "config.h"

void setup() {
  Serial.begin(115200);
  delay(1000);
  ina219.begin();
}

void loop() {
  float busvoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  Serial.print("Bus Voltage: "); Serial.print(busvoltage); Serial.print(" V, Current: "); Serial.print(current_mA); Serial.println(" mA");
  if (current_mA > 2000) { digitalWrite(27, LOW); } else { digitalWrite(27, HIGH); }
  delay(2000);
}
