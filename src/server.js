/**
 * Integração Groq - API ToLearn
 * Configuração do servidor Express
 */

// Importações das bibliotecas necessárias
import express from "express";  // Framework web para Node.js
import cors from "cors";        // Middleware para habilitar CORS na API
import swaggerUi from "swagger-ui-express";   // Interface visual para documentação Swagger

// Importação das rotas
import chatRoutes from './routes/chatRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import configRoutes from './routes/configRoutes.js';

// Importação dos middlewares
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Importação da configuração do Swagger
import { swaggerDocs } from './docs/swagger.js';

// Inicialização e configuração do aplicativo Express
const app = express();
app.use(express.json());                // Middleware para processar JSON no corpo das requisições
app.use(cors());                        // Habilita CORS para todas as rotas

// Configurações e variáveis de ambiente
const PORT = process.env.PORT || 3004;  // Porta do servidor (padrão: 3004)

// Configuração das rotas
app.use('/api/chat', chatRoutes);
app.use('/api/relatorio-edo', reportRoutes);
app.use('/api/config', configRoutes);

// Inicializa o Swagger e configura a rota para acessar a documentação
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// Middleware para tratamento de rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros globais
app.use(errorHandler);

/**
 * Inicia o servidor na porta especificada
 */
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ToLearn rodando na porta ${PORT}`);
    console.log(`📚 Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
    console.log(`💡 Endpoint principal: http://localhost:${PORT}/api/relatorio-edo`);
    console.log(`🔧 Configuração de prompts: http://localhost:${PORT}/api/config/`);
  });
};

export { app, startServer };
