/**
 * main.js
 * Script principal para a funcionalidade de chat da interface
 * Gerencia a interação do usuário e a comunicação com a API
 */

// Seleção dos elementos do DOM
const inputMessage = document.getElementById("inputMessage");  // Campo de entrada de texto
const btnSend = document.getElementById("btnSend");            // Botão de enviar mensagem
const chatArea = document.getElementById("chatArea");          // Área onde as mensagens são exibidas

// Foca o cursor no campo de entrada ao carregar a página
inputMessage.focus();

/**
 * Adiciona uma mensagem à área de chat
 * @param {string} message - Conteúdo da mensagem
 * @param {string} sender - Origem da mensagem ('user' ou 'bot')
 */
function addMessage(message, sender) {
  // Cria um novo elemento div para a mensagem
  const divMessage = document.createElement("div");
  // Adiciona classes CSS baseadas no remetente
  divMessage.classList.add("message", sender);
  // Converte Markdown para HTML (permite formatação nas mensagens)
  divMessage.innerHTML = marked.parse(message);

  // Adiciona a mensagem à área de chat
  chatArea.appendChild(divMessage);
  // Rola para a mensagem mais recente
  chatArea.scrollTop = chatArea.scrollHeight;
}

/**
 * Envia a mensagem do usuário para a API e exibe a resposta
 */
async function sendMessage() {
  // Obtém o texto da mensagem e limpa espaços extras
  const message = inputMessage.value.trim();
  // Limpa o campo de entrada
  inputMessage.value = "";
  // Mantém o foco no campo de entrada para facilitar a digitação contínua
  inputMessage.focus();

  // Não faz nada se a mensagem estiver vazia
  if (!message) return;

  // Exibe a mensagem do usuário na interface
  addMessage(message, "user");

  try {
    // Envia a mensagem para a API via requisição POST
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    // Converte a resposta para JSON
    const data = await response.json();

    // Exibe a resposta ou a mensagem de erro
    if (response.ok) {
      addMessage(data.response, "bot");
    } else {
      addMessage(data.error, "bot");
    }
  } catch (error) {
    // Exibe mensagem de erro em caso de falha na requisição
    addMessage(error.message, "bot");
  }
}

// Adiciona event listeners para enviar mensagem
// Quando o botão de enviar é clicado
btnSend.addEventListener("click", sendMessage);

// Quando a tecla Enter é pressionada no campo de entrada
inputMessage.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
