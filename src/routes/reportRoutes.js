/**
 * Rotas para relatórios de EDO
 */
import express from "express";
import { 
  gerarRelatorio, 
  gerarRelatorioPDFHandler,
  gerarRelatorioTurma,
  gerarRelatorioTurmaPDFHandler 
} from "../controllers/reportController.js";

const router = express.Router();

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
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *       400:
 *         description: Dados não fornecidos
 *       500:
 *         description: Erro ao gerar o relatório
 */
router.post("/", gerarRelatorio);

/**
 * @swagger
 * /api/relatorio-edo/pdf:
 *   post:
 *     summary: Gera um relatório em PDF para um Estudo Dirigido Obrigatório (EDO)
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
 *     responses:
 *       200:
 *         description: PDF gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Dados não fornecidos
 *       500:
 *         description: Erro ao gerar o PDF
 */
router.post("/pdf", gerarRelatorioPDFHandler);

/**
 * @swagger
 * /api/relatorio-edo/turma:
 *   post:
 *     summary: Gera um relatório detalhado para uma turma com base em Estudos Dirigidos Obrigatórios (EDO)
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
 *                   turma:
 *                     type: string
 *                   serie:
 *                     type: string
 *                   disciplina:
 *                     type: string
 *                   professor:
 *                     type: string
 *                   periodo:
 *                     type: string
 *                   tema_edo:
 *                     type: string
 *                   media_turma:
 *                     type: number
 *                   alunos:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         nome:
 *                           type: string
 *                         nota:
 *                           type: number
 *                         nivel_maximo_taxonomia:
 *                           type: string
 *                   distribuicao_notas:
 *                     type: object
 *                   distribuicao_taxonomia:
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
 *         description: Dados não fornecidos
 *       500:
 *         description: Erro ao gerar o relatório
 */
router.post("/turma", gerarRelatorioTurma);

/**
 * @swagger
 * /api/relatorio-edo/turma/pdf:
 *   post:
 *     summary: Gera um relatório em PDF para uma turma com base em Estudos Dirigidos Obrigatórios (EDO)
 *     description: Gera um documento PDF com análise detalhada do desempenho da turma
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
 *                   turma:
 *                     type: string
 *                   serie:
 *                     type: string
 *                   disciplina:
 *                     type: string
 *                   professor:
 *                     type: string
 *                   periodo:
 *                     type: string
 *                   tema_edo:
 *                     type: string
 *                   media_turma:
 *                     type: number
 *                   alunos:
 *                     type: array
 *                   distribuicao_notas:
 *                     type: object
 *                   distribuicao_taxonomia:
 *                     type: object
 *               relatorio:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDF gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Dados não fornecidos ou inválidos
 *       500:
 *         description: Erro ao gerar o PDF
 */
router.post("/turma/pdf", gerarRelatorioTurmaPDFHandler);

export default router;
