// models/usuariosModel.js

const usuariosRepository = require('../repository/usuariosRepository');  // Importando o repository

// Função para verificar se o usuário já existe
function checkUsuarioExistente(id_cartao, nome) {
  return usuariosRepository.checkUsuarioExistente(id_cartao, nome);
}

// Função para inserir um novo usuário
function inserirUsuario(nome, id_cartao, creditos) {
  return usuariosRepository.inserirUsuario(nome, id_cartao, creditos);
}

// Função para obter todos os usuários
function getUsuarios() {
  return usuariosRepository.getUsuarios();
}

// Função para obter um usuário por ID
function getUsuarioById(id) {
  return usuariosRepository.getUsuarioById(id);
}

// Função para atualizar um usuário
function updateUsuario(id, { nome, id_cartao, creditos }) {
  return usuariosRepository.updateUsuario(id, { nome, id_cartao, creditos });
}

// Função para adicionar créditos a um usuário
function adicionaCreditoUsuario(id, creditosAdicionais) {
  return usuariosRepository.adicionaCreditoUsuario(id, creditosAdicionais);
}

function gastarCreditoUsuario(id_cartao) {
  return usuariosRepository.getUsuarioByIdCartao(id_cartao).then((usuario) => {
      if(!usuario) return ({
        "estado": "negado",
        "usuario": "nao encontrado",
        "creditos_restantes": 0
      });

      if (usuario.creditos > 0) {

        return usuariosRepository.gastarCreditoUsuario(usuario.id).then(() => ({
          "estado": "liberado",
          "usuario": usuario.nome,
          "creditos_restantes": usuario.creditos - 1
        }))

      } else {
        return ({"estado": "negado", "usuario": usuario.nome, "creditos_restantes": usuario.creditos})
      }
      
    });

}

// Função para remover um usuário
function removeUsuario(id) {
  return usuariosRepository.removeUsuario(id);
}

module.exports = {
  checkUsuarioExistente,
  inserirUsuario,
  getUsuarios,
  getUsuarioById,
  gastarCreditoUsuario,
  updateUsuario,
  adicionaCreditoUsuario,
  removeUsuario
};
