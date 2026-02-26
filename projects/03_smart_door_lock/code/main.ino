#include <SPI.h>
#include <MFRC522.h>
constexpr uint8_t SS_PIN = 5;
constexpr uint8_t RST_PIN = 4;
MFRC522 mfrc522(SS_PIN, RST_PIN);
#include <Servo.h>
Servo doorServo;

// Wi-Fi credentials and configuration
#include "config.h"

void setup() {
  Serial.begin(115200);
  delay(1000);
  SPI.begin();
  mfrc522.PCD_Init();
  doorServo.attach(26);
  doorServo.write(0); // Locked position
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) { delay(200); return; }
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) { uid += String(mfrc522.uid.uidByte[i], HEX); }
  Serial.print("Card UID: "); Serial.println(uid);
  if (uid == "de ad be ef") {
    doorServo.write(90); // unlock
    delay(3000);
    doorServo.write(0); // lock
  }
  delay(500);
}
