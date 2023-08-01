#include <FS.h>
#include <map>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

bool configurationMode = true;
//device name, ssid, password, email, water level,last watered

std::map<String, String> configMap;

void handleRoot()
{
    server.send(200, "text/html", "<h1>Welcome to My Custom Wi-Fi Network!</h1>");
}
void setup()
{

    ESP8266WebServer server(5501);
    SPIFFS.begin();
    Serial.begin(115200);
    Serial.println("github.com/skakwy");

    // check for exisiting config file
    if (SPIFFS.exists("/config.txt"))
    {
        File file = SPIFFS.open("/config.txt", "r");
        while (file.available())
        {
            String line = file.readStringUntil('\n');
            String key = line.substring(0, line.indexOf(":"));
            String value = line.substring(line.indexOf(":"), line.length());
            configMap[key] = value;
        }
        configurationMode = false;
    }
    else
    {
        // create config file
        File file = SPIFFS.open("/config.txt", "w");
    }

    if (configurationMode == false)
    {
        Serial.println(configMap["ssid"]);
    }
    else if (configurationMode == true)
    {
        Serial.println("configuration mode");
        const char *apSSID = "planty"; // Replace with your desired AP name
        const char *apPassword = "0";
        WiFi.mode(WIFI_AP);              // Set the ESP8266 to Access Point mode
        WiFi.softAP(apSSID, apPassword); // Start the Access Point
        Serial.println("Access Point started.");
        ESP8266WebServer server(80);
        server.on("/", handleRoot); // Handle the root path

        server.begin(); // Start the
    }
}
void loop()
{
    server.handleClient();
}
