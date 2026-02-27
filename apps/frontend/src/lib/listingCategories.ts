export interface CategoryOption {
  code: string
  label: string
}

export const LISTING_CATEGORY_OPTIONS: CategoryOption[] = [
  { code: 'STUDY_SUPPLIES', label: 'Đồ dùng học tập' },
  { code: 'ELECTRONICS_TECH', label: 'Đồ điện tử và công nghệ' },
  { code: 'FASHION_ACCESSORIES', label: 'Quần áo, giày dép, phụ kiện thời trang' },
  { code: 'PERSONAL_LIVING', label: 'Đồ dùng cá nhân và sinh hoạt' },
  { code: 'RENTAL', label: 'Thuê - cho thuê' },
  { code: 'SERVICES', label: 'Dịch vụ' },
  { code: 'OTHER', label: 'Khác' },
  { code: 'BOOKS', label: 'Sách' },
  { code: 'STATIONERY', label: 'Văn phòng phẩm' },
  { code: 'HOUSEHOLD', label: 'Đồ gia dụng' },
  { code: 'IOT_COMPONENT', label: 'Linh kiện IoT' },
  { code: 'IOT_SAMPLE_KIT', label: 'Sản phẩm mẫu và bộ kit' },
  { code: 'IOT_SERVICE', label: 'Dịch vụ IoT' },
]

export const LISTING_CATEGORIES = LISTING_CATEGORY_OPTIONS.map((item) => item.label)

export const IOT_COMPONENT_CLASSIFICATION = [
  {
    code: 'CONTROLLER_BOARD',
    category: 'Board vi điều khiển / Module phát triển',
    title: 'Board vi điều khiển / Module phát triển (bộ não chính)',
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
    code: 'SENSOR',
    category: 'Cảm biến',
    title: 'Cảm biến (Sensors)',
    items: [
      'DHT11 / DHT22 / AM2301',
      'DS18B20',
      'BMP180 / BMP280 / BME280',
      'MQ-2 / MQ-135 / MQ-7',
      'PIR HC-SR501',
      'Ultrasonic HC-SR04',
      'LDR + module ánh sáng',
      'Soil Moisture Sensor',
      'ACS712',
      'MPU6050 / GY-521',
    ],
  },
  {
    code: 'ACTUATOR',
    category: 'Thiết bị thực thi / Output',
    title: 'Thiết bị thực thi / Output (Actuators)',
    items: [
      'Relay module (1/2/4/8 kênh)',
      'Servo motor (SG90, MG996R)',
      'Stepper motor + A4988 / DRV8825',
      'Động cơ DC + L298N / L9110',
      'Buzzer (active/passive)',
      'LED, LED RGB, LED strip WS2812B',
      'Màn hình OLED SSD1306',
      'Màn hình LCD 16x2 + I2C',
      'Còi báo động, quạt mini',
    ],
  },
  {
    code: 'CONNECTIVITY',
    category: 'Module giao tiếp / Kết nối',
    title: 'Module giao tiếp / Kết nối',
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

export const IOT_COMPONENT_CATEGORIES = IOT_COMPONENT_CLASSIFICATION.map((item) => item.code)

export const LISTING_FORM_CATEGORIES = LISTING_CATEGORY_OPTIONS
export const ADMIN_LISTING_CATEGORIES = LISTING_CATEGORY_OPTIONS
