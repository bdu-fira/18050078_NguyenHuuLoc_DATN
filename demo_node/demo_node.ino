/* Heltec Automation LoRaWAN communication example
 *
 * Function:
 * 1. Upload node data to the server using the standard LoRaWAN protocol.
 *  
 * Description:
 * 1. Communicate using LoRaWAN protocol.
 * 
 * HelTec AutoMation, Chengdu, China
 * 成都惠利特自动化科技有限公司
 * www.heltec.org
 *
 * */

#include "LoRaWan_APP.h"
#include "Wire.h"
#include "GXHTC.h"
#include <DHT.h>
#include <ArduinoJson.h>

GXHTC gxhtc;

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
DeviceClass_t loraWanClass = CLASS_A;

/*the application data transmission duty cycle.  value in [ms].*/
uint32_t appTxDutyCycle = 15000;

/*OTAA or ABP*/
bool overTheAirActivation = true;

/*ADR enable*/
bool loraWanAdr = true;

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

/* Prepares the payload of the frame */
static void prepareTxFrame(uint8_t port) {
  /*appData size is LORAWAN_APP_DATA_MAX_SIZE which is defined in "commissioning.h".
  *appDataSize max value is LORAWAN_APP_DATA_MAX_SIZE.
  *if enabled AT, don't modify LORAWAN_APP_DATA_MAX_SIZE, it may cause system hanging or failure.
  *if disabled AT, LORAWAN_APP_DATA_MAX_SIZE can be modified, the max value is reference to lorawan region and SF.
  *for example, if use REGION_CN470, 
  *the max value for different DR can be found in MaxPayloadOfDatarateCN470 refer to DataratesCN470 and BandwidthsCN470 in "RegionCN470.h".
  */
  readDHTSensor();
  delay(100);
  unsigned char *puc;
  appDataSize = 0;
  appData[appDataSize++] = 0x04;
  appData[appDataSize++] = 0x00;
  appData[appDataSize++] = 0x0A;
  appData[appDataSize++] = 0x02;
  puc = (unsigned char *)(&temperature);

  appData[appDataSize++] = puc[0];
  appData[appDataSize++] = puc[1];
  appData[appDataSize++] = puc[2];
  appData[appDataSize++] = puc[3];
  appData[appDataSize++] = 0x12;

  puc = (unsigned char *)(&humidity);
  appData[appDataSize++] = puc[0];
  appData[appDataSize++] = puc[1];
  appData[appDataSize++] = puc[2];
  appData[appDataSize++] = puc[3];
}

//if true, next uplink will add MOTE_MAC_DEVICE_TIME_REQ


//downlink data handle function example
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

  // Đọc trường lệnh
  const char *cmd = doc["cmd"];

  if (cmd) {
    Serial.print("Command received: ");
    Serial.println(cmd);

    if (strcmp(cmd, "config") == 0) {
      // Nếu có "interval", cập nhật thời gian gửi uplink
      if (doc.containsKey("interval")) {
        appTxDutyCycle = doc["interval"];
        Serial.print("Updated interval: ");
        Serial.println(appTxDutyCycle);
      }

      // Nếu có RGB, đổi màu đèn
      if (doc.containsKey("rgb")) {
        int r = doc["rgb"]["r"] | 0;
        int g = doc["rgb"]["g"] | 0;
        int b = doc["rgb"]["b"] | 0;

        Serial.printf("RGB set to R:%d G:%d B:%d\n", r, g, b);
#if (LoraWan_RGB == 1)
        uint32_t color = (r << 16) | (g << 8) | b;
        turnOnRGB(color, 5000);
        turnOffRGB();
#endif
      }
    }

    if (strcmp(cmd, "off") == 0) {
#if (LoraWan_RGB == 1)
      turnOffRGB();
#endif
    }

    // Bạn có thể mở rộng thêm nhiều cmd khác ở đây
  }
}




void setup() {
  Serial.begin(115200);
  Mcu.begin(HELTEC_BOARD, SLOW_CLK_TPYE);

  // Initialize the DHT sensor
  dht.begin();
}

void loop() {
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