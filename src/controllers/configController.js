/**
 * Controlador para as rotas de configuração
 */
import { 
  getSystemPrompt, 
  setSystemPrompt, 
  getReportPrompt, 
  setReportPrompt,
  systemPromptPath,
  reportPromptPath
} from "../utils/promptUtils.js";
import { savePromptToFile } from "../utils/fileUtils.js";

/**
 * Obtém o prompt de sistema atual
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export function obterSystemPrompt(req, res) {
  res.json({ prompt: getSystemPrompt() });
}

/**
 * Atualiza o prompt de sistema
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export function atualizarSystemPrompt(req, res) {
  const { prompt } = req.body;
  
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt de sistema não fornecido!" });
  }
  
  // Atualiza a variável em memória
  setSystemPrompt(prompt);
  
  // Salva o prompt no arquivo
  const success = savePromptToFile(prompt, systemPromptPath);
  
  if (success) {
    return res.json({ 
      message: "Prompt de sistema atualizado com sucesso!",
      prompt: getSystemPrompt()
    });
  } else {
    return res.status(500).json({ 
      error: "Erro ao salvar o prompt no arquivo. A variável em memória foi atualizada, mas o arquivo não.",
      prompt: getSystemPrompt()
    });
  }
}

/**
 * Obtém o prompt de relatório atual
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export function obterReportPrompt(req, res) {
  res.json({ prompt: getReportPrompt() });
}

/**
 * Atualiza o prompt de relatório
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export function atualizarReportPrompt(req, res) {
  const { prompt } = req.body;
  
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt de relatório não fornecido!" });
  }
  
  // Atualiza a variável em memória
  setReportPrompt(prompt);
  
  // Salva o prompt no arquivo
  const success = savePromptToFile(prompt, reportPromptPath);
  
  if (success) {
    return res.json({ 
      message: "Prompt de relatório atualizado com sucesso!",
      prompt: getReportPrompt()
    });
  } else {
    return res.status(500).json({ 
      error: "Erro ao salvar o prompt no arquivo. A variável em memória foi atualizada, mas o arquivo não.",
      prompt: getReportPrompt()
    });
  }
}
