const usuarioService = require('../services/usuarioService');

async function criarUsuario(req, res) {
  try {
    const novoUsuario = await usuarioService.criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}


async function criaUsuarioComIdCartaoViaHardware(req, res) {
  try {
    const novoUsuario = await usuarioService.criaUsuarioComIdCartaoViaHardware({ 
      enviarMsgParaHardwareComConfirmacao: req.enviarMsgParaHardwareComConfirmacao,
      enviarMsgParaHardware: req.enviarMsgParaHardware,
      ...req.body
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getUsuarios(req, res) {
  try {
    const usuarios = await usuarioService.getUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter usuários.' });
  }
}

async function getUsuarioById(req, res) {
  try {
    const usuario = await usuarioService.getUsuarioById(parseInt(req.params.id));
    res.json(usuario);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function updateUsuario(req, res) {
  try {
    const usuarioAtualizado = await usuarioService.updateUsuario(parseInt(req.params.id), req.body);
    res.json(usuarioAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function adicionaCreditoUsuario(req, res) {
  try {
    const usuario = await usuarioService.adicionaCreditoUsuario(parseInt(req.params.id), req.body.creditos_adicionais);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}


async function removeUsuario(req, res) {
  try {
    await usuarioService.removeUsuario(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  criarUsuario,
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  adicionaCreditoUsuario,
  removeUsuario,
  criaUsuarioComIdCartaoViaHardware,
};
