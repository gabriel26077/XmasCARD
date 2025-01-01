const express = require('express');
const path = require('path');

const app = express();

// Servir arquivos estáticos na pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor frontend rodando em http://localhost:${PORT}`));
