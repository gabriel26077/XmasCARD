const IP_BACKEND = 'ip do servidor backend'
const PORT_BACKEND = 3000 // porta em que o servidor backend está escutando

const API_URL = `http://${IP_BACKEND}:${PORT_BACKEND}/usuarios`;

console.log("Ola")

// Referências aos elementos da página
const form = document.getElementById('user-form');
const userList = document.getElementById('user-list');

// Função para carregar usuários
async function carregarUsuarios() {
  userList.innerHTML = ''; // Limpa a lista
  try {
    const response = await fetch(API_URL);
    const usuarios = await response.json();
    usuarios.forEach(usuario => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nome}</td>
        <td>${usuario.id_cartao}</td>
        <td>${usuario.creditos}</td>
        <td>
          <button onclick="deletarUsuario(${usuario.id})">Excluir</button>
          <button onclick="atualizarUsuario(${usuario.id})">Editar</button>
        </td>
      `;
      userList.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

// Função para adicionar usuário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const id_cartao = document.getElementById('id_cartao').value;
  const creditos = parseInt(document.getElementById('creditos').value);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, id_cartao, creditos }),
    });
    if (response.ok) {
      form.reset();
      carregarUsuarios();
    } else {
      const erro = await response.json();
      alert(erro.message);
    }
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
  }
});

const hardwareButton = document.getElementById('hardwareButton');

hardwareButton.addEventListener('click', async function (event) {
  const nome = document.getElementById('nome').value;
  event.preventDefault(); // Impede qualquer comportamento padrão, se necessário
  console.log('Botão de hardware clicado!');
  const response = await fetch(`${API_URL}/criaUsuarioComIdCartaoViaHardware`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
});

// Função para deletar usuário
async function deletarUsuario(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      carregarUsuarios();
    } else {
      const erro = await response.json();
      alert(erro.message);
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
  }
}

// Função para editar usuário
async function atualizarUsuario(id) {
  const alterarNome = confirm('Deseja alterar o nome?');
  let novoNome = null;

  if (alterarNome) {
    novoNome = prompt('Digite o novo nome:');
    if (!novoNome) {
      alert('Nome é obrigatório!');
      return;
    }
  }

  const alterarIdCartao = confirm('Deseja alterar o ID do cartão?');
  let novoIdCartao = null;

  if (alterarIdCartao) {
    novoIdCartao = prompt('Digite o novo ID do cartão:');
    if (!novoIdCartao) {
      alert('ID do cartão é obrigatório!');
      return;
    }
  }

  const alterarCreditos = confirm('Deseja alterar os créditos?');
  let novosCreditos = null;

  if (alterarCreditos) {
    novosCreditos = prompt('Digite os novos créditos:');
    if (isNaN(novosCreditos) || novosCreditos === '') {
      alert('Os créditos devem ser um número válido!');
      return;
    }
    novosCreditos = parseInt(novosCreditos);
  }

  // Aqui estamos substituindo undefined por null, caso algum campo não tenha sido alterado
  const dadosAtualizados = {
    nome: novoNome !== undefined ? novoNome : null,
    id_cartao: novoIdCartao !== undefined ? novoIdCartao : null,
    creditos: novosCreditos !== undefined ? novosCreditos : null
  };

  // Se algum dado foi alterado, faz a atualização
  if (dadosAtualizados.nome || dadosAtualizados.id_cartao || dadosAtualizados.creditos !== null) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados),
      });
      if (response.ok) {
        carregarUsuarios();
      } else {
        const erro = await response.json();
        alert(erro.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  } else {
    alert('Nenhuma alteração foi feita.');
  }
}





async function adicionarCreditos(id) {
    const creditos_adicionais = prompt('Digite a quantidade de créditos a serem adicionados');

  
    if (!creditos_adicionais) {
      alert('Os créditos devem ser passados');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          id_cartao: novoIdCartao,
          creditos: parseInt(novosCreditos),
        }),
      });
      if (response.ok) {
        carregarUsuarios();
      } else {
        const erro = await response.json();
        alert(erro.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  }
// Carrega os usuários ao carregar a página
carregarUsuarios();
