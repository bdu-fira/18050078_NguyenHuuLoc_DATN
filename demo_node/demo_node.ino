#include "LoRaWan_APP.h"
#include "Wire.h"
#include <DHT.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

/* OTAA para*/
uint8_t devEui[] = { 0x70, 0xB3, 0xD1, 0x7D, 0xD0, 0x06, 0x53, 0xC8 };
uint8_t appEui[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
uint8_t appKey[] = { 0x74, 0xD6, 0x6E, 0x63, 0x45, 0x82, 0x48, 0x27, 0xFE, 0xC5, 0xB7, 0x70, 0xBA, 0x2B, 0x50, 0x45 };

/* ABP para*/
uint8_t nwkSKey[] = { 0x15, 0xb1, 0xd0, 0xef, 0xa4, 0x63, 0xdf, 0xbe, 0x3d, 0x11, 0x18, 0x1e, 0x1e, 0xc7, 0xda, 0x85 };
uint8_t appSKey[] = { 0xd7, 0x2c, 0x78, 0x75, 0x8c, 0xdc, 0xca, 0xbf, 0x55, 0xee, 0x4a, 0x77, 0x8d, 0x16, 0xef, 0x67 };
uint32_t devAddr = (uint32_t)0x007e6ae1;

/*LoraWan channelsmask, default channels 0-7*/
uint16_t userChannelsMask[6] = { 0x00FF, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000 };

/*LoraWan region, select in arduino IDE tools*/
LoRaMacRegion_t loraWanRegion = ACTIVE_REGION;

/*LoraWan Class, Class A and Class C are supported*/
DeviceClass_t loraWanClass = CLASS_C;

/*the application data transmission duty cycle.  value in [ms].*/
uint32_t appTxDutyCycle = 30000;

/*OTAA or ABP*/
bool overTheAirActivation = true;

/*ADR enable*/
bool loraWanAdr = false;

/* Indicates if the node is sending confirmed or unconfirmed messages */
bool isTxConfirmed = true;

/* Application port */
uint8_t appPort = 2;
/*!
* Number of trials to transmit the frame, if the LoRaMAC layer did not
* receive an acknowledgment. The MAC performs a datarate adaptation,
* according to the LoRaWAN Specification V1.0.2, chapter 18.4, according
* to the following table:
*
* Transmission nb | Data Rate
* ----------------|-----------
* 1 (first)       | DR
* 2               | DR
* 3               | max(DR-1,0)
* 4               | max(DR-1,0)
* 5               | max(DR-2,0)
* 6               | max(DR-2,0)
* 7               | max(DR-3,0)
* 8               | max(DR-3,0)
*
* Note, that if NbTrials is set to 1 or 2, the MAC will not decrease
* the datarate, in case the LoRaMAC layer did not receive an acknowledgment
*/
uint8_t confirmedNbTrials = 4;


// Setup DHT11
DHT dht(1, DHT11);
float temperature = 0;
float humidity = 0;
// Đọc dữ liệu từ cảm biến DHT11
void readDHTSensor() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  // Kiểm tra nếu đọc thất bại
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    temperature = 0;
    humidity = 0;
  }
}

// LED
#define LED_ALARM_PIN 2
bool ledState = false;
int ledStatus = 0;

// Servo
const int servoPin = 3;
const int homePosition = 90;
Servo myservo;
const int SERVO_DUTY_MIN = 400;   //min duty cycle in microseonds
const int SERVO_DUTY_MAX = 2400;  //max duty cycle in microseonds
int servoPosition = homePosition;
int doorStatus = 0;

// Buzzer
#define BUZZER_PIN 4
int alertStatus = 0;


/* Prepares the payload of the frame */
static void prepareTxFrame(uint8_t port) {
  readDHTSensor();
  delay(100);
  unsigned char *puc;
  appDataSize = 0;

  // Header (nếu bạn cần giữ, hoặc bỏ nếu không cần)
  appData[appDataSize++] = 0x04;
  appData[appDataSize++] = 0x00;
  appData[appDataSize++] = 0x0A;
  appData[appDataSize++] = 0x02;

  // Temperature (float -> 4 byte)
  puc = (unsigned char *)(&temperature);
  appData[appDataSize++] = puc[0];
  appData[appDataSize++] = puc[1];
  appData[appDataSize++] = puc[2];
  appData[appDataSize++] = puc[3];

  // Humidity (float -> 4 byte)
  puc = (unsigned char *)(&humidity);
  appData[appDataSize++] = puc[0];
  appData[appDataSize++] = puc[1];
  appData[appDataSize++] = puc[2];
  appData[appDataSize++] = puc[3];

  // doorStatus (1 byte)
  appData[appDataSize++] = doorStatus;

  // ledStatus (1 byte)
  appData[appDataSize++] = ledStatus;

  // alertStatus (1 byte, dùng trạng thái thực tế của còi)
  appData[appDataSize++] = alertStatus;
}


void downLinkDataHandle(McpsIndication_t *mcpsIndication) {
  Serial.printf("+REV DATA:%s,RXSIZE %d,PORT %d\r\n",
                mcpsIndication->RxSlot ? "RXWIN2" : "RXWIN1",
                mcpsIndication->BufferSize,
                mcpsIndication->Port);

  if (mcpsIndication->BufferSize == 0) {
    Serial.println("No payload received.");
    return;
  }

  // In dạng HEX
  Serial.print("+RAW HEX: ");
  for (uint8_t i = 0; i < mcpsIndication->BufferSize; i++) {
    Serial.printf("%02X", mcpsIndication->Buffer[i]);
  }
  Serial.println();

  // Chuyển buffer thành chuỗi JSON
  char jsonStr[128] = { 0 };
  memcpy(jsonStr, mcpsIndication->Buffer, mcpsIndication->BufferSize);
  jsonStr[mcpsIndication->BufferSize] = '\0';

  Serial.print("Received JSON: ");
  Serial.println(jsonStr);

  // Parse JSON
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, jsonStr);

  if (error) {
    Serial.print("JSON parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // ✅ Truy cập trường "cmd" trong "data"
  const char *cmd = doc["data"]["cmd"];
  if (cmd) {
    Serial.print("Command received: ");
    Serial.println(cmd);
    handleCmdDownlink(cmd);
  } else {
    Serial.println("No 'cmd' field found in 'data'");
  }
}

void setup() {
  Serial.begin(115200);
  Mcu.begin(HELTEC_BOARD, SLOW_CLK_TPYE);

  // Initialize the DHT sensor
  dht.begin();
  pinMode(LED_ALARM_PIN, OUTPUT);

  //servo settings
  ESP32PWM::allocateTimer(0);
  myservo.setPeriodHertz(50);
  myservo.attach(servoPin, SERVO_DUTY_MIN, SERVO_DUTY_MAX);

  // Cấu hình các chân GPIO
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);  // Đảm bảo còi tắt khi khởi động
}

void loop() {
  digitalWrite(LED_ALARM_PIN, ledState ? HIGH : LOW);
  delay(10);
  myservo.write(servoPosition);
  delay(10);
  digitalWrite(BUZZER_PIN, alertStatus == 1 ? HIGH : LOW);
  delay(10);

  switch (deviceState) {
    case DEVICE_STATE_INIT:
      {
#if (LORAWAN_DEVEUI_AUTO)
        LoRaWAN.generateDeveuiByChipID();
#endif
        LoRaWAN.init(loraWanClass, loraWanRegion);
        //both set join DR and DR when ADR off
        LoRaWAN.setDefaultDR(3);
        break;
      }
    case DEVICE_STATE_JOIN:
      {
        LoRaWAN.join();
        break;
      }
    case DEVICE_STATE_SEND:
      {
        prepareTxFrame(appPort);
        LoRaWAN.send();
        deviceState = DEVICE_STATE_CYCLE;
        break;
      }
    case DEVICE_STATE_CYCLE:
      {
        // Schedule next packet transmission
        txDutyCycleTime = appTxDutyCycle + randr(-APP_TX_DUTYCYCLE_RND, APP_TX_DUTYCYCLE_RND);
        LoRaWAN.cycle(txDutyCycleTime);
        deviceState = DEVICE_STATE_SLEEP;
        break;
      }
    case DEVICE_STATE_SLEEP:
      {
        LoRaWAN.sleep(loraWanClass);
        break;
      }
    default:
      {
        deviceState = DEVICE_STATE_INIT;
        break;
      }
  }
}

void handleCmdDownlink(String cmd) {
  if (cmd == "led_on") {
    ledState = true;
    ledStatus = 1;
  } else if (cmd == "led_off") {
    ledState = false;
    ledStatus = 0;
  } else if (cmd == "door_open") {
    servoPosition = 180;
    doorStatus = 1;
  } else if (cmd == "door_close") {
    servoPosition = 90;
    doorStatus = 0;
  } else if (cmd == "alert_on") {
    alertStatus = 1;
  } else if (cmd == "alert_off") {
    alertStatus = 0;
  }
}
