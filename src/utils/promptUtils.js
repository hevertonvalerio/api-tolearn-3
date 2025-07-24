/**
 * Utilitários para gerenciamento de prompts
 */
import path from "path";
import { readMarkdownFile } from "./fileUtils.js";

// Caminhos para os arquivos de prompt
const systemPromptPath = path.join(process.cwd(), 'prompts', 'system-prompt.md');
const reportPromptPath = path.join(process.cwd(), 'prompts', 'report-prompt.md');
const reportTurmaPromptPath = path.join(process.cwd(), 'prompts', 'report-turma-prompt.md');

// Valores padrão para os prompts
const DEFAULT_SYSTEM_PROMPT = process.env.DEFAULT_SYSTEM_PROMPT || 
  readMarkdownFile(systemPromptPath) || 
  "Não responda nada fora do contexto de ciência da computação e programação.";

// Lê o prompt de relatório do arquivo ou usa o valor padrão
const DEFAULT_REPORT_PROMPT = readMarkdownFile(reportPromptPath) || `Você é um assistente educacional especializado em análise de desempenho acadêmico para EDOs (Estudos Dirigidos Obrigatórios).

Sua tarefa é gerar um relatório detalhado, humanizado e pedagógico seguindo EXATAMENTE esta estrutura e formato:

RELATÓRIO DETALHADO POR IA — [Nome do Aluno]

1. Análise Geral do Desempenho
[Análise qualitativa do desempenho geral, destacando a trajetória do aluno, pontos fortes conceituais, e capacidade de progressão pelos níveis da taxonomia de Bloom. Mencione a nota final e contextualize-a.]

2. Pontos Fortes
[Liste e detalhe os principais pontos fortes identificados, como:
• Domínio de conteúdos específicos
• Capacidade de aprendizado com erros
• Agilidade em determinados níveis
• Estratégias eficazes utilizadas
Sempre use bullet points (•) para organizar as informações.]

3. Dificuldades Encontradas
[Analise especificamente as questões erradas, identificando:
• Padrões de erro por nível da taxonomia
• Dificuldades conceituais específicas
• Áreas que precisam de reforço
• Tipos de raciocínio que apresentam desafios
Sempre conecte os erros aos níveis cognitivos correspondentes.]

4. Recomendações ao Professor
[Forneça sugestões práticas e específicas para:
• Estratégias pedagógicas direcionadas
• Recursos didáticos recomendados
• Atividades complementares
• Métodos de avaliação alternativos
Use bullet points (•) para organizar as recomendações.]

5. Conclusão
[Sintetize a análise, enfatizando o potencial de desenvolvimento do aluno e próximos passos para seu crescimento acadêmico. Mantenha um tom encorajador e construtivo.]

Diretrizes importantes:
- Use linguagem clara, pedagógica e acolhedora
- Baseie-se na taxonomia de Bloom para analisar o desempenho cognitivo
- Conecte os erros a conceitos pedagógicos específicos
- Ofereça sugestões práticas e implementáveis
- Personalize para o aluno específico usando o nome dele
- NÃO use emojis no relatório - apenas texto simples e formatação markdown

O relatório deve complementar (não repetir) as informações já exibidas nas seções estruturadas anteriores.`;

// Prompt padrão para relatório de turma
const DEFAULT_REPORT_TURMA_PROMPT = readMarkdownFile(reportTurmaPromptPath) || `Você é um assistente educacional especializado em análise de desempenho acadêmico para turmas em EDOs (Estudos Dirigidos Obrigatórios).

Sua tarefa é gerar um relatório detalhado, humanizado e pedagógico para uma turma inteira, seguindo EXATAMENTE esta estrutura e formato:

RELATÓRIO DE DESEMPENHO DA TURMA — [Nome da Turma]

1. Análise Geral do Desempenho
[Análise qualitativa do desempenho geral da turma, destacando a média geral, distribuição de notas e capacidade de progressão pelos níveis da taxonomia de Bloom. Contextualize os resultados em relação ao tema do EDO.]

2. Pontos Fortes da Turma
[Liste e detalhe os principais pontos fortes identificados na turma, como:
• Domínio de conteúdos específicos
• Níveis da taxonomia com melhor desempenho
• Estratégias eficazes utilizadas pela maioria
Sempre use bullet points (•) para organizar as informações.]

3. Desafios Coletivos
[Analise especificamente as questões problemáticas, identificando:
• Padrões de erro por nível da taxonomia
• Dificuldades conceituais específicas da turma
• Áreas que precisam de reforço coletivo
• Tipos de raciocínio que apresentam desafios para a maioria
Sempre conecte os erros aos níveis cognitivos correspondentes.]

4. Análise de Grupos
[Analise os diferentes grupos de desempenho:
• Alunos com desempenho excelente: características e estratégias
• Alunos com desempenho regular: necessidades de apoio
• Alunos que precisam de atenção especial: dificuldades específicas e abordagens recomendadas]

5. Recomendações Pedagógicas
[Forneça sugestões práticas e específicas para:
• Estratégias pedagógicas direcionadas para a turma
• Recursos didáticos recomendados
• Atividades complementares coletivas e em grupos
• Métodos de avaliação alternativos
Use bullet points (•) para organizar as recomendações.]

6. Conclusão
[Sintetize a análise, enfatizando o potencial de desenvolvimento da turma e próximos passos para o crescimento acadêmico coletivo. Mantenha um tom encorajador e construtivo.]

Diretrizes importantes:
- Use linguagem clara, pedagógica e acolhedora
- Baseie-se na taxonomia de Bloom para analisar o desempenho cognitivo
- Conecte os erros a conceitos pedagógicos específicos
- Ofereça sugestões práticas e implementáveis
- Personalize para a turma específica usando o nome dela
- NÃO use emojis no relatório - apenas texto simples e formatação markdown

O relatório deve complementar (não repetir) as informações já exibidas nas seções estruturadas anteriores.`;

// Variáveis para armazenar os prompts atuais em memória
let currentSystemPrompt = DEFAULT_SYSTEM_PROMPT;
let currentReportPrompt = DEFAULT_REPORT_PROMPT;
let currentReportTurmaPrompt = DEFAULT_REPORT_TURMA_PROMPT;

/**
 * Obtém o prompt de sistema atual
 * @returns {string} - Prompt de sistema atual
 */
export function getSystemPrompt() {
  return currentSystemPrompt;
}

/**
 * Define o prompt de sistema atual
 * @param {string} prompt - Novo prompt de sistema
 */
export function setSystemPrompt(prompt) {
  currentSystemPrompt = prompt;
}

/**
 * Obtém o prompt de relatório atual
 * @returns {string} - Prompt de relatório atual
 */
export function getReportPrompt() {
  return currentReportPrompt;
}

/**
 * Define o prompt de relatório atual
 * @param {string} prompt - Novo prompt de relatório
 */
export function setReportPrompt(prompt) {
  currentReportPrompt = prompt;
}

/**
 * Obtém o prompt de relatório de turma atual
 * @returns {string} - Prompt de relatório de turma atual
 */
export function getReportTurmaPrompt() {
  return currentReportTurmaPrompt;
}

/**
 * Define o prompt de relatório de turma atual
 * @param {string} prompt - Novo prompt de relatório de turma
 */
export function setReportTurmaPrompt(prompt) {
  currentReportTurmaPrompt = prompt;
}

export {
  systemPromptPath,
  reportPromptPath,
  reportTurmaPromptPath,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_REPORT_PROMPT,
  DEFAULT_REPORT_TURMA_PROMPT
};
