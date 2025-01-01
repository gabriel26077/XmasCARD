// mqtt/mqttClient.js
const mqtt = require('mqtt');  // Biblioteca MQTT
const usuariosService = require('../services/usuarioService'); // Serviço de usuários

// Configuração do broker MQTT
//const brokerUrl = 'mqtt://localhost'; // Alterar para o endereço do seu broker aqui ele vai usar IPV6 o que dá errado

const brokerUrl = 'mqtt://127.0.0.1'; // Alterar para o endereço do seu broker

const client = mqtt.connect(
  brokerUrl,
  {
    username: 'usuário mqtt',
    password: 'senha do usuário mqtt'
  }
);

// Tópicos aos quais o cliente se inscreverá
const TOPICO_T = 'cloud2edge';
const TOPICO_R = 'edge2cloud';

// Função para processar as mensagens recebidas
function processarMensagem(msg) {
  const asciiMessage = Buffer.from(msg, 'hex').toString('ascii');
  console.log(asciiMessage);
}


function enviarMensagemMQTT(mensagem) {
  // Publica a mensagem no tópico de status
  client.publish(TOPICO_T, mensagem, (err) => {
    if (err) {
      console.error('Erro ao enviar mensagem:', err);
    } else {
      console.log(`Mensagem enviada para o tópico ${TOPICO_T}: ${mensagem}`);
    }
  });
}

// Função para conectar
function conectar() {
  client.on('connect', () => {
    console.log('Conectado ao broker MQTT');
    
    // Inscrever-se no tópico de atualizações de usuários
    client.subscribe(TOPICO_R, (err) => {
      if (err) {
        console.error('Erro ao se inscrever no tópico', err);
      } else {
        console.log(`Inscrito no tópico ${TOPICO_R}`);
      }
    });
  });



  // Tratar erros de conexão
  client.on('error', (err) => {
    console.error('Erro de conexão MQTT:', err);
  });
}


// Função para enviar mensagem e esperar a resposta do MQTT


function enviarEEsperarResposta(topicoEnvio, mensagemEnvio, topicoResposta, timeout = 20000) {
  return new Promise((resolve, reject) => {
    // Assina o tópico de resposta
    client.subscribe(topicoResposta, (err) => {
      if (err) {
        return reject('Erro ao se inscrever no tópico de resposta');
      }
    });

    // Publica a mensagem no tópico de envio
    client.publish(topicoEnvio, mensagemEnvio, (err) => {
      if (err) {
        return reject('Erro ao enviar mensagem');
      } else {
        console.log(`mensagem: ${mensagemEnvio} enviada no tópico: ${topicoEnvio}`)
      }
    });

    // Escuta a resposta do broker MQTT
    client.on('message', (topic, message) => {
      if (topic === topicoResposta) {
        // Resolve a Promise com a resposta
        resolve(message.toString());
      }
    });

    // Timeout caso não haja resposta em 20 segundos
    setTimeout(() => {
      reject('Timeout: Não recebeu resposta dentro do tempo limite');
    }, timeout);
  });
}


// Iniciar a conexão e subscrição
conectar();
    
module.exports = { client, enviarEEsperarResposta, enviarMensagemMQTT, TOPICO_R, TOPICO_T};
