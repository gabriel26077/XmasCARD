const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importando o cliente MQTT
const { client, enviarEEsperarResposta, enviarMensagemMQTT, TOPICO_R, TOPICO_T } = require('./mqtt/mqttClient');  // Importa a instância do cliente MQTT

const {
  criarUsuario,
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  adicionaCreditoUsuario,
  removeUsuario,
  criaUsuarioComIdCartaoViaHardware 
} = require('./controllers/usuariosController');
const { gastarCreditoUsuario } = require('./services/usuarioService');



const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Middleware para processar JSON
app.use(bodyParser.json());

// Rotas do CRUD

// CREATE - Adicionar um novo usuário
app.post('/usuarios', criarUsuario);

// CREATE - Adicionar um novo usuário
app.post('/usuarios/criaUsuarioComIdCartaoViaHardware', (req, res) => {
  req.enviarMsgParaHardwareComConfirmacao = enviarEEsperarResposta;
  req.enviarMsgParaHardware = enviarMensagemMQTT;
  criaUsuarioComIdCartaoViaHardware(req,res);
});

// READ - Listar todos os usuários 
app.get('/usuarios', getUsuarios);

// READ - Obter um usuário específico
app.get('/usuarios/:id', getUsuarioById);

// UPDATE - Atualizar um usuário
app.put('/usuarios/:id', updateUsuario);

// PATCH - Adicionar créditos
app.patch('/usuarios/:id/creditos', adicionaCreditoUsuario); // Ajuste para adicionar créditos

// PATCH - Usar créditos
app.patch('/usuarios/gastar_credito/:id', gastarCreditoUsuario); // Ajuste para usar créditos


// DELETE - Remover um usuário
app.delete('/usuarios/:id', removeUsuario);




 // Tratar mensagens recebidas
 client.on('message', (topic, message) => {
  const mensagemTexto = message.toString();
  console.log(`Mensagem recebida no tópico ${topic}: ${mensagemTexto}`);

  if (topic === TOPICO_R) {
    // Verifica a assinatura "GASTAR_CRED ${id}"
    if (mensagemTexto.startsWith("GASTAR_CRED ")) {
      const id = mensagemTexto.split(" ")[1]; // Extrai o ID da mensagem
      gastarCreditoUsuario(id).then((result) => {console.log(result); enviarMensagemMQTT(`CLOUD_RESP ${JSON.stringify(result)}`)})
      console.log(`GASTAR_CRED detectado. ID: ${id}`);
    }
  }
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
