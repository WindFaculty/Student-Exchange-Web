
// Wi-Fi credentials and configuration
#include "config.h"

void setup() {
  Serial.begin(115200);
  delay(1000);
}

void loop() {
  int moisture = analogRead(34);
  Serial.print("Moisture: "); Serial.println(moisture);
  int threshold = 2000;
  if (moisture < threshold) {
    digitalWrite(25, HIGH); // turn pump on
  } else {
    digitalWrite(25, LOW);
  }
  delay(3000);
}
