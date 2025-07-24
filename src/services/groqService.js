/**
 * Serviço para interação com a API da Groq
 */
import Groq from "groq-sdk";
import { getSystemPrompt } from "../utils/promptUtils.js";

// Inicializa o cliente Groq com a chave API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Função utilitária para interagir com a API da Groq
 * 
 * @param {string} message - Mensagem do usuário a ser enviada para o modelo
 * @param {string} systemPrompt - Prompt do sistema para contextualizar o modelo (instruções)
 * @returns {Promise} - Promessa que resolve com a resposta da API da Groq
 */
export async function getGroqChatCompletion(message, systemPrompt = null) {
  // Se não for fornecido um prompt de sistema, usa o prompt atual
  const finalSystemPrompt = systemPrompt || getSystemPrompt();
  
  try {
    // Configura a chamada para a API da Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: finalSystemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama3-70b-8192",  // Modelo LLaMa 3 70B
      temperature: 0.7,          // Controle de aleatoriedade (0.0 a 1.0)
      max_tokens: 4096,          // Limite de tokens na resposta
      top_p: 0.9,                // Controle de diversidade
      stream: false              // Não usar streaming de resposta
    });
    
    // Retorna o conteúdo da resposta
    return chatCompletion.choices[0]?.message?.content || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Erro ao chamar a API da Groq:", error.message);
    throw new Error(`Erro na API da Groq: ${error.message}`);
  }
}
