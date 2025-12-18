#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <LittleFS.h>
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
String trafficLightId = "10";

// Firebase Configuration (loaded from .env file)
String API_KEY = "";
String DATABASE_URL = "";
String USER_EMAIL = "";
String USER_PASSWORD = "";

// Firebase objects
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);

WiFiClientSecure stream_ssl_client;
AsyncClient streamClient(stream_ssl_client);

UserAuth *user_auth = nullptr;
FirebaseApp app;
RealtimeDatabase Database;
AsyncResult aResult;

bool firebaseReady = false;
bool configMode = false;
bool isOnline = true; // Track WiFi connection status

// Current state from Firebase (updated via stream)
int currentColor = 1; // 1=red, 2=yellow, 3=green
int remainingTime = 0;
int currentStatus = 0;  // 0=active, 1=broken, 2=fixing
int yellowDuration = 0; // yellow_duration from Firebase

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
            <p>Team: %TEAM_ID% | Light ID: %LIGHT_ID%</p>
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
                    <label>Traffic Light ID</label>
                    <input type="text" name="lightid" value="%LIGHT_ID%" required>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <h3 style="margin-bottom: 20px;">Firebase Configuration</h3>
                <div class="form-group">
                    <label>API Key</label>
                    <input type="text" name="fb_key" value="%FB_KEY%" required>
                </div>
                <div class="form-group">
                    <label>Database URL</label>
                    <input type="text" name="fb_url" value="%FB_URL%" required>
                </div>
                <div class="form-group">
                    <label>User Email</label>
                    <input type="text" name="fb_email" value="%FB_EMAIL%" required>
                </div>
                <div class="form-group">
                    <label>User Password</label>
                    <input type="password" name="fb_pass" value="%FB_PASS%" required>
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
  result.replace("%LIGHT_ID%", htmlEscape(trafficLightId));
  result.replace("%LAT%", "");
  result.replace("%LNG%", "");
  result.replace("%FB_KEY%", htmlEscape(API_KEY));
  result.replace("%FB_URL%", htmlEscape(DATABASE_URL));
  result.replace("%FB_EMAIL%", htmlEscape(USER_EMAIL));
  result.replace("%FB_PASS%", htmlEscape(USER_PASSWORD));
  return result;
}

// ================= CONFIGURATION FUNCTIONS =================

void loadFirebaseConfig()
{
  // Priority 1: Try to load from Preferences (saved via config mode)
  preferences.begin("traffic-light", false);
  API_KEY = preferences.getString("fb_key", "");
  DATABASE_URL = preferences.getString("fb_url", "");
  USER_EMAIL = preferences.getString("fb_email", "");
  USER_PASSWORD = preferences.getString("fb_pass", "");
  preferences.end();

  bool loadedFromPreferences = (API_KEY.length() > 0 && DATABASE_URL.length() > 0 &&
                                 USER_EMAIL.length() > 0 && USER_PASSWORD.length() > 0);

  // Priority 2: Try to load from .env file if not in preferences
  if (!loadedFromPreferences && LittleFS.begin(true))
  {
    File file = LittleFS.open("/.env", "r");
    if (file)
    {
      Serial.println("Reading .env file...");
      while (file.available())
      {
        String line = file.readStringUntil('\n');
        line.trim();

        // Skip empty lines and comments
        if (line.length() == 0 || line.startsWith("#"))
          continue;

        int separatorIndex = line.indexOf('=');
        if (separatorIndex == -1)
          continue;

        String key = line.substring(0, separatorIndex);
        String value = line.substring(separatorIndex + 1);

        key.trim();
        value.trim();

        // Remove quotes if present
        if (value.startsWith("\"") && value.endsWith("\""))
        {
          value = value.substring(1, value.length() - 1);
        }

        // Assign values to configuration variables
        if (key == "API_KEY")
          API_KEY = value;
        else if (key == "DATABASE_URL")
          DATABASE_URL = value;
        else if (key == "USER_EMAIL")
          USER_EMAIL = value;
        else if (key == "USER_PASSWORD")
          USER_PASSWORD = value;
      }

      file.close();
      loadedFromPreferences = (API_KEY.length() > 0 && DATABASE_URL.length() > 0 &&
                               USER_EMAIL.length() > 0 && USER_PASSWORD.length() > 0);
    }
    LittleFS.end();
  }

  // Display config source
  if (loadedFromPreferences)
  {
    Serial.println("Firebase config loaded successfully");
    Serial.println("API_KEY: " + API_KEY.substring(0, min(10, (int)API_KEY.length())) + "...");
    Serial.println("DATABASE_URL: " + DATABASE_URL);
    Serial.println("USER_EMAIL: " + USER_EMAIL);
  }
  else
  {
    Serial.println("WARNING: No Firebase configuration found");
    Serial.println("Please configure in config mode or upload .env file");
  }
}

void loadConfiguration()
{
  preferences.begin("traffic-light", false);
  wifiSSID = preferences.getString("ssid", "");
  wifiPass = preferences.getString("pass", "");
  teamId = preferences.getString("team", "10");
  trafficLightId = preferences.getString("lightid", "10");
  preferences.end();
}

void saveConfiguration()
{
  preferences.begin("traffic-light", false);
  preferences.putString("ssid", wifiSSID);
  preferences.putString("pass", wifiPass);
  preferences.putString("team", teamId);
  preferences.putString("lightid", trafficLightId);
  preferences.end();
}

void startConfigMode()
{
  Serial.println("\n=== ENTERING CONFIG MODE ===");
  configMode = true;

  // Load Firebase config so it shows in the form
  loadFirebaseConfig();

  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_AP);

  String apName = "TrafficLight-" + trafficLightId + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);
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
              trafficLightId = server.arg("lightid");

              // Save Firebase credentials
              API_KEY = server.arg("fb_key");
              DATABASE_URL = server.arg("fb_url");
              USER_EMAIL = server.arg("fb_email");
              USER_PASSWORD = server.arg("fb_pass");

              saveConfiguration();

              // Save Firebase config to preferences
              preferences.begin("traffic-light", false);
              preferences.putString("fb_key", API_KEY);
              preferences.putString("fb_url", DATABASE_URL);
              preferences.putString("fb_email", USER_EMAIL);
              preferences.putString("fb_pass", USER_PASSWORD);
              preferences.end();

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

void setLight(int color)
{
  // color: 1=red, 2=yellow, 3=green
  if (color == 3)
  {
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, HIGH);
    currentColor = 3;
  }
  else if (color == 2)
  {
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, HIGH);
    digitalWrite(GREEN_PIN, LOW);
    currentColor = 2;
  }
  else if (color == 1)
  {
    digitalWrite(RED_PIN, HIGH);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);
    currentColor = 1;
  }
  else
  {
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);
    currentColor = 0;
  }
}

// ================= FIREBASE FUNCTIONS =================

String getMyLightPath()
{
  return "/teams/" + teamId + "/traffic_lights/" + trafficLightId;
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

  // Send online status only
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
        int newColor = data.toInt();
        if ((newColor >= 1 && newColor <= 3) && newColor != currentColor)
        {
          setLight(newColor);
          String colorName = (newColor == 1) ? "red" : (newColor == 2) ? "yellow"
                                                                       : "green";
          Serial.println("► Light changed: " + colorName);
          // Update display time when color changes (especially when switching to green)
          int displayTime = (newColor == 3) ? max(0, remainingTime - yellowDuration) : remainingTime;
          display.showNumberDec(displayTime);
        }
      }
      else if (path.endsWith("/remaintime"))
      {
        int newTime = data.toInt();
        if (newTime >= 0 && newTime <= 9999 && newTime != remainingTime)
        {
          remainingTime = newTime;
          // If color is green, subtract yellow_duration from remaintime for display
          int displayTime = (currentColor == 3) ? max(0, remainingTime - yellowDuration) : remainingTime;
          display.showNumberDec(displayTime);
          // Only log every 5 seconds or final countdown
          if (newTime % 5 == 0 || newTime <= 5)
          {
            Serial.println("► Time: " + String(remainingTime) + "s (display: " + String(displayTime) + "s)");
          }
        }
      }
      else if (path.endsWith("/yellow_duration"))
      {
        int newYellowDuration = data.toInt();
        if (newYellowDuration >= 0 && newYellowDuration != yellowDuration)
        {
          yellowDuration = newYellowDuration;
          Serial.println("► Yellow duration: " + String(yellowDuration) + "s");
          // Update display if currently green
          if (currentColor == 3)
          {
            int displayTime = max(0, remainingTime - yellowDuration);
            display.showNumberDec(displayTime);
          }
        }
      }
      else if (path.endsWith("/status"))
      {
        int newStatus = data.toInt();
        if (newStatus >= 0 && newStatus <= 2 && newStatus != currentStatus)
        {
          currentStatus = newStatus;
          String statusName = (newStatus == 0) ? "active" : (newStatus == 1) ? "broken"
                                                                             : "fixing";
          Serial.println("► Status changed: " + statusName);
        }
      }
      // Handle initial full object (path is empty or "/")
      else if (path.length() == 0 || path == "/")
      {
        // Parse JSON manually for color (now integer)
        int colorIdx = data.indexOf("\"color\"");
        if (colorIdx >= 0)
        {
          int colonIdx = data.indexOf(":", colorIdx);
          int commaIdx = data.indexOf(",", colonIdx);
          int braceIdx = data.indexOf("}", colonIdx);
          int endIdx = (commaIdx > 0 && commaIdx < braceIdx) ? commaIdx : braceIdx;

          if (colonIdx >= 0 && endIdx > colonIdx)
          {
            String colorStr = data.substring(colonIdx + 1, endIdx);
            colorStr.trim();
            int newColor = colorStr.toInt();
            if ((newColor >= 1 && newColor <= 3) && newColor != currentColor)
            {
              setLight(newColor);
              String colorName = (newColor == 1) ? "red" : (newColor == 2) ? "yellow"
                                                                           : "green";
              Serial.println("► Light: " + colorName);
            }
          }
        }

        // Parse JSON manually for remaintime
        int timeIdx = data.indexOf("\"remaintime\"");
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
            if (newTime >= 0 && newTime <= 9999 && newTime != remainingTime)
            {
              remainingTime = newTime;
              int displayTime = (currentColor == 3) ? max(0, remainingTime - yellowDuration) : remainingTime;
              display.showNumberDec(displayTime);
              Serial.println("► Time: " + String(remainingTime) + "s (display: " + String(displayTime) + "s)");
            }
          }
        }

        // Parse JSON manually for yellow_duration
        int yellowIdx = data.indexOf("\"yellow_duration\"");
        if (yellowIdx >= 0)
        {
          int colonIdx = data.indexOf(":", yellowIdx);
          int commaIdx = data.indexOf(",", colonIdx);
          int braceIdx = data.indexOf("}", colonIdx);
          int endIdx = (commaIdx > 0 && commaIdx < braceIdx) ? commaIdx : braceIdx;

          if (colonIdx >= 0 && endIdx > colonIdx)
          {
            String yellowStr = data.substring(colonIdx + 1, endIdx);
            yellowStr.trim();
            int newYellowDuration = yellowStr.toInt();
            if (newYellowDuration >= 0 && newYellowDuration != yellowDuration)
            {
              yellowDuration = newYellowDuration;
              Serial.println("► Yellow duration: " + String(yellowDuration) + "s");
            }
          }
        }

        // Parse JSON manually for status
        int statusIdx = data.indexOf("\"status\"");
        if (statusIdx >= 0)
        {
          int colonIdx = data.indexOf(":", statusIdx);
          int commaIdx = data.indexOf(",", colonIdx);
          int braceIdx = data.indexOf("}", colonIdx);
          int endIdx = (commaIdx > 0 && commaIdx < braceIdx) ? commaIdx : braceIdx;

          if (colonIdx >= 0 && endIdx > colonIdx)
          {
            String statusStr = data.substring(colonIdx + 1, endIdx);
            statusStr.trim();
            int newStatus = statusStr.toInt();
            if (newStatus >= 0 && newStatus <= 2 && newStatus != currentStatus)
            {
              currentStatus = newStatus;
              String statusName = (newStatus == 0) ? "active" : (newStatus == 1) ? "broken"
                                                                                 : "fixing";
              Serial.println("► Status: " + statusName);
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

  setLight(0); // Turn off all lights

  loadConfiguration();

  if (digitalRead(CONFIG_BUTTON) == LOW || wifiSSID.length() == 0)
  {
    startConfigMode();
    return;
  }

  Serial.println("Team: " + teamId);
  Serial.println("Traffic Light ID: " + trafficLightId);
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

  // Load Firebase configuration from .env file (with fallback to defaults)
  loadFirebaseConfig();

  Firebase.printf("Firebase Client v%s\n", FIREBASE_CLIENT_VERSION);

  ssl_client.setInsecure();

  Serial.println("Initializing Firebase...");

  // Initialize UserAuth with loaded credentials
  user_auth = new UserAuth(API_KEY.c_str(), USER_EMAIL.c_str(), USER_PASSWORD.c_str(), 3000);

  initializeApp(aClient, app, getAuth(*user_auth));
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL.c_str());

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

    int initialColor = Database.get<int>(aClient, myPath + "/color");
    if (aClient.lastError().code() == 0)
    {
      if (initialColor >= 1 && initialColor <= 3)
      {
        setLight(initialColor);
        String colorName = (initialColor == 1) ? "red" : (initialColor == 2) ? "yellow"
                                                                             : "green";
        Serial.println("Initial color: " + colorName);
      }
    }

    int initialYellowDuration = Database.get<int>(aClient, myPath + "/yellow_duration");
    if (aClient.lastError().code() == 0)
    {
      yellowDuration = initialYellowDuration;
      Serial.println("Initial yellow duration: " + String(yellowDuration) + "s");
    }

    int initialTime = Database.get<int>(aClient, myPath + "/remaintime");
    if (aClient.lastError().code() == 0)
    {
      remainingTime = initialTime;
      int displayTime = (currentColor == 3) ? max(0, remainingTime - yellowDuration) : remainingTime;
      display.showNumberDec(displayTime);
      Serial.println("Initial time: " + String(remainingTime) + "s (display: " + String(displayTime) + "s)");
    }

    int initialStatus = Database.get<int>(aClient, myPath + "/status");
    if (aClient.lastError().code() == 0)
    {
      currentStatus = initialStatus;
      String statusName = (initialStatus == 0) ? "active" : (initialStatus == 1) ? "broken"
                                                                                 : "fixing";
      Serial.println("Initial status: " + statusName);
    }

    Serial.println("Ready! Listening for updates...");

    // Send initial heartbeat
    updateMyStatus();
  }
  else
  {
    Serial.println("\nFirebase init failed");
  }

  Serial.println("\n=== System Ready - Light ID " + trafficLightId + " ===\n");
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

  // Check WiFi connection status
  static unsigned long lastWiFiCheck = 0;
  if (millis() - lastWiFiCheck > 5000) // Check every 5 seconds
  {
    bool wasOnline = isOnline;
    isOnline = (WiFi.status() == WL_CONNECTED);

    if (wasOnline && !isOnline)
    {
      Serial.println("WiFi disconnected! Entering offline mode...");
    }
    else if (!wasOnline && isOnline)
    {
      Serial.println("WiFi reconnected! Restoring normal operation...");
      // Restore normal state
      setLight(currentColor);
      int displayTime = (currentColor == 3) ? max(0, remainingTime - yellowDuration) : remainingTime;
      display.showNumberDec(displayTime);
    }

    lastWiFiCheck = millis();
  }

  // CRITICAL: Process authentication and streaming in real-time (only when online)
  if (isOnline)
  {
    app.loop();
    Database.loop();
  }

  // Handle offline status with blinking behavior (HIGHEST PRIORITY)
  static unsigned long lastBlinkTime = 0;
  static bool blinkState = false;

  if (!isOnline) // Offline - blink all lights
  {
    // Blink every 300ms (faster to indicate urgency)
    if (millis() - lastBlinkTime > 300)
    {
      blinkState = !blinkState;

      if (blinkState)
      {
        // Turn on all lights and show "----"
        digitalWrite(RED_PIN, HIGH);
        digitalWrite(YELLOW_PIN, HIGH);
        digitalWrite(GREEN_PIN, HIGH);
        display.setSegments(new uint8_t[4]{0x40, 0x40, 0x40, 0x40}); // Show ----
      }
      else
      {
        // Turn off all lights and clear display
        digitalWrite(RED_PIN, LOW);
        digitalWrite(YELLOW_PIN, LOW);
        digitalWrite(GREEN_PIN, LOW);
        display.clear();
      }

      lastBlinkTime = millis();
    }
  }
  else if (currentStatus == 1 || currentStatus == 2) // broken or fixing
  {
    // Blink every 500ms
    if (millis() - lastBlinkTime > 500)
    {
      blinkState = !blinkState;

      if (blinkState)
      {
        // Turn on red light and show 0000
        digitalWrite(RED_PIN, HIGH);
        digitalWrite(YELLOW_PIN, LOW);
        digitalWrite(GREEN_PIN, LOW);
        display.showNumberDec(0, true); // true = show leading zeros
      }
      else
      {
        // Turn off all lights and clear display
        digitalWrite(RED_PIN, LOW);
        digitalWrite(YELLOW_PIN, LOW);
        digitalWrite(GREEN_PIN, LOW);
        display.clear();
      }

      lastBlinkTime = millis();
    }
  }
  else if (currentStatus == 0) // active/normal
  {
    // Normal operation - display and lights are controlled by stream updates
    // Reset blink state if we just transitioned from broken/fixing
    static int previousStatus = 0;
    if (previousStatus != currentStatus)
    {
      // Restore normal state
      setLight(currentColor);
      int displayTime = (currentColor == 3) ? max(0, remainingTime - yellowDuration) : remainingTime;
      display.showNumberDec(displayTime);
      previousStatus = currentStatus;
    }
  }

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