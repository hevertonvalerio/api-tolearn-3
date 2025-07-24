/**
 * Controlador para as rotas de chat
 */
import { getGroqChatCompletion } from "../services/groqService.js";

/**
 * Processa uma mensagem de chat e retorna a resposta da IA
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export async function processarMensagem(req, res) {
  const { message } = req.body;
  
  // Verifica se a mensagem foi fornecida
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Mensagem não fornecida!" });
  }
  
  try {
    // Obtém a resposta da IA
    const response = await getGroqChatCompletion(message);
    
    // Retorna a resposta
    return res.json({ response });
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao chamar a API da Groq:", error.message);
    return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
  }
}
