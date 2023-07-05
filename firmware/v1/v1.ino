#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <ESP8266HTTPClient.h>
//ota
#ifndef STASSID
#define STASSID "hoschi"
#define STAPSK "Zwi!!inge"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;
//--------
WiFiClient client;
HTTPClient http;


void setup() {


  //ota
  Serial.begin(115200);
  Serial.println("Booting");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(5000);
    ESP.restart();
  }

  // Port defaults to 8266
  // ArduinoOTA.setPort(8266);

  // Hostname defaults to esp8266-[ChipID]
  // ArduinoOTA.setHostname("myesp8266");

  // No authentication by default
  // ArduinoOTA.setPassword("admin");

  // Password can be set with it's md5 value as well
  // MD5(admin) = 21232f297a57a5a743894a0e4a801fc3
  // ArduinoOTA.setPasswordHash("21232f297a57a5a743894a0e4a801fc3");

  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else {  // U_FS
      type = "filesystem";
    }

    // NOTE: if updating FS this would be the place to unmount FS using FS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  //ota end -------
}
void sendWaterLevel(){
  http.begin(client, "http://x.x.x.x:25565/rooms/?token=1234&water=20&type=change");  // Specify the URL
  
    int httpCode = http.GET();  // Perform the GET request

    if (httpCode > 0) {  // Check the response code
      if (httpCode == HTTP_CODE_OK) {  // HTTP 200
        
        String response = http.getString();  // Get the response payload
        Serial.println(response);
      }
    } else {
      Serial.printf("HTTP request failed with error code: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();  // Close the connection
  }
}
void loop() {
  //ota
  ArduinoOTA.handle();
  //-----------------
if (WiFi.status() == WL_CONNECTED) {
    // Make the HTTP request
   
    

  delay(5000); 
  
}
