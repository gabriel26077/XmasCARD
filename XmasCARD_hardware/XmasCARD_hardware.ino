#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define SDA 5 // Conectado ao pino D5 do ESP32
#define RST 36 // Conectado ao pino VP do ESP32

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

constexpr uint8_t RST_PIN = 2;
constexpr uint8_t SS_PIN = 5;

enum estados_possiveis { cadastro, gastar_credito, aguardando_resposta_cadastro, aguardando_resposta_gastar };
estados_possiveis ESTADO_ATUAL = gastar_credito;

MFRC522 mfrc522(SS_PIN, RST_PIN);

const char* ssid = "SSID da sua rede wifi";
const char* password = "senha da sua rede wifi";
const char* mqtt_server = "ip do servidor mqtt";
const int mqtt_port = 1883;  // porta do servidor mqtt
const char* mqtt_topic = "cloud2edge";
const char* mqtt_user = "usuário mqtt";
const char* mqtt_pass = "senaha do usuário mqtt";

WiFiClient espClient;
PubSubClient client(espClient);

String nome = "";

void showOnDisplay(const String& message) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(message);
  display.display();
}

void connectToWiFi() {
  Serial.print("Conectando ao WiFi");
  showOnDisplay("Conectando ao WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
    showOnDisplay("Conectando ao WiFi...\nAguarde...");
  }

  Serial.println("\nConectado ao WiFi!");
  showOnDisplay("WiFi Conectado!");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conectar ao MQTT...");
    showOnDisplay("Conectando ao MQTT...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
      Serial.println("Conectado ao MQTT!");
      showOnDisplay("MQTT Conectado!");
      client.subscribe(mqtt_topic);
    } else {
      Serial.print("Falha, rc=");
      Serial.print(client.state());
      Serial.println(" Tentando novamente em 5 segundos...");
      showOnDisplay("Falha ao conectar MQTT.\nTentando novamente...");
      delay(5000);
    }
  }
}

String formatCadastroMessage(const String& nome) {
  return "Aproxime o cartao\nPara o cadastro de\n" + nome;
}

String formatResponseMessage(const String& uid, const String& action, const String& estado) {
  return action + " UID:\n" + uid + "\n\n" + estado;
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida no topico [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message = ""; // Cria uma string para armazenar a mensagem
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]); // Imprime cada caractere
    message += (char)payload[i];   // Adiciona cada caractere à string
  }
  Serial.println();
  
  if (message.startsWith("CAD_REQ_IDCARD")) {
    ESTADO_ATUAL = cadastro;
    nome = message.substring(15);

    String buffer = "Aproxime o cartao\nPara o cadastro de\n" + nome;
    showOnDisplay(buffer.c_str());
  } 
  else if (message.startsWith("CLOUD_RESP") && ESTADO_ATUAL == aguardando_resposta_cadastro) {
    String resp = message.substring(11);
    showOnDisplay(resp.c_str());
    ESTADO_ATUAL = gastar_credito;
    delay(2000);
  } 
  else if (message.startsWith("CLOUD_RESP") && ESTADO_ATUAL == aguardando_resposta_gastar) {
    String resp = message.substring(11);
    showOnDisplay(resp.c_str());
    ESTADO_ATUAL = gastar_credito;
    delay(2000);
  }
}


void setup() {
  Serial.begin(9600);
  SPI.begin(18, 19, 23);
  mfrc522.PCD_Init();
  Serial.println("Aproxime o cartao do leitor...");

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }

  display.clearDisplay();
  display.display();
  delay(2000);

  connectToWiFi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  showOnDisplay("Configuracoes iniciadas!\nAproxime o cartao...");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }

  if (ESTADO_ATUAL == gastar_credito) {
    showOnDisplay("Aproxime o cartao");
  }
  
  client.loop();

  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String uid_lido = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) uid_lido += String(mfrc522.uid.uidByte[i], HEX);
  Serial.print("UID do cartao: " + uid_lido);
  Serial.println();

  if (ESTADO_ATUAL == cadastro) {
    String message = "ID_PARA_CAD " + uid_lido;
    if (client.publish("edge2cloud", message.c_str())) {
      showOnDisplay(formatResponseMessage(uid_lido, "Enviando ID Card", "Aguardando resposta do Servidor..."));
      ESTADO_ATUAL = aguardando_resposta_cadastro;
      Serial.println("Enviado: " + message);
    } else {
      Serial.println("Falha ao enviar mensagem para edge2cloud.");
    }
  }

  if (ESTADO_ATUAL == gastar_credito) {
    String message = "GASTAR_CRED " + uid_lido;
    if (client.publish("edge2cloud", message.c_str())) {
      showOnDisplay(formatResponseMessage(uid_lido, "CARD UID", "Aguardando resposta do servidor..."));
      ESTADO_ATUAL = aguardando_resposta_gastar;
      Serial.println("Enviado: " + message);
    } else {
      Serial.println("Falha ao enviar mensagem para edge2cloud.");
    }
    delay(100);
  }

  mfrc522.PICC_HaltA();
}
