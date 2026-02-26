const int trigPin = 12;
const int echoPin = 14;

// Wi-Fi credentials and configuration
#include "config.h"

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(33, OUTPUT); // Buzzer/LED
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  float distance = duration * 0.0343 / 2;
  Serial.print("Distance: "); Serial.println(distance);
  if (distance < 30) { digitalWrite(33, HIGH); } else { digitalWrite(33, LOW); }
  delay(500);
}
