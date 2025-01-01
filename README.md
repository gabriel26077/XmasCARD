## Sobre o Projeto

O **XmasCARD** é um sistema IoT inspirado no Natal Card, utilizado para o controle de acesso aos ônibus da cidade de Natal/RN. Este sistema foi desenvolvido para a disciplina de **FCSC** e tem como objetivo simular um sistema de controle de acesso a ambientes com base na disponibilidade de créditos do usuário.

O sistema permite as seguintes funcionalidades:
- Cadastro de usuários.
- Alteração de dados cadastrais.
- Adição e remoção de créditos.
- Validação de acesso com base nos créditos disponíveis.

### Como Funciona
O sistema utiliza tecnologia RFID para identificar os usuários. Um **ESP32** é responsável por:
- Ler os dados do cartão ou tag RFID.
- Enviar as leituras para um servidor web.
- Receber e interpretar as respostas do servidor para conceder ou negar acesso.

O servidor web processa as informações enviadas pelo ESP32, realiza validações necessárias (como verificar o saldo de créditos) e devolve uma resposta adequada ao dispositivo.

## Tecnologias Utilizadas

### Hardware
- **ESP32**: Microcontrolador para gestão das leituras RFID e comunicação com o servidor.
- **Módulo RFID RC522**: Para leitura de cartões e tags RFID.
- **Display oled**: Para a exibição dos resultados.

### Software
- **Linguagem C/C++**: Para programação do ESP32 (usando Arduino IDE).
- **NODEJS**: Para o desenvolvimento do servidor web.
- **Banco de Dados**: MySQL (MariaDB) para armazenamento dos dados dos usuários e créditos.
- **Protocolo HTTP**: Para comunicação entre o ESP32 e o servidor.

## Estrutura do Repositório

```plaintext
.
├── backend-server/               # API da aplicação web
├── frontend-server/              # Servidor de aquivos estáticos da aplicação web
├── simulador-hardware/           # Programa em python que simula o comportamento do hardware
├── XmasCARD_hardware/            # Código para o ESP32
└── README.md                     # Este arquivo