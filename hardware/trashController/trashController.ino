#include "FastLED.h"
#include <SPI.h>
#include <WiFi101.h>
#include<WiFiSSLClient.h>
#include <Wire.h>
#include <ADXL345.h>


// Sensors

const int distancePin = A0;  // Analog input pin that the Sharp RangeFinder is attached to
const int ldrPin = A1; // Analog input pin that the LDR is attached to
const int ldrLed = 6; // white led for color sorting 

int distanceValue = 0;        // value read from the pot
int colorValue = 0;        // value output to the PWM (analog out)

int state = 0; // finished state machine working

// APA102 things

#if FASTLED_VERSION < 3001000
#error "Requires FastLED 3.1 or later; check github for latest code."
#endif

#define DATA_PIN    3
#define CLK_PIN   4
#define LED_TYPE    APA102
#define COLOR_ORDER GRB
#define NUM_LEDS    4
CRGB leds[NUM_LEDS];

#define BRIGHTNESS          96
#define FRAMES_PER_SECOND  120


// Wifi data

const char* ssid = "Fab Visitors";    //  your network SSID (name)
const char* password = "Tonality";  // your network password
const char* host = "maker.ifttt.com";  

WiFiSSLClient client;

ADXL345 adxl; //variable adxl is an instance of the ADXL345 library

unsigned long ActivityTimer;
unsigned long SpreadsheetTimer;
int LastStatus = -1;
int Counter;


void setup() {
  SerialUSB.begin(115200);

  //  while (!Serial);
  Serial.print("connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  //  Use WiFiClientSecure class to create TLS connection
  Serial.print("connecting to ");
  Serial.println(host);
  if (!client.connect(host, 443)) {
    Serial.println("connection failed");
    return;
  }
  Serial.println("You're connected to the network");

  pinMode(ldrLed, OUTPUT);

  adxl.powerOn();
  SetAccelerometer();
}

void loop() {

  
  
  int Status = ReadAccelerometer();

  if ( Status == 1 && LastStatus != 1) {
    Serial.println("Timer started");
    LastStatus = 1;
    ActivityTimer = millis();
  }

  else if ( Status == 0 && LastStatus != 0) {
    Serial.println("Timer stopped");
    LastStatus = 0;
    Counter = Counter + (millis() - ActivityTimer) / 1000; // Transform millis in seconds
  }



  if (millis() - SpreadsheetTimer > 30*1000){

    if (LastStatus == 1) {
      Counter = Counter + (millis() - ActivityTimer) / 1000; // Transform millis in seconds
      LastStatus = -1;
    }

    Serial.println("Writing on spreadsheet...");
    WriteOnSpreadsheet(Counter);
    Counter = 0;
    Serial.println("Done!");
    SpreadsheetTimer=millis();
  }

}



void WriteOnSpreadsheet(int Counter) {



  String ActivityTime = String(Counter);
  Serial.println(ActivityTime);
  String  data = "{\"value1\":\"" + ActivityTime + "\"}";

  if (client.connect(host, 443)) {
    client.println("POST /trigger/Track_it/with/key/b4MkULNEPLb52a_inXfT4d HTTP/1.1");
    client.println("Host: maker.ifttt.com");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(data.length());
    client.println();
    client.print(data);

    client.stop();  // DISCONNECT FROM THE SERVER
    
  }
  else {
    Serial.println("FAILED");
  }

}



int ReadAccelerometer() {

  int x, y, z;
  adxl.readXYZ(&x, &y, &z); //read the accelerometer values and store them in variables  x,y,z
  double xyz[3];
  double ax, ay, az;
  adxl.getAcceleration(xyz);
  ax = xyz[0];
  ay = xyz[1];
  az = xyz[2];
  byte interrupts = adxl.getInterruptSource();


  //inactivity
  if (adxl.triggered(interrupts, ADXL345_INACTIVITY)) {
    return 0;
  }

  //activity
  else if (adxl.triggered(interrupts, ADXL345_ACTIVITY)) {
    return 1;
  }
  
  else return -1;
}

void SetAccelerometer() {
  //set activity/ inactivity thresholds (0-255)
  adxl.setActivityThreshold(75); //62.5mg per increment
  adxl.setInactivityThreshold(75); //62.5mg per increment
  adxl.setTimeInactivity(5); // how many seconds of no activity is inactive?

  //look of activity movement on this axes - 1 == on; 0 == off
  adxl.setActivityX(1);
  adxl.setActivityY(1);
  adxl.setActivityZ(1);

  //look of inactivity movement on this axes - 1 == on; 0 == off
  adxl.setInactivityX(1);
  adxl.setInactivityY(1);
  adxl.setInactivityZ(1);

  //look of tap movement on this axes - 1 == on; 0 == off
  adxl.setTapDetectionOnX(0);
  adxl.setTapDetectionOnY(0);
  adxl.setTapDetectionOnZ(1);

  //set values for what is a tap, and what is a double tap (0-255)
  adxl.setTapThreshold(50); //62.5mg per increment
  adxl.setTapDuration(15); //625us per increment
  adxl.setDoubleTapLatency(80); //1.25ms per increment
  adxl.setDoubleTapWindow(200); //1.25ms per increment

  //set values for what is considered freefall (0-255)
  adxl.setFreeFallThreshold(7); //(5 - 9) recommended - 62.5mg per increment
  adxl.setFreeFallDuration(45); //(20 - 70) recommended - 5ms per increment

  //setting all interrupts to take place on int pin 1
  //I had issues with int pin 2, was unable to reset it
  adxl.setInterruptMapping( ADXL345_INT_SINGLE_TAP_BIT,   ADXL345_INT1_PIN );
  adxl.setInterruptMapping( ADXL345_INT_DOUBLE_TAP_BIT,   ADXL345_INT1_PIN );
  adxl.setInterruptMapping( ADXL345_INT_FREE_FALL_BIT,    ADXL345_INT1_PIN );
  adxl.setInterruptMapping( ADXL345_INT_ACTIVITY_BIT,     ADXL345_INT1_PIN );
  adxl.setInterruptMapping( ADXL345_INT_INACTIVITY_BIT,   ADXL345_INT1_PIN );

  //register interrupt actions - 1 == on; 0 == off
  adxl.setInterrupt( ADXL345_INT_SINGLE_TAP_BIT, 1);
  adxl.setInterrupt( ADXL345_INT_DOUBLE_TAP_BIT, 1);
  adxl.setInterrupt( ADXL345_INT_FREE_FALL_BIT,  1);
  adxl.setInterrupt( ADXL345_INT_ACTIVITY_BIT,   1);
  adxl.setInterrupt( ADXL345_INT_INACTIVITY_BIT, 1);
}
