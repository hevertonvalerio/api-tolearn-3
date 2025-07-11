/**
 * Integração Groq - API ToLearn
 * Aplicação para integração com a API da Groq para geração de conteúdo por IA
 * 
 * Este arquivo contém toda a configuração do servidor Express e as rotas da API
 */

// Importações das bibliotecas necessárias
import express from "express";  // Framework web para Node.js
import Groq from "groq-sdk";    // SDK oficial da Groq para integração com a API
import 'dotenv/config';         // Carrega variáveis de ambiente do arquivo .env
import swaggerJsDoc from "swagger-jsdoc";     // Gera especificação OpenAPI a partir de comentários JSDoc
import swaggerUi from "swagger-ui-express";   // Interface visual para documentação Swagger
import cors from "cors";         // Middleware para habilitar CORS na API
import PDFDocument from "pdfkit"; // Biblioteca para geração de PDFs
import fs from "fs";            // Para leitura de arquivos
import path from "path";        // Para manipulação de caminhos

// Inicialização e configuração do aplicativo Express
const app = express();
app.use(express.json());                // Middleware para processar JSON no corpo das requisições
app.use(cors());                        // Habilita CORS para todas as rotas

// Configurações e variáveis de ambiente
const PORT = process.env.PORT || 3002;  // Porta do servidor (padrão: 3002)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Inicializa o cliente Groq com a chave API

// Função para ler conteúdo de arquivos Markdown
function readMarkdownFile(filePath) {
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

// Caminhos para os arquivos de prompt
const systemPromptPath = path.join(process.cwd(), 'prompts', 'system-prompt.md');
const reportPromptPath = path.join(process.cwd(), 'prompts', 'report-prompt.md');

// Lê os prompts dos arquivos ou usa os valores padrão
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
[Finalize com uma visão prospectiva e encorajadora, destacando o potencial do aluno e as próximas etapas de desenvolvimento. Mantenha um tom motivacional e construtivo.]

DIRETRIZES IMPORTANTES:
- Use linguagem clara, pedagógica e acolhedora
- Mantenha tom construtivo e motivador
- Seja específico nas análises, citando níveis da taxonomia de Bloom
- Conecte erros a conceitos pedagógicos
- Ofereça sugestões práticas e aplicáveis
- Use formatação Markdown consistente
- Evite repetir informações já apresentadas no resumo estruturado
- Foque na análise qualitativa, não apenas números
- Personalize para o aluno específico usando o nome dele
- NÃO use emojis no relatório - apenas texto simples e formatação markdown

O relatório deve complementar (não repetir) as informações já exibidas nas seções estruturadas anteriores.`;

// Variável para armazenar o prompt do sistema atual em memória
let currentSystemPrompt = DEFAULT_SYSTEM_PROMPT;
let currentReportPrompt = DEFAULT_REPORT_PROMPT;

// Função para salvar prompt em arquivo Markdown
function savePromptToFile(content, filePath) {
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
    console.error(`Erro ao salvar prompt em ${filePath}:`, error.message);
    return false;
  }
}

// Rota para obter o prompt de sistema atual
app.get("/api/config/system-prompt", (req, res) => {
  res.json({ prompt: currentSystemPrompt });
});

// Rota para atualizar o prompt de sistema
app.put("/api/config/system-prompt", (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt de sistema não fornecido!" });
  }
  
  // Atualiza a variável em memória
  currentSystemPrompt = prompt.trim();
  console.log("Prompt do sistema atualizado para:", currentSystemPrompt);
  
  // Salva o prompt atualizado no arquivo
  savePromptToFile(currentSystemPrompt, systemPromptPath);
  
  res.json({ 
    success: true, 
    prompt: currentSystemPrompt,
    message: "Prompt de sistema atualizado com sucesso!" 
  });
});

// Rota para obter o prompt de relatório atual
app.get("/api/config/report-prompt", (req, res) => {
  res.json({ prompt: currentReportPrompt });
});

// Rota para atualizar o prompt de relatório
app.put("/api/config/report-prompt", (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt de relatório não fornecido!" });
  }
  
  // Atualiza a variável em memória
  currentReportPrompt = prompt.trim();
  console.log("Prompt de relatório atualizado para:", currentReportPrompt);
  
  // Salva o prompt atualizado no arquivo
  savePromptToFile(currentReportPrompt, reportPromptPath);
  
  res.json({ 
    success: true, 
    prompt: currentReportPrompt,
    message: "Prompt de relatório atualizado com sucesso!" 
  });
});

// Configuração do Swagger para documentação da API
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API ToLearn - Groq Integration",
      version: "1.0.0",
      description: "API de integração com Groq para geração de conteúdo inteligente",
      contact: {
        name: "ToLearn Team"
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`
      }
    ]
  },
  apis: ["./index.js"]  // Arquivos onde os comentários JSDoc da API estão localizados
};

// Inicializa o Swagger e configura a rota para acessar a documentação
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/config/system-prompt:
 *   get:
 *     summary: Obtém o prompt de sistema atual
 *     tags: [Configuração]
 *     responses:
 *       200:
 *         description: Prompt de sistema retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompt:
 *                   type: string
 *   put:
 *     summary: Atualiza o prompt de sistema
 *     tags: [Configuração]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Novo prompt de sistema para contextualizar o modelo
 *     responses:
 *       200:
 *         description: Prompt de sistema atualizado com sucesso
 *       400:
 *         description: Prompt não fornecido
 */

/**
 * @swagger
 * /api/config/report-prompt:
 *   get:
 *     summary: Obtém o prompt de relatório atual
 *     tags: [Configuração]
 *     responses:
 *       200:
 *         description: Prompt de relatório retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompt:
 *                   type: string
 *   put:
 *     summary: Atualiza o prompt de relatório
 *     tags: [Configuração]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Novo prompt de relatório para contextualizar o modelo
 *     responses:
 *       200:
 *         description: Prompt de relatório atualizado com sucesso
 *       400:
 *         description: Prompt não fornecido
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Envia uma mensagem para o modelo Groq e retorna uma resposta
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Mensagem a ser enviada para o modelo
 *     responses:
 *       200:
 *         description: Resposta gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       400:
 *         description: Mensagem não fornecida
 *       500:
 *         description: Erro ao consultar a API do Groq
 */

/**
 * Função utilitária para interagir com a API da Groq
 * 
 * @param {string} message - Mensagem do usuário a ser enviada para o modelo
 * @param {string} systemPrompt - Prompt do sistema para contextualizar o modelo (instruções)
 * @returns {Promise} - Promessa que resolve com a resposta da API da Groq
 */
function getGroqChatCompletion(message, systemPrompt = null) {
  // Usa o prompt fornecido ou o prompt atual do sistema (que pode ter sido alterado via API)
  const finalSystemPrompt = systemPrompt || currentSystemPrompt;
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: finalSystemPrompt,  // Instruções para o modelo seguir
      },
      {
        role: "user",
        content: message,       // Mensagem do usuário
      },
    ],
    model: "llama-3.3-70b-versatile",  // Modelo da Groq a ser utilizado
  });
}

/**
 * Rota para o endpoint do chat com IA
 * Recebe uma mensagem do usuário e retorna uma resposta gerada pela IA da Groq
 */
app.post("/api/chat", async (req, res) => {
  const { message, systemPrompt } = req.body;  // Extrai a mensagem e o prompt opcional do corpo da requisição

  // Validação da mensagem
  if (!message) {
    return res.status(400).json({ error: "Mensagem não fornecida!" });
  }

  try {
    // Envia a mensagem para a API da Groq e aguarda a resposta (usando o prompt do sistema fornecido, se houver)
    const responseGroq = await getGroqChatCompletion(message, systemPrompt);

    // Registra a resposta no console para monitoramento
    console.log("Resposta da API Groq:", responseGroq.choices[0]?.message.content);

    // Retorna a resposta como JSON
    res.json({ response: responseGroq.choices[0]?.message?.content || "" });
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao chamar a API da Groq:", error.message);
    return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
  }
});

/**
 * @swagger
 * /api/relatorio-edo:
 *   post:
 *     summary: Gera um relatório detalhado para um Estudo Dirigido Obrigatório (EDO)
 *     tags: [Relatórios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dados
 *             properties:
 *               dados:
 *                 type: object
 *                 properties:
 *                   nome_aluno:
 *                     type: string
 *                   ra:
 *                     type: string
 *                   turma:
 *                     type: string
 *                   serie:
 *                     type: string
 *                   disciplina:
 *                     type: string
 *                   professor:
 *                     type: string
 *                   tema_edo:
 *                     type: string
 *                   nota_edo:
 *                     type: number
 *                   data_inicio:
 *                     type: string
 *                   data_termino:
 *                     type: string
 *                   tempo_total_execucao:
 *                     type: string
 *                   tempo_medio_questao:
 *                     type: string
 *                   nivel_maximo_taxonomia:
 *                     type: string
 *                   questoes_erradas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         numero:
 *                           type: integer
 *                         nivel:
 *                           type: string
 *                         texto_questao:
 *                           type: string
 *                         alternativa_escolhida:
 *                           type: string
 *                         alternativa_correta:
 *                           type: string
 *                   total_acertos:
 *                     type: integer
 *                   total_erros:
 *                     type: integer
 *                   notas_por_nivel:
 *                     type: object
 *                     properties:
 *                       Lembrar:
 *                         type: number
 *                       Compreender:
 *                         type: number
 *                       Aplicar:
 *                         type: number
 *                       Analisar:
 *                         type: number
 *                       Avaliar:
 *                         type: number
 *                       Criar:
 *                         type: number
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 relatorio:
 *                   type: string
 *       400:
 *         description: Dados não fornecidos corretamente
 *       500:
 *         description: Erro ao gerar o relatório
 */

/**
 * Rota para geração de relatório EDO (Estudo Dirigido Obrigatório)
 * Recebe dados do aluno e do EDO e retorna um relatório detalhado gerado pela IA
 */
app.post("/api/relatorio-edo", async (req, res) => {
  const { dados } = req.body;  // Extrai os dados do corpo da requisição

  // Validação dos dados
  if (!dados || !dados.nome_aluno) {
    return res.status(400).json({ error: "Dados do EDO não fornecidos corretamente!" });
  }

  try {
    // Usa o prompt dinâmico para relatórios
    const systemPrompt = currentReportPrompt;

    // Cria um prompt estruturado com os dados para análise
    const userPrompt = `
Analise os seguintes dados de desempenho do aluno e gere um relatório pedagógico detalhado:

**DADOS DO ALUNO:**
- Nome: ${dados.nome_aluno}
- RA: ${dados.ra || 'Não informado'}
- Turma: ${dados.turma || 'Não informada'}
- Série: ${dados.serie || 'Não informada'}

**DADOS DO EDO:**
- Disciplina: ${dados.disciplina}
- Professor: ${dados.professor || 'Não informado'}
- Tema: ${dados.tema_edo}
- Nota Final: ${dados.nota_edo}
- Data/Hora Início: ${dados.data_inicio}
- Data/Hora Término: ${dados.data_termino}
- Tempo Total: ${dados.tempo_total_execucao}
- Tempo Médio por Questão: ${dados.tempo_medio_questao}
- Nível Máximo Alcançado: ${dados.nivel_maximo_taxonomia}

**DESEMPENHO POR NÍVEL COGNITIVO:**
${dados.notas_por_nivel ? Object.entries(dados.notas_por_nivel)
  .map(([nivel, nota]) => `- ${nivel}: ${nota} pontos`)
  .join('\n') : 'Dados não disponíveis'}

**ANÁLISE DE ERROS:**
Total de Acertos: ${dados.total_acertos || 'Não informado'}
Total de Erros: ${dados.total_erros || 'Não informado'}

**QUESTÕES RESPONDIDAS INCORRETAMENTE:**
${dados.questoes_erradas && dados.questoes_erradas.length > 0 
  ? dados.questoes_erradas.map((questao, index) => `
${index + 1}. ${questao.nivel} - ${questao.texto_questao}
   • Resposta do aluno: ${questao.alternativa_escolhida}
   • Resposta correta: ${questao.alternativa_correta}
`).join('\n')
  : 'Nenhuma questão respondida incorretamente.'}

**CONTEXTO ADICIONAL:**
- Performance geral demonstrada pelos dados numéricos
- Padrões de erro identificados
- Progressão através dos níveis da taxonomia de Bloom
- Tempo investido na atividade

Gere um relatório que analise esses dados de forma pedagógica, destacando insights educacionais relevantes para professores e o próprio aluno.
    `;

    // Envia os prompts para a API da Groq e aguarda a resposta
    const responseGroq = await getGroqChatCompletion(userPrompt, systemPrompt);
    const relatorio = responseGroq.choices[0]?.message.content || "";

    console.log("Relatório EDO gerado com sucesso para:", dados.nome_aluno);

    // Retorna o relatório gerado como JSON
    res.json({ relatorio });
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório." });
  }
});

/**
 * @swagger
 * /api/relatorio-edo/pdf:
 *   post:
 *     summary: Gera um relatório detalhado em formato PDF para um Estudo Dirigido Obrigatório (EDO)
 *     tags: [Relatórios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dados
 *             properties:
 *               dados:
 *                 type: object
 *                 properties:
 *                   nome_aluno:
 *                     type: string
 *                   ra:
 *                     type: string
 *                   turma:
 *                     type: string
 *                   serie:
 *                     type: string
 *                   disciplina:
 *                     type: string
 *                   professor:
 *                     type: string
 *                   tema_edo:
 *                     type: string
 *                   nota_edo:
 *                     type: number
 *                   data_inicio:
 *                     type: string
 *                   data_termino:
 *                     type: string
 *                   tempo_total_execucao:
 *                     type: string
 *                   tempo_medio_questao:
 *                     type: string
 *                   nivel_maximo_taxonomia:
 *                     type: string
 *                   questoes_erradas:
 *                     type: array
 *                     items:
 *                       type: object
 *                   total_acertos:
 *                     type: integer
 *                   total_erros:
 *                     type: integer
 *                   notas_por_nivel:
 *                     type: object
 *     responses:
 *       200:
 *         description: PDF gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Dados não fornecidos corretamente
 *       500:
 *         description: Erro ao gerar o relatório
 */

/**
 * Rota para geração de relatório EDO em formato PDF
 * Recebe dados do aluno e do EDO, gera um relatório detalhado e retorna como PDF para download
 */
app.post("/api/relatorio-edo/pdf", async (req, res) => {
  const { dados } = req.body;  // Extrai os dados do corpo da requisição

  // Validação dos dados
  if (!dados || !dados.nome_aluno) {
    return res.status(400).json({ error: "Dados do EDO não fornecidos corretamente!" });
  }

  try {
    // Primeiro, gera o relatório usando a IA
    const systemPrompt = currentReportPrompt;
    const userPrompt = `
Analise os seguintes dados de desempenho do aluno e gere um relatório pedagógico detalhado:

**DADOS DO ALUNO:**
- Nome: ${dados.nome_aluno}
- RA: ${dados.ra || 'Não informado'}
- Turma: ${dados.turma || 'Não informada'}
- Série: ${dados.serie || 'Não informada'}

**DADOS DO EDO:**
- Disciplina: ${dados.disciplina}
- Professor: ${dados.professor || 'Não informado'}
- Tema: ${dados.tema_edo}
- Nota Final: ${dados.nota_edo}
- Data/Hora Início: ${dados.data_inicio}
- Data/Hora Término: ${dados.data_termino}
- Tempo Total: ${dados.tempo_total_execucao}
- Tempo Médio por Questão: ${dados.tempo_medio_questao}
- Nível Máximo Alcançado: ${dados.nivel_maximo_taxonomia}

**DESEMPENHO POR NÍVEL COGNITIVO:**
${dados.notas_por_nivel ? Object.entries(dados.notas_por_nivel)
  .map(([nivel, nota]) => `- ${nivel}: ${nota} pontos`)
  .join('\n') : 'Dados não disponíveis'}

**ANÁLISE DE ERROS:**
Total de Acertos: ${dados.total_acertos || 'Não informado'}
Total de Erros: ${dados.total_erros || 'Não informado'}

**QUESTÕES RESPONDIDAS INCORRETAMENTE:**
${dados.questoes_erradas && dados.questoes_erradas.length > 0 
  ? dados.questoes_erradas.map((questao, index) => `
${index + 1}. ${questao.nivel} - ${questao.texto_questao}
   • Resposta do aluno: ${questao.alternativa_escolhida}
   • Resposta correta: ${questao.alternativa_correta}
`).join('\n')
  : 'Nenhuma questão respondida incorretamente.'}

Gere um relatório que analise esses dados de forma pedagógica, destacando insights educacionais relevantes.
    `;

    const responseGroq = await getGroqChatCompletion(userPrompt, systemPrompt);
    const relatorio = responseGroq.choices[0]?.message.content || "";

    console.log("Gerando PDF do relatório para:", dados.nome_aluno);

    // Configurando o cabeçalho para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-edo-${dados.nome_aluno.replace(/\s+/g, '-').toLowerCase()}.pdf`);

    // Criando o documento PDF com metadados
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      info: {
        Title: `Relatório EDO - ${dados.nome_aluno}`,
        Author: 'ToLearn - Plataforma de Ensino',
        Subject: `Relatório de desempenho em ${dados.disciplina} - ${dados.tema_edo}`,
        Creator: 'ToLearn IA System'
      }
    });

    // Pipe do PDF para a resposta HTTP
    doc.pipe(res);
    
    // Função para substituir emojis por texto alternativo
    const substituirEmojis = (texto) => {
      // Mapeamento de emojis comuns para texto alternativo
      const emojiMap = {
        '📊': '[GRÁFICO]',
        '👤': '[PESSOA]',
        '📘': '[LIVRO]',
        '🧠': '[CÉREBRO]',
        '🟢': '[CÍRCULO]',
        '❌': '[X]',
        '✅': '[CHECK]',
        '⚠️': '[ATENÇÃO]',
        '💡': '[IDEIA]',
        '🔍': '[LUPA]',
        '📝': '[NOTA]',
        '🎯': '[ALVO]',
        '⭐': '[ESTRELA]'
      };
      
      // Substitui emojis conhecidos ou remove caracteres Unicode não suportados
      return texto.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, match => {
        return emojiMap[match] || '';
      });
    };
    
    // Função para renderizar texto com suporte condicional a emojis
    const renderizarTexto = (texto, x, y, options = {}) => {
      try {
        // Verifica se a fonte de emoji está registrada
        if (temFonteEmoji) {
          doc.font('EmojiFont').text(texto, x, y, options);
        } else {
          // Fallback: substitui emojis por texto alternativo
          doc.font('Helvetica').text(substituirEmojis(texto), x, y, options);
        }
      } catch (error) {
        // Em caso de erro, usa o fallback
        console.warn('Erro ao renderizar texto com emojis:', error.message);
        doc.font('Helvetica').text(substituirEmojis(texto), x, y, options);
      }
    };
    
    // Tenta adicionar o logotipo
    try {
      const logoPath = path.join(process.cwd(), 'docs', 'logotipo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 100 });
      } else {
        console.warn('Arquivo de logotipo não encontrado. Usando retângulo colorido como fallback.');
        // Fallback para o retângulo colorido
        doc.rect(50, 50, 100, 40)
           .fillColor('#4CAF50')
           .fill();
        
        doc.fillColor('#000')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('ToLearn', 60, 65);
      }
    } catch (error) {
      console.error('Erro ao adicionar logotipo:', error.message);
      // Fallback em caso de erro
      doc.rect(50, 50, 100, 40)
         .fillColor('#4CAF50')
         .fill();
      
      doc.fillColor('#000')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('ToLearn', 60, 65);
    }

// Registrar fonte personalizada com suporte a emojis (se disponível)
let temFonteEmoji = false;
try {
  // Verificar se existe uma fonte com suporte a emojis no sistema
  const fontPath = path.join(process.cwd(), 'fonts', 'NotoEmoji-Regular.ttf');
  if (fs.existsSync(fontPath)) {
    doc.registerFont('EmojiFont', fontPath);
    temFonteEmoji = true;
    console.log('Fonte com suporte a emojis registrada com sucesso!');
  } else {
    console.warn('Arquivo de fonte com suporte a emojis não encontrado.');
  }
} catch (error) {
  console.warn('Aviso: Fonte com suporte a emojis não disponível:', error.message);
}

// Cabeçalho do relatório
doc.moveDown(2)
   .fontSize(22)
   .font('Helvetica-Bold');

// Usa texto alternativo se não tiver suporte a emojis
if (temFonteEmoji) {
  doc.text('📊 RELATÓRIO DE AVALIAÇÃO DO EDO', { align: 'center' });
} else {
  doc.text('RELATÓRIO DE AVALIAÇÃO DO EDO', { align: 'center' });
}
  
// Seção de dados do aluno
doc.moveDown(1.5)
   .fontSize(16)
   .font('Helvetica-Bold');

// Usa texto alternativo se não tiver suporte a emojis
if (temFonteEmoji) {
  doc.text('👤 Dados do Aluno');
} else {
  doc.text('Dados do Aluno');
}
  
doc.moveDown(0.5)
   .fontSize(12)
   .font('Helvetica')
   .text(`• Nome: ${dados.nome_aluno}`)
   .text(`• RA: ${dados.ra || 'N/A'}`)
   .text(`• Turma: ${dados.turma || 'N/A'}`);

// Seção de dados do EDO
doc.moveDown(1)
   .fontSize(16)
   .font('Helvetica-Bold');

// Usa texto alternativo se não tiver suporte a emojis
if (temFonteEmoji) {
  doc.text('📘 Dados do Estudo Dirigido Obrigatório');
} else {
  doc.text('Dados do Estudo Dirigido Obrigatório');
}
  
doc.moveDown(0.5)
   .fontSize(12)
   .font('Helvetica')
   .text(`• Disciplina: ${dados.disciplina}`)
   .text(`• Professor responsável: ${dados.professor || 'N/A'}`)
   .text(`• Tema: ${dados.tema_edo}`)
   .text(`• Data e hora de início: ${dados.data_inicio}`)
   .text(`• Data e hora de término: ${dados.data_termino}`)
   .text(`• Tempo total de execução: ${dados.tempo_total_execucao}`)
   .text(`• Tempo médio por questão: ${dados.tempo_medio_questao}`);

// Seção de desempenho cognitivo
doc.moveDown(1)
   .fontSize(16)
   .font('Helvetica-Bold');

// Usa texto alternativo se não tiver suporte a emojis
if (temFonteEmoji) {
  doc.text('🧠 Desempenho Cognitivo (Taxonomia de Bloom)');
} else {
  doc.text('Desempenho Cognitivo (Taxonomia de Bloom)');
}
  
// Tabela de desempenho simplificada
if (dados.notas_por_nivel) {
  doc.moveDown(0.5);
  Object.entries(dados.notas_por_nivel).forEach(([nivel, nota]) => {
    doc.fontSize(12)
       .font('Helvetica')
       .text(`• ${nivel}: ${nota} pts`);
  });
}

// Nota final
doc.moveDown(1)
   .fontSize(16)
   .font('Helvetica-Bold');

// Usa texto alternativo se não tiver suporte a emojis
if (temFonteEmoji) {
  doc.text('🟢 Nota Final do EDO');
} else {
  doc.text('Nota Final do EDO');
}
  
doc.moveDown(0.5)
   .fontSize(14)
   .font('Helvetica')
   .text(`${dados.tema_edo} = ${dados.nota_edo} pontos`);

// Seção de questões erradas
if (dados.questoes_erradas && dados.questoes_erradas.length > 0) {
  doc.moveDown(1)
     .fontSize(16)
     .font('Helvetica-Bold');
  
  // Usa texto alternativo se não tiver suporte a emojis
  if (temFonteEmoji) {
    doc.text('❌ Questões com Erro');
  } else {
    doc.text('Questões com Erro');
  }
  
  doc.moveDown(0.5);
  dados.questoes_erradas.forEach((questao, index) => {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(`${index + 1}. ${questao.nivel} - Nível ${questao.nivel}`);
    
    doc.moveDown(0.3)
       .fontSize(12)
       .font('Helvetica')
       .text(`Enunciado: ${questao.texto_questao}`, { 
         indent: 20,
         align: 'justify',
         width: 480
       });
    
    doc.moveDown(0.3)
       .text(`Alternativa selecionada pelo aluno: ${questao.alternativa_escolhida}`);
    
    doc.moveDown(0.3)
       .text(`Alternativa correta: ${questao.alternativa_correta}`);
    
    if (index < dados.questoes_erradas.length - 1) {
      doc.moveDown(0.8);
    }
  });
}

// Nível máximo alcançado
doc.moveDown(1)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('Nível Máximo Alcançado');
  
doc.moveDown(0.5)
   .fontSize(12)
   .font('Helvetica')
   .text(`• Taxonomia mais alta atingida com sucesso: ${dados.nivel_maximo_taxonomia}`);

// Divisor antes do relatório da IA
doc.moveDown(1.5)
   .strokeColor('#4CAF50')
   .lineWidth(2)
   .moveTo(50, doc.y)
   .lineTo(550, doc.y)
   .stroke();

// Título do relatório detalhado
doc.moveDown(1)
   .fontSize(16)
   .font('Helvetica-Bold')
   .fillColor('#000')
   .text(`RELATÓRIO DETALHADO POR IA — ${dados.nome_aluno}`);

// Relatório detalhado da IA
doc.moveDown(0.5)
   .fontSize(12)
   .font('Helvetica');

// Processando o relatório da IA linha por linha para formatação adequada
const linhas = relatorio.split('\n');
let emTituloRelatorio = false;

for (let linha of linhas) {
  linha = linha.trim();
  
  if (!linha) {
    doc.moveDown(0.3);
    continue;
  }

  // Detecta títulos principais (com números e texto específico)
  if (linha.match(/^RELATÓRIO.*—/) || 
      linha.match(/^\d+\.\s*(Análise|Pontos|Dificuldades|Recomendações|Conclusão)/) ||
      linha.includes('Análise Geral') ||
      linha.includes('Pontos Fortes') ||
      linha.includes('Dificuldades Encontradas') ||
      linha.includes('Recomendações') ||
      linha.includes('Conclusão')) {
    
    doc.moveDown(0.8)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(linha);
    emTituloRelatorio = true;
  }
  // Detecta bullet points
  else if (linha.startsWith('•') || linha.startsWith('-')) {
    doc.moveDown(0.3)
       .fontSize(12)
       .font('Helvetica')
       .text(linha, { indent: 20 });
    continue;
  }
  
  // Texto normal (não é título nem bullet point)
  else {
    doc.moveDown(0.3)
       .fontSize(12)
       .font('Helvetica')
       .text(linha, { align: 'justify' });
  }
}

// Nível máximo alcançado
doc.moveDown(1)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('Nível Máximo Alcançado');
    
    doc.moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(`• Taxonomia mais alta atingida com sucesso: ${dados.nivel_maximo_taxonomia}`);

    // Divisor antes do relatório da IA
    doc.moveDown(1.5)
       .strokeColor('#4CAF50')
       .lineWidth(2)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    // Título do relatório detalhado
    doc.moveDown(1)
       .fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#000')
       .text(`RELATÓRIO DETALHADO POR IA — ${dados.nome_aluno}`);

    // Relatório detalhado da IA
    doc.moveDown(0.5)
       .fontSize(12)
       .font('Helvetica');

    // Processando o relatório da IA linha por linha para formatação adequada
    const linhasRelatorio = relatorio.split('\n');
    let emTituloSecao = false;

    for (let linha of linhasRelatorio) {
      linha = linha.trim();
      
      if (!linha) {
        doc.moveDown(0.3);
        continue;
      }

      // Detecta títulos principais (com números e texto específico)
      if (linha.match(/^RELATÓRIO.*—/) || 
          linha.match(/^\d+\.\s*(Análise|Pontos|Dificuldades|Recomendações|Conclusão)/) ||
          linha.includes('Análise Geral') ||
          linha.includes('Pontos Fortes') ||
          linha.includes('Dificuldades Encontradas') ||
          linha.includes('Recomendações') ||
          linha.includes('Conclusão')) {
        
        doc.moveDown(0.8)
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(linha);
        emTituloSecao = true;
      }
      // Detecta bullet points
      else if (linha.startsWith('•') || linha.startsWith('-')) {
        doc.moveDown(0.3)
           .font('Helvetica')
           .fontSize(11)
           .text(linha, { 
             indent: 20,
             align: 'justify',
             width: 480
           });
      }
      // Texto normal
      else {
        if (emTituloSecao) {
          doc.moveDown(0.5);
          emTituloSecao = false;
        } else {
          doc.moveDown(0.2);
        }
        
        doc.font('Helvetica')
           .fontSize(11)
           .text(linha, {
             align: 'justify',
             lineGap: 1,
             width: 500
           });
      }
    }

    // Rodapé
    const currentY = doc.y;
    const pageHeight = doc.page.height;
    
    // Se não há espaço suficiente para o rodapé, adiciona uma nova página
    if (currentY > pageHeight - 100) {
      doc.addPage();
    }

    // Posiciona o rodapé no final da página
    doc.y = pageHeight - 80;
    
    // Linha divisória no rodapé
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    // Texto do rodapé
    doc.fontSize(10)
       .fillColor('#555555')
       .text(
         `Relatório gerado automaticamente por ToLearn IA | ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
         50,
         doc.y + 10,
         { align: 'center' }
       );

    // Finalizando o PDF
    doc.end();
    console.log("PDF gerado com sucesso para:", dados.nome_aluno);
    
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório em PDF:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório em PDF." });
  }
});

/**
 * Rota para teste de saúde da API
 */
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "ToLearn Groq Integration API"
  });
});

/**
 * Rota para informações da API
 */
app.get("/", (req, res) => {
  res.json({
    message: "API ToLearn - Integração Groq",
    version: "1.0.0",
    endpoints: {
      chat: "POST /api/chat",
      relatorio: "POST /api/relatorio-edo",
      relatorioPDF: "POST /api/relatorio-edo/pdf",
      systemPrompt: "GET/PUT /api/config/system-prompt",
      reportPrompt: "GET/PUT /api/config/report-prompt",
      docs: "GET /api-docs",
      health: "GET /health"
    },
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

/**
 * Middleware para tratamento de rotas não encontradas
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: "Rota não encontrada", 
    message: `A rota ${req.method} ${req.path} não existe.`,
    availableEndpoints: [
      "GET /",
      "GET /health", 
      "GET /api-docs",
      "POST /api/chat",
      "POST /api/relatorio-edo",
      "POST /api/relatorio-edo/pdf",
      "GET /api/config/system-prompt",
      "PUT /api/config/system-prompt",
      "GET /api/config/report-prompt",
      "PUT /api/config/report-prompt"
    ]
  });
});

/**
 * Middleware para tratamento de erros globais
 */
app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);
  res.status(500).json({ 
    error: "Erro interno do servidor",
    message: "Ocorreu um erro inesperado. Verifique os logs do servidor."
  });
});

/**
 * Inicia o servidor na porta especificada
 */
app.listen(PORT, () => {
  console.log(`🚀 Servidor ToLearn rodando na porta ${PORT}`);
  console.log(`📚 Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
  console.log(`💡 Endpoint principal: http://localhost:${PORT}/api/relatorio-edo`);
  console.log(`🔧 Configuração de prompts: http://localhost:${PORT}/api/config/`);
});