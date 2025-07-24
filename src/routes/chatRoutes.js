/**
 * Rotas para o chat com IA
 */
import express from "express";
import { processarMensagem } from "../controllers/chatController.js";

const router = express.Router();

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
router.post("/", processarMensagem);

export default router;
