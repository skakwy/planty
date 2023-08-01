#include <EEPROM.h>
#include <ArduinoJson.h>
#include <map>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <WebSocketsServer.h>
#include <ESP8266HTTPClient.h>

const int webSocketPort = 8080;
bool configurationMode = true;
const char *configHtml = R""""(
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>planty</title>
    <style>
        body {
            background-color: white; 
            display: flex;
            overflow: hidden;
            margin: 0px;
            justify-content: center;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 50px;
            align-items: center;
            justify-content: center;
            width: 80%;
            height: 100vh;
            
            
        }
        input{
            outline: none;
            border-radius: 0px;
            font-size: 18px;
            border: none;
            border-bottom: 1px solid gray;
            width: 100%;
        }
        button{
            outline: none;
            border: none;
            color: black;
            padding: 10px;
            font-size: 18px;
            font-weight: 600;
            width: 100%;
            border-radius: 6px;
            
        }
    </style>

</head>

<body>
    <div class="container">
        <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required id="ssidInput" placeholder="ssid/ Wifi name" />
        <input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"  required id="passwordInput" placeholder="password" />
        <button id="button">Submit</button>
    </div>
    <script>
        console.log("test")
        const button = document.getElementById("button");
        const ssidInput = document.getElementById("ssidInput");
        const passwordInput = document.getElementById("passwordInput");

        // Replace "ws://your-arduino-ip:8080" with the IP address of your Arduino
        console.log("twst")
        const ws = new WebSocket("ws://planty.local:8080");


function stringToUtf8Bytes(inputString) {
    const textEncoder = new TextEncoder();
    return textEncoder.encode(inputString);
  }
        button.addEventListener("click", () => {
            // Send a message to the Arduino when the button is clicked
     console.log("{ssid:" + ssidInput.value +  ",password:" + passwordInput.value + "}")
                        data = "{ssid:\"" + ssidInput.value + "\",password: \"" + passwordInput.value + "\"}"
            ws.send(data);
        });
    </script>
</body>

</html>
    )"""";
DynamicJsonDocument configurationDoc(1024);
ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(webSocketPort);
#define MAX_STRING_LENGTH 50
WiFiClient client;
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
    // Event handler for WebSocket messages received from the client (JavaScript)
    if (type == WStype_TEXT)
    {
        // print message
        deserializeJson(configurationDoc, (char *)payload);
        //   Serial.println(configurationDoc["ssid"].as<String>());
        // Process the received message and take action accordingly
        // For example, you can turn on an LED, change the motor speed, etc.

        // serializeJson(configurationDoc, (char *)payload,strlen((char *)payload));
        // Serial.println(configurationDoc.as<String>());
        writeStringToEEPROM(0, configurationDoc.as<String>());
        delay(5000);
        // reset arduino
        wdt_enable(WDTO_15MS); // Enable the Watchdog Timer with a timeout of 15ms
        while (1)
        {
        }
    }
}
String sendGetRequest(String requestUrl)
{
    HTTPClient http;

    http.begin(client, requestUrl);

    int httpCode = http.GET();

    if (httpCode > 0)
    {
        if (httpCode == HTTP_CODE_OK)
        {
            String payload = http.getString();
            return payload;
        }
        else
        {
            Serial.printf("HTTP error code: %d\n", httpCode);
        }
    }
    else
    {
        Serial.println("Connection failed.");
    }

    http.end();
    return "";
}

void writeStringToEEPROM(int address, const String &data)
{
    for (size_t i = 0; i < data.length() && i < MAX_STRING_LENGTH; i++)
    {
        EEPROM.write(address + i, data[i]);
    }
    EEPROM.write(address + data.length(), '\0'); // Null-terminate the string
    EEPROM.commit();                             // Save changes to EEPROM
}
String readStringFromEEPROM(int address)
{
    String result = "";
    char c;
    for (size_t i = 0; i < MAX_STRING_LENGTH; i++)
    {
        c = EEPROM.read(address + i);
        if (c == '\0') // Null terminator found
            break;
        result += c;
    }
    return result;
}

void handleRoot()
{
    server.send(200, "text/html", configHtml);
}
String *split(String toSplit, String splitCharacter)
{
    String result[] = {};
    while (toSplit.indexOf(splitCharacter) != -1)
    {
        result[result->length()] = toSplit.substring(0, toSplit.indexOf(splitCharacter));
        toSplit.substring(toSplit.indexOf(splitCharacter), toSplit.length());
    }
    return result;
}
String netzwerkTeil(String str)
{
    String result = "";
    int count = 1;
    while (str.indexOf(".") != -1)
    {
        if (count == 3)
        {
            result += str.substring(0, str.indexOf("."));
            break;
        }
        else
        {
            result += str.substring(0, str.indexOf(".") + 1);
            str = str.substring(str.indexOf(".") + 1, str.length());
            count++;
        }
    }

    return result;
}
String searchForServer()
{
    String ipAddress;
    Serial.println("searching for server");
    // Serial.print(".");
    for (int i = 1; i <= 254; i++)
    {
        // Serial.print(".");
        ipAddress = netzwerkTeil(WiFi.localIP().toString()) + String(i);
        HTTPClient http;

        http.begin(client, ipAddress + ":25555");

        int httpCode = http.GET();
        Serial.println(http.getString());
        if (httpCode > 0)
        {
            if (httpCode == HTTP_CODE_OK)
            {
                return ipAddress;
            }
        }
        http.end();
    }
    return "not found";
}

void setup()
{
    EEPROM.begin(MAX_STRING_LENGTH);
    Serial.begin(115200);
    Serial.println("github.com/skakwy");
    // clear eeprom
    // EEPROM.write(0, '\0');
    String savedConfig = readStringFromEEPROM(0);
    Serial.println(savedConfig);

    if (!savedConfig.isEmpty())
    {

        deserializeJson(configurationDoc, savedConfig);
        Serial.println("connecting to wifi");
        WiFi.mode(WIFI_STA);
        WiFi.begin(configurationDoc["ssid"].as<String>().c_str(), configurationDoc["password"].as<String>().c_str());
        while (WiFi.status() != WL_CONNECTED)
        {
            delay(500);
            Serial.print(".");
        }
        Serial.println("");
        Serial.println("WiFi connected");
        Serial.println("IP address: ");
        Serial.println(WiFi.localIP());
     
        
        if (configurationDoc["server"].isNull())
        {
            searchForServer();
        }
        configurationMode = false;
    }

    // go through array

    // Always initialize the WebSocket server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    // Start the web server and access point
    if (configurationMode == true)
    {
        Serial.println("configuration mode");
        const char *apSSID = "planty"; // Replace with your desired AP name
        const char *apPassword = "plantyConfig";
        WiFi.mode(WIFI_AP);              // Set the ESP8266 to Access Point mode
        WiFi.softAP(apSSID, apPassword); // Start the Access Point
        WiFi.hostname("planty");
        MDNS.begin("planty");
        Serial.println("Access Point started.");
        Serial.print("IP address: ");
        IPAddress apIP = WiFi.softAPIP();
        Serial.println(apIP);
        server.on("/", handleRoot); // Handle the root path
    }

    server.begin();
}
void loop()
{
    server.handleClient();
    MDNS.update();
    webSocket.loop(); // Add this line to handle WebSocket events
}
