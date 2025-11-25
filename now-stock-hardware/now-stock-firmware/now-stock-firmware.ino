#include <SPI.h>
#include <MFRC522.h>

// --- PINAGEM (ESP32 DevKit V1) ---
#define SS_PIN  5
#define RST_PIN 21 // Conforme sua última configuração

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200); // Velocidade importante!
  SPI.begin();
  rfid.PCD_Init();
  
  // Opcional: Enviar uma mensagem de "Pronto" para o front saber que conectou
  // Serial.println("READY"); 
}

void loop() {
  // 1. Procura novos cartões
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  // 2. Formata o ID da Tag
  String tagID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tagID += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    tagID += String(rfid.uid.uidByte[i], HEX);
  }
  tagID.toUpperCase();

  // 3. Envia para o PC via USB
  // O formato JSON facilita a leitura pelo Frontend
  Serial.print("{\"tag\":\"");
  Serial.print(tagID);
  Serial.println("\"}");

  // 4. Pausa para não ler a mesma tag 50 vezes num segundo
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(1000);
}