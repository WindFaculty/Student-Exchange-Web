export const LISTING_CATEGORIES = [
  'Do dung hoc tap',
  'Do dien tu & cong nghe',
  'Quan ao, giay dep, phu kien thoi trang',
  'Do dung ca nhan & sinh hoat',
  'Thue - cho thue',
  'Dich vu',
  'Khac',
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]

export const IOT_COMPONENT_CLASSIFICATION = [
  {
    category: 'Board vi dieu khien / Module phat trien',
    title: 'Board vi dieu khien / Module phat trien (bo nao chinh)',
    items: [
      'ESP8266 (NodeMCU, Wemos D1 Mini)',
      'ESP32 (DevKit, ESP32-S3, ESP32-C3)',
      'Arduino Uno / Nano / Mega',
      'Raspberry Pi (Pi 4, Pi Pico, Pi Zero)',
      'STM32',
      'ESP32-CAM',
    ],
  },
  {
    category: 'Cam bien',
    title: 'Cam bien (Sensors)',
    items: [
      'DHT11 / DHT22 / AM2301',
      'DS18B20',
      'BMP180 / BMP280 / BME280',
      'MQ-2 / MQ-135 / MQ-7',
      'PIR HC-SR501',
      'Ultrasonic HC-SR04',
      'LDR + module anh sang',
      'Soil Moisture Sensor',
      'ACS712',
      'MPU6050 / GY-521',
    ],
  },
  {
    category: 'Thiet bi thuc thi / Output',
    title: 'Thiet bi thuc thi / Output (Actuators)',
    items: [
      'Relay module (1/2/4/8 kenh)',
      'Servo motor (SG90, MG996R)',
      'Stepper motor + A4988 / DRV8825',
      'Dong co DC + L298N / L9110',
      'Buzzer (active/passive)',
      'LED, LED RGB, LED strip WS2812B',
      'Man hinh OLED SSD1306',
      'Man hinh LCD 16x2 + I2C',
      'Coi bao dong, quat mini',
    ],
  },
  {
    category: 'Module giao tiep / Ket noi',
    title: 'Module giao tiep / Ket noi',
    items: [
      'WiFi: ESP-01, ESP8266/ESP32',
      'Bluetooth: HC-05, HC-06, HM-10',
      'LoRa: SX1278, E32, RFM95',
      'GSM/GPRS: SIM800L, SIM900',
      'RFID: MFRC522',
      'GPS: NEO-6M, NEO-7M',
    ],
  },
] as const

export const IOT_COMPONENT_CATEGORIES = IOT_COMPONENT_CLASSIFICATION.map((item) => item.category)

export const IOT_CANONICAL_CATEGORIES = [
  ...IOT_COMPONENT_CATEGORIES,
  'San pham mau / Bo KIT',
  'Dich vu IoT',
] as const

export const IOT_LEGACY_ALIAS_CATEGORIES = [
  'COMPONENT',
  'ELECTRONICS',
  'SAMPLE_KIT',
  'KIT',
  'IOT_SERVICE',
  'MENTORING',
  'CONSULTATION',
  'SERVICE',
] as const

export const LISTING_FORM_CATEGORIES = Array.from(
  new Set<string>([
    ...LISTING_CATEGORIES,
    ...IOT_CANONICAL_CATEGORIES,
    ...IOT_LEGACY_ALIAS_CATEGORIES,
  ]),
)

export const ADMIN_LISTING_CATEGORIES = Array.from(
  new Set<string>([
    ...LISTING_CATEGORIES,
    ...IOT_CANONICAL_CATEGORIES,
    ...IOT_LEGACY_ALIAS_CATEGORIES,
  ]),
)

