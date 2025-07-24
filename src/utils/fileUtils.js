/**
 * Utilitários para manipulação de arquivos
 */
import fs from "fs";
import path from "path";

/**
 * Função para ler conteúdo de arquivos Markdown
 * @param {string} filePath - Caminho para o arquivo Markdown
 * @returns {string|null} - Conteúdo do arquivo ou null em caso de erro
 */
export function readMarkdownFile(filePath) {
  try {
    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      console.warn(`Arquivo não encontrado: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Função para salvar prompt em arquivo Markdown
 * @param {string} content - Conteúdo a ser salvo
 * @param {string} filePath - Caminho para o arquivo Markdown
 * @returns {boolean} - true se o arquivo foi salvo com sucesso, false caso contrário
 */
export function savePromptToFile(content, filePath) {
  try {
    // Garante que o diretório existe
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Salva o conteúdo no arquivo
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Prompt salvo com sucesso em: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar o prompt em ${filePath}:`, error.message);
    return false;
  }
}
