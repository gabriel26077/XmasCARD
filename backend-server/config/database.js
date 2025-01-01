// config/database.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'ip do servidor de banco de dados', // localhost
  user: 'usuário',
  password: 'senha',
  database: 'nome do banco de dados' // banco_usuarios
});

// Verifica a conexão
connection.connect(err => {
  if (err) {
    console.error('Erro de conexão: ' + err.stack);
    return;
  }
  console.log('Conectado ao banco de dados com ID ' + connection.threadId);
});

module.exports = connection;
