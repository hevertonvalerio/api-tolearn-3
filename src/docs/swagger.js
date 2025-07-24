/**
 * Configuração do Swagger para documentação da API
 */
import swaggerJsDoc from "swagger-jsdoc";

// Opções de configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API ToLearn - Integração Groq",
      version: "1.0.0",
      description: "API para integração com a Groq para geração de conteúdo por IA",
      contact: {
        name: "Suporte ToLearn",
        email: "suporte@tolearn.com.br"
      }
    },
    servers: [
      {
        url: "http://localhost:3004",
        description: "Servidor de desenvolvimento"
      }
    ],
    tags: [
      {
        name: "Chat",
        description: "Endpoints para interação com o chat da IA"
      },
      {
        name: "Relatórios",
        description: "Endpoints para geração de relatórios de EDO"
      },
      {
        name: "Configuração",
        description: "Endpoints para configuração de prompts"
      }
    ]
  },
  apis: ["./src/routes/*.js"]  // Arquivos com anotações JSDoc para o Swagger
};

// Inicializa o Swagger e configura a rota para acessar a documentação
const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs };
