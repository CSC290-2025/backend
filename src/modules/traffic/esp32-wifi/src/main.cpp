// Define what Firebase features to enable BEFORE including FirebaseClient.h
#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include "TM1637Display.h"

// ================= PIN CONFIGURATION =================
const uint8_t TM1637_CLK = 22;
const uint8_t TM1637_DIO = 21;
const uint8_t CONFIG_BUTTON = 15;

// Single Traffic Light Pins (this board controls ONE light only)
const uint8_t RED_PIN = 0;
const uint8_t YELLOW_PIN = 4;
const uint8_t GREEN_PIN = 2;

// ================= CONFIGURATION =================
Preferences preferences;
WebServer server(80);
TM1637Display display(TM1637_CLK, TM1637_DIO);

// WiFi & Firebase
String wifiSSID = "";
String wifiPass = "";
String teamId = "10";
String junctionId = "Junction1";
String lightDirection = "A";
float latitude = 13.647372;
float longitude = 100.495536;

// Firebase Configuration
#define API_KEY ""
#define DATABASE_URL ""
#define USER_EMAIL ""
#define USER_PASSWORD ""

// Firebase objects
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);

WiFiClientSecure stream_ssl_client;
AsyncClient streamClient(stream_ssl_client);

UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASSWORD, 3000);
FirebaseApp app;
RealtimeDatabase Database;
AsyncResult aResult;

bool firebaseReady = false;
bool configMode = false;

// Current state from Firebase (updated via stream)
String currentColor = "red";
int remainingTime = 0;

// --- Helper: sanitize non-ASCII characters ---
String sanitizeASCII(const String &input)
{
  String clean = "";
  for (int i = 0; i < input.length(); i++)
  {
    unsigned char c = (unsigned char)input[i];

    // Handle UTF-8 encoded smart apostrophe (U+2019: ')
    if (c == 0xE2 && i + 2 < input.length())
    {
      unsigned char c1 = (unsigned char)input[i + 1];
      unsigned char c2 = (unsigned char)input[i + 2];
      if (c1 == 0x80 && c2 == 0x99) // U+2019 right single quotation mark
      {
        clean += '\'';
        i += 2;
        continue;
      }
      else if (c1 == 0x80 && c2 == 0x98) // U+2018 left single quotation mark
      {
        clean += '\'';
        i += 2;
        continue;
      }
      else if (c1 == 0x80 && c2 == 0x9C) // U+201C left double quotation mark
      {
        clean += '"';
        i += 2;
        continue;
      }
      else if (c1 == 0x80 && c2 == 0x9D) // U+201D right double quotation mark
      {
        clean += '"';
        i += 2;
        continue;
      }
    }

    // Keep only printable ASCII characters
    if (c >= 32 && c <= 126)
    {
      clean += (char)c;
    }
    else if (c < 128)
    {
      clean += ' ';
    }
  }
  return clean;
}

String htmlEscape(const String &s)
{
  String out;
  out.reserve(s.length() + 8);
  for (size_t i = 0; i < s.length(); ++i)
  {
    char c = s[i];
    switch (c)
    {
    case '&':
      out += "&amp;";
      break;
    case '<':
      out += "&lt;";
      break;
    case '>':
      out += "&gt;";
      break;
    case '"':
      out += "&quot;";
      break;
    case '\'':
      out += "&#39;";
      break;
    default:
      out += c;
    }
  }
  return out;
}

// ================= WEB INTERFACE (simplified for space) =================
const char *configPage = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Traffic Light Configuration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { padding: 24px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
        button { width: 100%; padding: 12px; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .btn-primary { background: #2c3e50; color: white; }
        .btn-danger { background: #e74c3c; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Traffic Light Config</h1>
            <p>Team: %TEAM_ID% | Junction: %JUNCTION_ID% | Direction: %DIRECTION%</p>
        </div>
        <div class="content">
            <form action="/save" method="POST">
                <div class="form-group">
                    <label>WiFi SSID</label>
                    <input type="text" name="ssid" value="%WIFI_SSID%" required>
                </div>
                <div class="form-group">
                    <label>WiFi Password</label>
                    <input type="password" name="pass" value="%WIFI_PASS%">
                </div>
                <div class="form-group">
                    <label>Team ID</label>
                    <input type="text" name="team" value="%TEAM_ID%" required>
                </div>
                <div class="form-group">
                    <label>Junction ID</label>
                    <input type="text" name="junction" value="%JUNCTION_ID%" required>
                </div>
                <div class="form-group">
                    <label>Light Direction (A/B/C/D)</label>
                    <input type="text" name="direction" value="%DIRECTION%" required maxlength="1" pattern="[A-Da-d]">
                </div>
                <div class="form-group">
                    <label>Latitude</label>
                    <input type="number" step="0.000001" name="lat" value="%LAT%" required>
                </div>
                <div class="form-group">
                    <label>Longitude</label>
                    <input type="number" step="0.000001" name="lng" value="%LNG%" required>
                </div>
                <button type="submit" class="btn-primary">Save & Restart</button>
            </form>
            <form action="/reset" method="POST">
                <button type="submit" class="btn-danger">Reset to Defaults</button>
            </form>
        </div>
    </div>
</body>
</html>
)rawliteral";

String processTemplate(const char *html)
{
  String result = html;
  result.replace("%WIFI_SSID%", htmlEscape(wifiSSID));
  result.replace("%WIFI_PASS%", htmlEscape(wifiPass));
  result.replace("%TEAM_ID%", htmlEscape(teamId));
  result.replace("%JUNCTION_ID%", htmlEscape(junctionId));
  result.replace("%DIRECTION%", htmlEscape(lightDirection));
  result.replace("%LAT%", String(latitude, 6));
  result.replace("%LNG%", String(longitude, 6));
  return result;
}

// ================= CONFIGURATION FUNCTIONS =================

void loadConfiguration()
{
  preferences.begin("traffic-light", false);
  wifiSSID = preferences.getString("ssid", "");
  wifiPass = preferences.getString("pass", "");
  teamId = preferences.getString("team", "10");
  junctionId = preferences.getString("junction", "Junction1");
  lightDirection = preferences.getString("direction", "A");
  latitude = preferences.getFloat("lat", 13.647372);
  longitude = preferences.getFloat("lng", 100.495536);
  preferences.end();
}

void saveConfiguration()
{
  preferences.begin("traffic-light", false);
  preferences.putString("ssid", wifiSSID);
  preferences.putString("pass", wifiPass);
  preferences.putString("team", teamId);
  preferences.putString("junction", junctionId);
  preferences.putString("direction", lightDirection);
  preferences.putFloat("lat", latitude);
  preferences.putFloat("lng", longitude);
  preferences.end();
}

void startConfigMode()
{
  Serial.println("\n=== ENTERING CONFIG MODE ===");
  configMode = true;

  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_AP);

  String apName = "TrafficLight-" + lightDirection + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);
  WiFi.softAP(apName.c_str(), "config123", 9);
  delay(1000);

  IPAddress IP = WiFi.softAPIP();
  Serial.println("AP: " + apName);
  Serial.println("Password: config123");
  Serial.println("URL: http://" + IP.toString());

  display.showNumberDec(0);

  server.on("/", HTTP_GET, []()
            { server.send(200, "text/html; charset=utf-8", processTemplate(configPage)); });

  server.on("/save", HTTP_POST, []()
            {
              wifiSSID = sanitizeASCII(server.arg("ssid"));
              wifiPass = server.arg("pass");
              teamId = server.arg("team");
              junctionId = server.arg("junction");
              lightDirection = server.arg("direction");
              lightDirection.toUpperCase();
              latitude = server.arg("lat").toFloat();
              longitude = server.arg("lng").toFloat();

              saveConfiguration();

              server.send(200, "text/html; charset=utf-8",
                          "<html><body style='text-align:center;padding:50px;background:#2c3e50;color:white;'>"
                          "<h1>Saved!</h1><p>Restarting...</p></body></html>");
              delay(3000);
              ESP.restart(); });

  server.on("/reset", HTTP_POST, []()
            {
              preferences.begin("traffic-light", false);
              preferences.clear();
              preferences.end();

              server.send(200, "text/html; charset=utf-8",
                          "<html><body style='text-align:center;padding:50px;background:#dc3545;color:white;'>"
                          "<h1>Reset!</h1><p>Restarting...</p></body></html>");
              delay(3000);
              ESP.restart(); });

  server.begin();
  Serial.println("HTTP server started");
}

// ================= TRAFFIC LIGHT CONTROL =================

void setLight(String color)
{
  color.toLowerCase();

  if (color == "green")
  {
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, HIGH);
    currentColor = "green";
  }
  else if (color == "yellow")
  {
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, HIGH);
    digitalWrite(GREEN_PIN, LOW);
    currentColor = "yellow";
  }
  else if (color == "red")
  {
    digitalWrite(RED_PIN, HIGH);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);
    currentColor = "red";
  }
  else
  {
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);
    currentColor = "off";
  }
}

// ================= FIREBASE FUNCTIONS =================

String getJunctionPath()
{
  return "/teams/" + teamId + "/junctions/" + junctionId;
}

String getMyLightPath()
{
  return getJunctionPath() + "/lights/" + lightDirection;
}

void updateMyStatus()
{
  if (!firebaseReady || !app.ready())
    return;

  String path = getMyLightPath();

  static unsigned long lastUpdate = 0;

  // Only send heartbeat every 10 seconds to show board is online
  // Don't send color/time as those come from web control via stream
  if (millis() - lastUpdate < 10000)
    return;

  // Send metadata and online status only
  Database.set<String>(aClient, path + "/direction", lightDirection, aResult);
  Database.set<number_t>(aClient, path + "/lat", number_t(latitude, 6), aResult);
  Database.set<number_t>(aClient, path + "/lng", number_t(longitude, 6), aResult);
  Database.set<bool>(aClient, path + "/online", true, aResult);

  Serial.println("Heartbeat sent");

  lastUpdate = millis();
}

// No longer needed - using stream only
// void fetchLightState() - removed

// Stream callback - fully real-time, no delays
void processStream(AsyncResult &aResult)
{
  // Exits when no result is available
  if (!aResult.isResult())
    return;

  if (aResult.isError())
  {
    Serial.printf("Stream error: %s, code: %d\n", aResult.error().message().c_str(), aResult.error().code());
  }

  if (aResult.available())
  {
    RealtimeDatabaseResult &stream = aResult.to<RealtimeDatabaseResult>();

    if (stream.isStream())
    {
      String path = stream.dataPath();
      String event = stream.event();
      String data = stream.to<String>();

      // Handle specific field updates
      if (path.endsWith("/color"))
      {
        String newColor = data;
        newColor.replace("\"", "");
        newColor.trim();
        newColor.toLowerCase();

        if ((newColor == "red" || newColor == "yellow" || newColor == "green") && newColor != currentColor)
        {
          setLight(newColor);
          Serial.println("► Light changed: " + newColor);
        }
      }
      else if (path.endsWith("/remainingTime"))
      {
        int newTime = data.toInt();
        if (newTime >= 0 && newTime <= 999 && newTime != remainingTime)
        {
          remainingTime = newTime;
          display.showNumberDec(remainingTime);
          // Only log every 5 seconds or final countdown
          if (newTime % 5 == 0 || newTime <= 5)
          {
            Serial.println("► Time: " + String(remainingTime) + "s");
          }
        }
      }
      // Handle initial full object (path is empty or "/")
      else if (path.length() == 0 || path == "/")
      {
        // Parse JSON manually for color
        int colorIdx = data.indexOf("\"color\"");
        if (colorIdx >= 0)
        {
          int colonIdx = data.indexOf(":", colorIdx);
          int quoteStart = data.indexOf("\"", colonIdx);
          int quoteEnd = data.indexOf("\"", quoteStart + 1);
          if (quoteStart >= 0 && quoteEnd > quoteStart)
          {
            String newColor = data.substring(quoteStart + 1, quoteEnd);
            newColor.toLowerCase();
            if ((newColor == "red" || newColor == "yellow" || newColor == "green") && newColor != currentColor)
            {
              setLight(newColor);
              Serial.println("► Light: " + newColor);
            }
          }
        }

        // Parse JSON manually for remainingTime
        int timeIdx = data.indexOf("\"remainingTime\"");
        if (timeIdx >= 0)
        {
          int colonIdx = data.indexOf(":", timeIdx);
          int commaIdx = data.indexOf(",", colonIdx);
          int braceIdx = data.indexOf("}", colonIdx);
          int endIdx = (commaIdx > 0 && commaIdx < braceIdx) ? commaIdx : braceIdx;

          if (colonIdx >= 0 && endIdx > colonIdx)
          {
            String timeStr = data.substring(colonIdx + 1, endIdx);
            timeStr.trim();
            int newTime = timeStr.toInt();
            if (newTime >= 0 && newTime <= 999 && newTime != remainingTime)
            {
              remainingTime = newTime;
              display.showNumberDec(remainingTime);
              Serial.println("► Time: " + String(remainingTime) + "s");
            }
          }
        }
      }
    }
  }
}

// ================= SETUP =================

void setup()
{
  Serial.begin(115200);
  Serial.println("\n\n=== Traffic Light System ===");

  display.setBrightness(7);
  display.showNumberDec(8888);
  delay(1000);

  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(CONFIG_BUTTON, INPUT_PULLUP);

  setLight("off");

  loadConfiguration();

  if (digitalRead(CONFIG_BUTTON) == LOW || wifiSSID.length() == 0)
  {
    startConfigMode();
    return;
  }

  Serial.println("Team: " + teamId);
  Serial.println("Junction: " + junctionId);
  Serial.println("Direction: " + lightDirection);
  Serial.println("Connecting to: " + sanitizeASCII(wifiSSID));

  String cleanSSID = sanitizeASCII(wifiSSID);
  WiFi.begin(cleanSSID.c_str(), wifiPass.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20)
  {
    Serial.print(".");
    delay(500);
    attempts++;
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("\nWiFi failed - entering config mode");
    delay(2000);
    startConfigMode();
    return;
  }

  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());

  Firebase.printf("Firebase Client v%s\n", FIREBASE_CLIENT_VERSION);

  ssl_client.setInsecure();

  Serial.println("Initializing Firebase...");

  initializeApp(aClient, app, getAuth(user_auth));
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);

  attempts = 0;
  while (!app.ready() && attempts < 30)
  {
    app.loop();
    delay(500);
    attempts++;
    Serial.print(".");
  }

  if (app.ready())
  {
    Serial.println("\nFirebase connected");
    firebaseReady = true;

    stream_ssl_client.setInsecure();

    // Set SSE filters to match official example
    streamClient.setSSEFilters("get,put,patch,keep-alive,cancel,auth_revoked");

    // Start streaming - this is the PRIMARY way we get updates
    Database.get(streamClient, getMyLightPath(), processStream, true /* SSE mode (HTTP Streaming) */, "streamTask");

    Serial.println("Real-time streaming started for: " + getMyLightPath());

    // Wait a moment for stream to initialize
    delay(2000);

    // Fetch initial values once
    Serial.println("Fetching initial state...");
    String myPath = getMyLightPath();

    String initialColor = Database.get<String>(aClient, myPath + "/color");
    if (aClient.lastError().code() == 0)
    {
      initialColor.replace("\"", "");
      initialColor.trim();
      initialColor.toLowerCase();
      if (initialColor == "red" || initialColor == "yellow" || initialColor == "green")
      {
        setLight(initialColor);
        Serial.println("Initial color: " + initialColor);
      }
    }

    int initialTime = Database.get<int>(aClient, myPath + "/remainingTime");
    if (aClient.lastError().code() == 0)
    {
      remainingTime = initialTime;
      display.showNumberDec(remainingTime);
      Serial.println("Initial time: " + String(remainingTime) + "s");
    }

    Serial.println("Ready! Listening for updates...");

    // Send initial heartbeat
    updateMyStatus();
  }
  else
  {
    Serial.println("\nFirebase init failed");
  }

  Serial.println("\n=== System Ready - Direction " + lightDirection + " ===\n");
}

// ================= MAIN LOOP =================

void loop()
{
  if (configMode)
  {
    server.handleClient();
    delay(10);
    return;
  }

  // CRITICAL: Process authentication and streaming in real-time
  app.loop();
  Database.loop();

  // Check config button (hold 3 seconds to restart)
  static unsigned long buttonPressTime = 0;
  if (digitalRead(CONFIG_BUTTON) == LOW)
  {
    if (buttonPressTime == 0)
    {
      buttonPressTime = millis();
    }
    else if (millis() - buttonPressTime > 3000)
    {
      Serial.println("Config button held - restarting...");
      ESP.restart();
    }
  }
  else
  {
    buttonPressTime = 0;
  }

  // Send heartbeat every 10 seconds (just online status)
  static unsigned long lastHeartbeat = 0;
  if (app.ready() && millis() - lastHeartbeat > 10000)
  {
    updateMyStatus();
    lastHeartbeat = millis();
  }

  // Minimal delay - spend most time processing streams
  delay(10);
}