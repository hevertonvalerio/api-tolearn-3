import express from "express";
import Groq from "groq-sdk";
import 'dotenv/config';
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import PDFDocument from "pdfkit";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors());

const PORT = process.env.PORT || 3001;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Configuração do Swagger
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
  apis: ["./index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
function getGroqChatCompletion(message, systemPrompt = "Não responda nada fora do contexto de ciência da computação e programação.") {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem não fornecida!" });
  }

  try {
    const responseGroq = await getGroqChatCompletion(message);

    console.log("Resposta da API Groq:", responseGroq.choices[0]?.message.content);

    res.json({ response: responseGroq.choices[0]?.message?.content || "" });
  } catch (error) {
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
 *                   disciplina:
 *                     type: string
 *                   turma:
 *                     type: string
 *                   serie:
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
app.post("/api/relatorio-edo", async (req, res) => {
  const { dados } = req.body;

  if (!dados || !dados.nome_aluno) {
    return res.status(400).json({ error: "Dados do EDO não fornecidos corretamente!" });
  }

  try {
    const systemPrompt = `
    Você é um especialista em educação e análise de desempenho acadêmico. 
    Utilize os dados a seguir para gerar um relatório humanizado e pedagógico a respeito do desempenho do aluno em um Estudo Dirigido Obrigatório (EDO), de acordo com a seguinte estrutura:

    1. Análise Geral do Desempenho
    2. Pontos Fortes
    3. Dificuldades Encontradas
    4. Recomendações ao Professor
    5. Conclusão

    Regras de saída esperada:
    * Use linguagem pedagógica, humanizada e objetiva.
    * A análise deve reconhecer acertos, destacar potenciais e explicar com empatia as dificuldades.
    * A seção de recomendações deve ser útil para o professor saber como apoiar o aluno nos próximos desafios.
    * A conclusão deve reforçar o estágio atual do aluno e seu potencial de progresso.

    Formato final: texto corrido estruturado nos 5 blocos mencionados, sem tópicos numéricos no corpo, mas respeitando os títulos. 
    O conteúdo deve ser exclusivo para este aluno, considerando apenas a tentativa com a maior nota.
    
    Inicie o relatório com:
    🧠 RELATÓRIO DETALHADO POR IA — [Nome do Aluno]
    `;

    const userPrompt = `
    Gere um relatório detalhado para os seguintes dados:
    ${JSON.stringify(dados, null, 2)}
    `;

    const responseGroq = await getGroqChatCompletion(userPrompt, systemPrompt);
    const relatorio = responseGroq.choices[0]?.message.content || "";

    console.log("Relatório gerado com sucesso!");

    res.json({ relatorio });
  } catch (error) {
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
 *                   disciplina:
 *                     type: string
 *                   turma:
 *                     type: string
 *                   serie:
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
app.post("/api/relatorio-edo/pdf", async (req, res) => {
  const { dados } = req.body;

  if (!dados || !dados.nome_aluno) {
    return res.status(400).json({ error: "Dados do EDO não fornecidos corretamente!" });
  }

  try {
    const systemPrompt = `
    Você é um especialista em educação e análise de desempenho acadêmico. 
    Utilize os dados a seguir para gerar um relatório humanizado e pedagógico a respeito do desempenho do aluno em um Estudo Dirigido Obrigatório (EDO), de acordo com a seguinte estrutura:

    1. Análise Geral do Desempenho
    2. Pontos Fortes
    3. Dificuldades Encontradas
    4. Recomendações ao Professor
    5. Conclusão

    Regras de saída esperada:
    * Use linguagem pedagógica, humanizada e objetiva.
    * A análise deve reconhecer acertos, destacar potenciais e explicar com empatia as dificuldades.
    * A seção de recomendações deve ser útil para o professor saber como apoiar o aluno nos próximos desafios.
    * A conclusão deve reforçar o estágio atual do aluno e seu potencial de progresso.

    Formato final: texto corrido estruturado nos 5 blocos mencionados, sem tópicos numéricos no corpo, mas respeitando os títulos. 
    O conteúdo deve ser exclusivo para este aluno, considerando apenas a tentativa com a maior nota.
    
    Inicie o relatório com:
    🧠 RELATÓRIO DETALHADO POR IA — [Nome do Aluno]
    `;

    const userPrompt = `
    Gere um relatório detalhado para os seguintes dados:
    ${JSON.stringify(dados, null, 2)}
    `;

    const responseGroq = await getGroqChatCompletion(userPrompt, systemPrompt);
    const relatorio = responseGroq.choices[0]?.message.content || "";

    console.log("Gerando PDF do relatório...");

    // Configurando o cabeçalho para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${dados.nome_aluno.replace(/\s+/g, '-').toLowerCase()}.pdf`);

    // Criando o documento PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      info: {
        Title: `Relatório EDO - ${dados.nome_aluno}`,
        Author: 'ToLearn - Plataforma de Ensino',
        Subject: `Relatório de desempenho em ${dados.disciplina} - ${dados.tema_edo}`
      }
    });

    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Adicionando logo (simulada com um retângulo colorido)
    doc.rect(50, 50, 100, 40)
       .fillColor('#4CAF50')
       .fill();
    
    doc.fillColor('#000')
       .fontSize(16)
       .text('ToLearn', 60, 65);

    // Cabeçalho do relatório
    doc.moveDown(2)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('Relatório Detalhado de Desempenho', { align: 'center' });
    
    doc.moveDown(0.5)
       .fontSize(16)
       .text(`Aluno: ${dados.nome_aluno}`, { align: 'center' });
    
    // Informações do EDO
    doc.moveDown(1.5)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Informações do EDO');
    
    doc.moveDown(0.5)
       .fontSize(12)
       .font('Helvetica')
       .text(`Disciplina: ${dados.disciplina}`)
       .text(`Turma: ${dados.turma}`)
       .text(`Tema: ${dados.tema_edo}`)
       .text(`Nota: ${dados.nota_edo}`)
       .text(`Data de início: ${dados.data_inicio}`)
       .text(`Data de término: ${dados.data_termino}`)
       .text(`Tempo total: ${dados.tempo_total_execucao}`)
       .text(`Nível máximo alcançado: ${dados.nivel_maximo_taxonomia}`);

    // Divisor
    doc.moveDown(1)
       .strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    // Conteúdo do relatório
    doc.moveDown(1)
       .fontSize(12)
       .font('Helvetica');

    // Processando o relatório linha por linha para formatação adequada
    const linhas = relatorio.split('\n');
    let emTitulo = false;

    for (let linha of linhas) {
      // Se for um título (1., 2., etc. ou começar com emoji)
      if (linha.match(/^\d+\.\s/) || linha.match(/^🧠/) || linha.match(/^✅/) || linha.match(/^❌/) || linha.match(/^🧭/) || linha.match(/^✅/)) {
        emTitulo = true;
        doc.moveDown(0.5)
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(linha);
      } else if (linha.trim() === '') {
        doc.moveDown(0.5);
      } else {
        if (emTitulo) {
          emTitulo = false;
          doc.moveDown(0.5);
        }
        doc.font('Helvetica')
           .fontSize(12)
           .text(linha, {
             align: 'justify',
             lineGap: 2
           });
      }
    }

    // Rodapé na página atual
    // Linha divisória no rodapé
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, 750)
       .lineTo(550, 750)
       .stroke();
    
    // Texto do rodapé
    doc.fontSize(10)
       .fillColor('#555555')
       .text(
         `Relatório gerado automaticamente por ToLearn IA | ${new Date().toLocaleDateString('pt-BR')}`,
         50,
         760,
         { align: 'center' }
       );
    
    // Número da página - vamos apenas adicionar na página atual
    doc.text(
      `Página 1`,
      50,
      760,
      { align: 'right' }
    );

    // Finalizando o PDF
    doc.end();
    console.log("PDF gerado com sucesso!");
    
  } catch (error) {
    console.error("Erro ao gerar relatório em PDF:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório em PDF." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
});
