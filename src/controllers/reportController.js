/**
 * Controlador para as rotas de relatório
 */
import { getGroqChatCompletion } from "../services/groqService.js";
import { getReportPrompt, getReportTurmaPrompt } from "../utils/promptUtils.js";
import { gerarRelatorioPDF, gerarRelatorioTurmaPDF } from "../services/pdfService.js";

/**
 * Gera um relatório detalhado para um EDO
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export async function gerarRelatorio(req, res) {
  const { dados } = req.body;
  
  // Verifica se os dados foram fornecidos
  if (!dados) {
    return res.status(400).json({ error: "Dados do EDO não fornecidos!" });
  }
  
  try {
    // Constrói a mensagem para a IA com os dados do EDO
    const message = `
    Dados do EDO (Estudo Dirigido Obrigatório):
    
    Aluno: ${dados.nome_aluno}
    Disciplina: ${dados.disciplina}
    Turma: ${dados.turma}
    Série: ${dados.serie}
    Tema: ${dados.tema_edo}
    Nota: ${dados.nota_edo}
    Data de início: ${dados.data_inicio}
    Data de término: ${dados.data_termino}
    Tempo total de execução: ${dados.tempo_total_execucao}
    Tempo médio por questão: ${dados.tempo_medio_questao}
    Nível máximo da taxonomia: ${dados.nivel_maximo_taxonomia}
    
    Questões erradas:
    ${dados.questoes_erradas?.map(q => `
      Questão ${q.numero}
      Nível: ${q.nivel}
      Texto: ${q.texto_questao}
      Alternativa escolhida: ${q.alternativa_escolhida}
      Alternativa correta: ${q.alternativa_correta}
    `).join('\n') || 'Nenhuma questão errada.'}
    `;
    
    // Obtém o prompt de relatório atual
    const reportPrompt = getReportPrompt();
    
    // Obtém a resposta da IA
    const relatorio = await getGroqChatCompletion(message, reportPrompt);
    
    // Retorna o relatório
    return res.json({ relatorio });
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório." });
  }
}

/**
 * Gera um relatório em PDF para um EDO
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export async function gerarRelatorioPDFHandler(req, res) {
  const { dados } = req.body;
  
  // Verifica se os dados foram fornecidos
  if (!dados) {
    return res.status(400).json({ error: "Dados do EDO não fornecidos!" });
  }
  
  try {
    // Constrói a mensagem para a IA com os dados do EDO
    const message = `
    Dados do EDO (Estudo Dirigido Obrigatório):
    
    Aluno: ${dados.nome_aluno}
    Disciplina: ${dados.disciplina}
    Turma: ${dados.turma}
    Série: ${dados.serie}
    Tema: ${dados.tema_edo}
    Nota: ${dados.nota_edo}
    Data de início: ${dados.data_inicio}
    Data de término: ${dados.data_termino}
    Tempo total de execução: ${dados.tempo_total_execucao}
    Tempo médio por questão: ${dados.tempo_medio_questao}
    Nível máximo da taxonomia: ${dados.nivel_maximo_taxonomia}
    
    Questões erradas:
    ${dados.questoes_erradas?.map(q => `
      Questão ${q.numero}
      Nível: ${q.nivel}
      Texto: ${q.texto_questao}
      Alternativa escolhida: ${q.alternativa_escolhida}
      Alternativa correta: ${q.alternativa_correta}
    `).join('\n') || 'Nenhuma questão errada.'}
    `;
    
    // Obtém o prompt de relatório atual
    const reportPrompt = getReportPrompt();
    
    // Obtém a resposta da IA
    const relatorio = await getGroqChatCompletion(message, reportPrompt);
    
    // Gera o PDF com o relatório
    await gerarRelatorioPDF(dados, relatorio, res);
    
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório em PDF:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório em PDF." });
  }
}

/**
 * Gera um relatório detalhado para uma turma com base em EDOs
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export async function gerarRelatorioTurma(req, res) {
  const { dados } = req.body;
  
  // Verifica se os dados foram fornecidos
  if (!dados) {
    return res.status(400).json({ error: "Dados da turma não fornecidos!" });
  }
  
  try {
    // Constrói a mensagem para a IA com os dados da turma
    const message = `
    Dados da Turma para Relatório de EDO (Estudo Dirigido Obrigatório):
    
    Turma: ${dados.turma}
    Série: ${dados.serie}
    Disciplina: ${dados.disciplina}
    Professor: ${dados.professor}
    Período: ${dados.periodo}
    Tema do EDO: ${dados.tema_edo}
    Data de início: ${dados.data_inicio}
    Data de término: ${dados.data_termino}
    Total de alunos: ${dados.total_alunos}
    Média geral: ${dados.media_geral}
    Tempo médio de execução: ${dados.tempo_medio_execucao}
    Nível máximo da taxonomia: ${dados.nivel_maximo_taxonomia}
    
    Distribuição de notas:
    - Excelente: ${dados.distribuicao_notas.excelente} alunos
    - Bom: ${dados.distribuicao_notas.bom} alunos
    - Regular: ${dados.distribuicao_notas.regular} alunos
    - Insuficiente: ${dados.distribuicao_notas.insuficiente} alunos
    
    Desempenho por nível de taxonomia:
    - Lembrar: ${dados.desempenho_por_nivel.Lembrar}
    - Compreender: ${dados.desempenho_por_nivel.Compreender}
    - Aplicar: ${dados.desempenho_por_nivel.Aplicar}
    - Analisar: ${dados.desempenho_por_nivel.Analisar}
    - Avaliar: ${dados.desempenho_por_nivel.Avaliar}
    - Criar: ${dados.desempenho_por_nivel.Criar}
    
    Questões problemáticas:
    ${dados.questoes_problematicas?.map(q => `
      Questão ${q.numero}
      Nível: ${q.nivel}
      Texto: ${q.texto_questao}
      Taxa de erro: ${q.taxa_erro}%
      Alternativa correta: ${q.alternativa_correta}
    `).join('\n') || 'Nenhuma questão problemática identificada.'}
    
    Alunos com melhores desempenhos:
    ${dados.alunos_destacados?.melhores_desempenhos?.map(a => `
      Nome: ${a.nome}
      Nota: ${a.nota}
      Tempo de execução: ${a.tempo_execucao}
    `).join('\n') || 'Nenhum aluno com desempenho destacado.'}
    
    Alunos que necessitam atenção:
    ${dados.alunos_destacados?.necessitam_atencao?.map(a => `
      Nome: ${a.nome}
      Nota: ${a.nota}
      Tempo de execução: ${a.tempo_execucao}
      Dificuldades: ${a.dificuldades.join(', ')}
    `).join('\n') || 'Nenhum aluno necessitando atenção especial.'}
    `;
    
    // Obtém o prompt de relatório de turma
    const reportPrompt = getReportTurmaPrompt();
    
    // Obtém a resposta da IA
    const relatorio = await getGroqChatCompletion(message, reportPrompt);
    
    // Retorna o relatório
    return res.json({ relatorio });
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório de turma:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório de turma." });
  }
}

/**
 * Gera um relatório em PDF para uma turma com base em EDOs
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 */
export async function gerarRelatorioTurmaPDFHandler(req, res) {
  const { dados } = req.body;
  
  // Verifica se os dados foram fornecidos
  if (!dados) {
    return res.status(400).json({ error: "Dados da turma não fornecidos!" });
  }
  
  try {
    // Constrói a mensagem para a IA com os dados da turma
    const message = `
    Dados da Turma para Relatório de EDO (Estudo Dirigido Obrigatório):
    
    Turma: ${dados.turma}
    Série: ${dados.serie}
    Disciplina: ${dados.disciplina}
    Professor: ${dados.professor}
    Período: ${dados.periodo}
    Tema do EDO: ${dados.tema_edo}
    Data de início: ${dados.data_inicio}
    Data de término: ${dados.data_termino}
    Total de alunos: ${dados.total_alunos}
    Média geral: ${dados.media_geral}
    Tempo médio de execução: ${dados.tempo_medio_execucao}
    Nível máximo da taxonomia: ${dados.nivel_maximo_taxonomia}
    
    Distribuição de notas:
    - Excelente: ${dados.distribuicao_notas.excelente} alunos
    - Bom: ${dados.distribuicao_notas.bom} alunos
    - Regular: ${dados.distribuicao_notas.regular} alunos
    - Insuficiente: ${dados.distribuicao_notas.insuficiente} alunos
    
    Desempenho por nível de taxonomia:
    - Lembrar: ${dados.desempenho_por_nivel.Lembrar}
    - Compreender: ${dados.desempenho_por_nivel.Compreender}
    - Aplicar: ${dados.desempenho_por_nivel.Aplicar}
    - Analisar: ${dados.desempenho_por_nivel.Analisar}
    - Avaliar: ${dados.desempenho_por_nivel.Avaliar}
    - Criar: ${dados.desempenho_por_nivel.Criar}
    
    Questões problemáticas:
    ${dados.questoes_problematicas?.map(q => `
      Questão ${q.numero}
      Nível: ${q.nivel}
      Texto: ${q.texto_questao}
      Taxa de erro: ${q.taxa_erro}%
      Alternativa correta: ${q.alternativa_correta}
    `).join('\n') || 'Nenhuma questão problemática identificada.'}
    
    Alunos com melhores desempenhos:
    ${dados.alunos_destacados?.melhores_desempenhos?.map(a => `
      Nome: ${a.nome}
      Nota: ${a.nota}
      Tempo de execução: ${a.tempo_execucao}
    `).join('\n') || 'Nenhum aluno com desempenho destacado.'}
    
    Alunos que necessitam atenção:
    ${dados.alunos_destacados?.necessitam_atencao?.map(a => `
      Nome: ${a.nome}
      Nota: ${a.nota}
      Tempo de execução: ${a.tempo_execucao}
      Dificuldades: ${a.dificuldades.join(', ')}
    `).join('\n') || 'Nenhum aluno necessitando atenção especial.'}
    `;
    
    // Obtém o prompt de relatório de turma
    const reportPrompt = getReportTurmaPrompt();
    
    // Obtém a resposta da IA
    const relatorio = await getGroqChatCompletion(message, reportPrompt);
    
    // Gera o PDF com o relatório
    await gerarRelatorioTurmaPDF(dados, relatorio, res);
    
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório de turma em PDF:", error.message);
    return res.status(500).json({ error: "Erro ao gerar o relatório de turma em PDF." });
  }
}
