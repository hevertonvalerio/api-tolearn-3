/**
 * Middleware para tratamento de erros globais
 */
export const errorHandler = (error, req, res, next) => {
  console.error("Erro não tratado:", error);
  res.status(500).json({ 
    error: "Erro interno do servidor",
    message: "Ocorreu um erro inesperado. Verifique os logs do servidor."
  });
};
