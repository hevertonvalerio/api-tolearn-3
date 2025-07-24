/**
 * Rotas para configuração de prompts
 */
import express from "express";
import { 
  obterSystemPrompt, 
  atualizarSystemPrompt, 
  obterReportPrompt, 
  atualizarReportPrompt 
} from "../controllers/configController.js";

const router = express.Router();

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
 */
router.get("/system-prompt", obterSystemPrompt);

/**
 * @swagger
 * /api/config/system-prompt:
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
router.put("/system-prompt", atualizarSystemPrompt);

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
 */
router.get("/report-prompt", obterReportPrompt);

/**
 * @swagger
 * /api/config/report-prompt:
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
router.put("/report-prompt", atualizarReportPrompt);

export default router;
