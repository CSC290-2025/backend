#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include "TM1637Display.h"

// Wi-Fi Credentials
const char* WIFI_SSID = "Mobeepengay";
const char* WIFI_PASS = "MOBEEpenGAY007";

// API Configuration
const char* API_BASE_URL = "http://10.174.73.151:3000/api";
const int TRAFFIC_LIGHT_ID = 1;

// TM1637 pins
const uint8_t TM1637_CLK = 19;
const uint8_t TM1637_DIO = 18;

// Traffic Light pins
const uint8_t RED_PIN    = 23;
const uint8_t YELLOW_PIN = 22;
const uint8_t GREEN_PIN  = 21;

// Traffic light durations (seconds)
const int RED_DURATION    = 39;
const int YELLOW_DURATION = 3;
const int GREEN_DURATION  = 10;

// Shared variables (protected by core separation)
 int currentLight = 1;
 int currentnum = RED_DURATION;
 int lastcolor = 1;

TM1637Display display(TM1637_CLK, TM1637_DIO);
WebServer server(80);

// PUT request function
void sendPutRequest() {
  HTTPClient http;

  String url = String(API_BASE_URL) + "/traffic-lights/1" ; //+ String(TRAFFIC_LIGHT_ID)
  
  http.begin(url);  // FIX: Use the constructed url, not API_BASE_URL
  http.addHeader("Content-Type", "application/json");
  
  // FIX: Use modern ArduinoJson API
  JsonDocument doc;

  doc["current_color"] = currentLight;
  doc["status"] = currentnum;
  
  String jsonBody;
  serializeJson(doc, jsonBody);
  
  int httpResponseCode = http.PUT(jsonBody);
  //int httpResponseCode = http.GET();
  
  if (httpResponseCode > 0) {
    Serial.print("PUT Response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.print("PUT Error code: ");
    Serial.println(httpResponseCode);
    Serial.println(url);
  }
  
  http.end();
}

// Task 1: Control traffic light
void taskTrafficlight() {

  Serial.println("Task 1: Traffic Light Control Started");

    if (WiFi.status() == WL_CONNECTED) {
      
      if(currentLight == 1) {  // RED
        digitalWrite(RED_PIN, HIGH);
        digitalWrite(YELLOW_PIN, LOW);
        digitalWrite(GREEN_PIN, LOW);
        Serial.println("RED ON");
      } else if(currentLight == 2) {  // YELLOW
        digitalWrite(RED_PIN, LOW);
        digitalWrite(YELLOW_PIN, HIGH);
        digitalWrite(GREEN_PIN, LOW);
        Serial.println("YELLOW ON");
      } else {  // GREEN (currentLight == 3)
        digitalWrite(RED_PIN, LOW);
        digitalWrite(YELLOW_PIN, LOW);
        digitalWrite(GREEN_PIN, HIGH);
        Serial.println("GREEN ON");
      }

      display.showNumberDec(currentnum);
      Serial.print("Time: ");
      Serial.println(currentnum);
      currentnum--;

      // Transition logic
      if(currentnum < 1) {
        if(currentLight == 1 || currentLight == 3) {
          lastcolor = currentLight;
          currentLight = 2;  // Switch to yellow
          currentnum = YELLOW_DURATION;
        } else if(currentLight == 2) {
          if(lastcolor == 1) {
            currentLight = 3;  // Yellow after red -> go to green
            currentnum = GREEN_DURATION;
          } else {
            currentLight = 1;  // Yellow after green -> go to red
            currentnum = RED_DURATION;
          }
        }
      } 

    } else {
      Serial.println("[Task 1] WiFi disconnected!");
    }
}

// Task 2: Send data to API
void Tasksenddata() {
  Serial.println("Task 2: Data Sending Started");

    if (WiFi.status() == WL_CONNECTED) {
      // FIX: Actually call the sendPutRequest function
      sendPutRequest();
    } else {
      Serial.println("[Task 2] WiFi disconnected!");
    }

}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n=== ESP32 Traffic Light System ===");

  // TM1637 setup
  display.setBrightness(5);
  display.showNumberDec(404);

  // Traffic light pins
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  
  // Turn off all lights initially
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < 15000) {
    Serial.print(".");
    delay(500);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to Wi-Fi.");
    Serial.println("System will continue without API updates.");
  }

  server.begin();
  Serial.println("Traffic light sequence starting...\n");
}

void loop() {
  taskTrafficlight();
  Tasksenddata();
  delay(1000);
   Serial.println(".");
}
