// services/usuariosService.js



const usuariosModel = require('../models/usuariosModel');  // Importando o model

// Função para criar um novo usuário
function criarUsuario({ nome, id_cartao, creditos }) {
  return new Promise((resolve, reject) => {
    if (!nome || !id_cartao || creditos === undefined) {
      reject(new Error('Nome, id_cartao e créditos são obrigatórios.'));
      return;
    }

    // Verifica se o usuário ou cartão já existe
    usuariosModel.checkUsuarioExistente(id_cartao, nome)
      .then(results => {
        if (results.length > 0) {
          reject(new Error('Esse id de cartão já existe para outro usuário ou nome de usuário já cadastrado.'));
          return;
        }

        // Insere o novo usuário no banco
        return usuariosModel.inserirUsuario(nome, id_cartao, creditos);
      })
      .then(result => {
        const novoUsuario = { id: result.insertId, nome, id_cartao, creditos };
        resolve(novoUsuario);
      })
      .catch(err => reject(err));
  });
}


// Função para criar um novo usuário
async function criaUsuarioComIdCartaoViaHardware({ enviarMsgParaHardware, enviarMsgParaHardwareComConfirmacao, nome }) {
  try {
    // Solicita o id_cartao ao hardware
    const hardware_response = await enviarMsgParaHardwareComConfirmacao(
      'cloud2edge',
      `CAD_REQ_IDCARD <${nome}>`,
      'edge2cloud',
      30000
    );

    // Validação da resposta do hardware

    
    const id_cartao = hardware_response.slice(hardware_response.lastIndexOf(" ") + 1); // Ajuste conforme necessário
    const creditos = 0; // Valor padrão inicial

    if (!nome || !id_cartao) {
      throw new Error('Nome e id_cartao são obrigatórios.');
    }

    // Verifica se o usuário já existe
    const results = await usuariosModel.checkUsuarioExistente(id_cartao, nome);
    if (results.length > 0) {
      throw new Error('Esse id de cartão já existe para outro usuário ou nome de usuário já cadastrado.');
    }

    // Insere o novo usuário
    const result = await usuariosModel.inserirUsuario(nome, id_cartao, creditos);
    enviarMsgParaHardware('CLOUD_RESP Cadastro Realizado');
    const novoUsuario = { id: result.insertId, nome, id_cartao, creditos };

    

    return novoUsuario;
  } catch (err) {
    throw err;
  }
}


// Função para obter todos os usuários
function getUsuarios() {
  return usuariosModel.getUsuarios()
    .then(results => results)
    .catch(err => { throw err; });
}

// Função para obter um usuário por ID
function getUsuarioById(id) {
  return usuariosModel.getUsuarioById(id)
    .then(usuario => {
      if (!usuario) {
        throw new Error('Usuário não encontrado.');
      }
      return usuario;
    })
    .catch(err => { throw err; });
}

// Função para atualizar um usuário
function updateUsuario(id, { nome, id_cartao, creditos }) {
  return usuariosModel.updateUsuario(id, { nome, id_cartao, creditos })
    .then(result => result)
    .catch(err => { throw err; });
}

// Função para adicionar créditos ao usuário
function adicionaCreditoUsuario(id, creditosAdicionais) {
  return usuariosModel.adicionaCreditoUsuario(id, creditosAdicionais)
    .then(result => result)
    .catch(err => { throw err; });
}

function gastarCreditoUsuario(id) {
  return usuariosModel.gastarCreditoUsuario(id)
    .then(result => result)
    .catch(err => { throw err; });
}

// Função para remover um usuário
function removeUsuario(id) {
  return usuariosModel.removeUsuario(id)
    .then(result => result)
    .catch(err => { throw err; });
}

module.exports = {
  criarUsuario,
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  adicionaCreditoUsuario,
  removeUsuario,
  criaUsuarioComIdCartaoViaHardware,
  gastarCreditoUsuario
};
