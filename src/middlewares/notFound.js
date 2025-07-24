/**
 * Middleware para tratamento de rotas não encontradas
 */
export const notFoundHandler = (req, res) => {
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
};
