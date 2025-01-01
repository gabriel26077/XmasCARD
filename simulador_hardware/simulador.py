import threading
import paho.mqtt.client as mqtt
import time

# Configurações MQTT
BROKER = "127.0.0.1" # loopback : ip do broker que em teoria está rodando na máquina local
PORT = 1883          # porta em que o broker mqtt está anexada
USERNAME = "usuário mqtt"
PASSWORD = "senha do usuário mqtt"
SUBSCRIBE_TOPIC = "cloud2edge"  # Tópico para receber comandos
PUBLISH_TOPIC = "edge2cloud"    # Tópico para enviar dados

# Variáveis globais
state = "gastar"  # Estado inicial
lock = threading.Lock()  # Usado para proteger a modificação do estado
message_received = None  # Mensagem recebida do servidor
connected_event = threading.Event()  # Evento para sinalizar quando a conexão é estabelecida


def on_connect(client, userdata, flags, rc):
    """Callback para quando o cliente se conecta ao broker MQTT."""
    print(f"Conectado com código {rc}")
    connected_event.set()  # Sinaliza que a conexão foi bem-sucedida
    client.subscribe(SUBSCRIBE_TOPIC)


def on_message(client, userdata, msg):
    """Callback de mensagens recebidas."""
    global state, message_received
    topic = msg.topic
    payload = msg.payload.decode("utf-8")
    
    # Alteração do estado ao receber a mensagem CAD_REQ_IDCARD
    if topic == SUBSCRIBE_TOPIC and payload.startswith("CAD_REQ_IDCARD"):
        with lock:
            state = "cadastro"

    # Armazena a resposta recebida
    with lock:
        message_received = payload


def wait_for_response(timeout):
    """Função que espera pela resposta do servidor por um tempo limitado."""
    global message_received
    start_time = time.time()
    while time.time() - start_time < timeout:
        time.sleep(0.1)  # Espera um pouco para não sobrecarregar o CPU
        with lock:
            if message_received:
                response = message_received
                message_received = None  # Limpa a mensagem após receber
                return response
    return None  # Retorna None se o tempo esgotar


def handle_input(client):
    """Função para gerenciar o input contínuo do usuário."""
    global state
    while True:
        try:
            user_input = input("Digite um ID: ").strip()
            if not user_input:
                continue

            # Envia o input dependendo do estado
            with lock:
                current_state = state
                if current_state == "cadastro":
                    message = f"ID_PARA_CAD {user_input}"
                    print(f"Enviando ID para cadastro: {message}")
                else:
                    message = f"GASTAR_CRED {user_input}"
                    print(f"Enviando ID para gastar créditos: {message}")

            # Publica a mensagem
            client.publish(PUBLISH_TOPIC, message)

            # Aguarda a resposta do servidor
            _response = wait_for_response(10)  # Espera por 10 segundos
            state = "gastar"
            if _response:
                print(f"Resposta recebida: {_response}")
            else:
                print("Timeout: Nenhuma resposta recebida.")

        except EOFError:
            break
        except KeyboardInterrupt:
            print("\nEncerrando...")
            break


def mqtt_loop():
    """Configura o cliente MQTT e inicializa as threads."""
    client = mqtt.Client()
    client.username_pw_set(USERNAME, PASSWORD)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(BROKER, PORT, 60)

    # Inicia o loop MQTT para ouvir as mensagens
    client.loop_start()

    # Espera até que a conexão MQTT tenha sido estabelecida
    connected_event.wait()

    print("Conexão estabelecida, agora esperando input...")
    
    # Inicia a thread para ler inputs
    threading.Thread(target=handle_input, args=(client,), daemon=True).start()

    try:
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nEncerrando...")
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    mqtt_loop()
