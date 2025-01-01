// repository/usuariosRepository.js

const connection = require('../config/database');  // Conexão com o banco

// Função para verificar se o usuário já existe
function checkUsuarioExistente(id_cartao, nome) {
  const query = 'SELECT * FROM usuarios WHERE id_cartao = ? OR nome = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [id_cartao, nome], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Função para inserir um novo usuário
function inserirUsuario(nome, id_cartao, creditos) {
  const query = 'INSERT INTO usuarios (nome, id_cartao, creditos) VALUES (?, ?, ?)';
  return new Promise((resolve, reject) => {
    connection.execute(query, [nome, id_cartao, creditos], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Função para obter todos os usuários
function getUsuarios() {
  const query = 'SELECT * FROM usuarios';
  return new Promise((resolve, reject) => {
    connection.execute(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Função para obter um usuário por ID
function getUsuarioById(id) {
  const query = 'SELECT * FROM usuarios WHERE id = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [id], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]); // Retorna o usuário ou null
    });
  });
}


// Função para obter um usuário por ID_CARTAO
function getUsuarioByIdCartao(id_cartao) {
  const query = 'SELECT * FROM usuarios WHERE id_cartao = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [id_cartao], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]); // Retorna o usuário ou null
    });
  });
}

function updateUsuario(id, { nome, id_cartao, creditos }) {
  // Cria uma lista de colunas e valores para atualização
  let fieldsToUpdate = [];
  let values = [];

  if (nome !== undefined && nome !== null) {
    fieldsToUpdate.push('nome = ?');
    values.push(nome);
  }

  if (id_cartao !== undefined && id_cartao !== null) {
    fieldsToUpdate.push('id_cartao = ?');
    values.push(id_cartao);
  }

  if (creditos !== undefined && creditos !== null) {
    fieldsToUpdate.push('creditos = ?');
    values.push(creditos);
  }

  // Se não houver campos a atualizar, retorna uma mensagem
  if (fieldsToUpdate.length === 0) {
    return Promise.reject(new Error('Nenhum campo para atualizar'));
  }

  // Adiciona o ID ao final da lista de valores
  values.push(id);

  // Constrói a query com base nos campos a serem atualizados
  const query = `UPDATE usuarios SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

  // Executa a consulta
  return new Promise((resolve, reject) => {
    connection.execute(query, values, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


// Função para adicionar créditos a um usuário
function adicionaCreditoUsuario(id, creditosAdicionais) {
  const query = 'UPDATE usuarios SET creditos = creditos + ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [creditosAdicionais, id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


function getCreditoUsuario(id) {
  const query = 'SELECT creditos FROM usuarios WHERE id = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [id], (err, result) => {
      if (err) reject(err);
      else if (result.length > 0) resolve(result[0].creditos); // Retorna a quantidade de créditos restantes
      else reject('Usuário não encontrado');
    });
  });
}


function gastarCreditoUsuario(id) {
  const query = 'UPDATE usuarios SET creditos = creditos - ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [1, id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


// Função para remover um usuário
function removeUsuario(id) {
  const query = 'DELETE FROM usuarios WHERE id = ?';
  return new Promise((resolve, reject) => {
    connection.execute(query, [id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

module.exports = {
  checkUsuarioExistente,
  inserirUsuario,
  getUsuarios,
  getUsuarioById,
  getCreditoUsuario,
  updateUsuario,
  adicionaCreditoUsuario,
  removeUsuario,
  gastarCreditoUsuario,
  getUsuarioByIdCartao

};
