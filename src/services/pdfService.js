/**
 * Serviço para geração de PDFs
 */
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Gera um PDF com o relatório do EDO
 * 
 * @param {Object} dados - Dados do aluno e do EDO
 * @param {string} relatorio - Texto do relatório gerado pela IA
 * @param {Object} res - Objeto de resposta do Express
 */
export async function gerarRelatorioPDF(dados, relatorio, res) {
  try {
    // Cria um novo documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Relatório EDO - ${dados.nome_aluno}`,
        Author: 'ToLearn IA',
        Subject: `Relatório de desempenho em ${dados.disciplina}`,
        Keywords: 'EDO, relatório, desempenho, educação'
      }
    });

    // Configura o cabeçalho do HTTP para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-edo-${dados.nome_aluno.replace(/\s+/g, '-').toLowerCase()}.pdf`);

    // Pipe o PDF para a resposta HTTP
    doc.pipe(res);

    // Tenta carregar a fonte para emojis (se disponível)
    try {
      const fontPath = path.join(process.cwd(), 'docs', 'NotoEmoji-Regular.ttf');
      if (fs.existsSync(fontPath)) {
        doc.registerFont('Emoji', fontPath);
        console.log("Fonte de emoji carregada com sucesso!");
      } else {
        console.warn("Fonte de emoji não encontrada. Emojis podem não ser exibidos corretamente.");
      }
    } catch (fontError) {
      console.warn("Erro ao carregar fonte de emoji:", fontError.message);
    }

    // Tenta adicionar o logotipo
    try {
      const logoPath = path.join(process.cwd(), 'docs', 'logotipo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [150, 100],
          align: 'center'
        });
        doc.moveDown(1);
      } else {
        console.warn("Logotipo não encontrado. Usando placeholder.");
        // Desenha um retângulo como placeholder
        doc.rect(50, 50, 150, 50)
           .fillAndStroke('#f6f6f6', '#dddddd');
        doc.fillColor('#333333')
           .fontSize(16)
           .text('ToLearn', 75, 65);
      }
    } catch (logoError) {
      console.warn("Erro ao adicionar logotipo:", logoError.message);
      // Desenha um retângulo como placeholder em caso de erro
      doc.rect(50, 50, 150, 50)
         .fillAndStroke('#f6f6f6', '#dddddd');
      doc.fillColor('#333333')
         .fontSize(16)
         .text('ToLearn', 75, 65);
    }

    // Adiciona o cabeçalho do relatório
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('RELATÓRIO DETALHADO DE DESEMPENHO', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Adiciona os metadados do aluno e da avaliação
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Aluno: ${dados.nome_aluno}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Turma: ${dados.turma}`, { align: 'right' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Disciplina: ${dados.disciplina}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Série: ${dados.serie}`, { align: 'right' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Tema: ${dados.tema_edo}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Nota: ${dados.nota_edo}`, { align: 'right' });
    
    doc.moveDown(0.5);
    
    // Adiciona uma linha divisória
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown(1);
    
    // Adiciona o conteúdo do relatório
    const linhas = relatorio.split('\n');
    let emTituloRelatorio = true;
    let emTituloSecao = false;
    
    for (const linha of linhas) {
      // Pula linhas vazias
      if (linha.trim() === '') {
        doc.moveDown(0.5);
        continue;
      }
      
      // Detecta o título principal do relatório
      if (linha.includes('RELATÓRIO DETALHADO POR IA') || linha.includes('RELATÓRIO DE DESEMPENHO')) {
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text(linha, { align: 'center' });
        emTituloRelatorio = false;
        doc.moveDown(1);
      }
      // Detecta títulos de seções
      else if (linha.includes('Análise Geral') || 
               linha.includes('Pontos Fortes') || 
               linha.includes('Dificuldades') || 
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
    throw new Error(`Erro ao gerar o relatório em PDF: ${error.message}`);
  }
}

/**
 * Gera um PDF com o relatório de turma para EDO
 * 
 * @param {Object} dados - Dados da turma e do EDO
 * @param {string} relatorio - Texto do relatório gerado pela IA
 * @param {Object} res - Objeto de resposta do Express
 */
export async function gerarRelatorioTurmaPDF(dados, relatorio, res) {
  try {
    // Cria um novo documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Relatório EDO Turma - ${dados.turma}`,
        Author: 'ToLearn IA',
        Subject: `Relatório de desempenho da turma em ${dados.disciplina}`,
        Keywords: 'EDO, relatório, turma, desempenho, educação'
      }
    });

    // Configura o cabeçalho do HTTP para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-edo-turma-${dados.turma.replace(/\s+/g, '-').toLowerCase()}.pdf`);

    // Pipe o PDF para a resposta HTTP
    doc.pipe(res);

    // Tenta carregar a fonte para emojis (se disponível)
    try {
      const fontPath = path.join(process.cwd(), 'docs', 'NotoEmoji-Regular.ttf');
      if (fs.existsSync(fontPath)) {
        doc.registerFont('Emoji', fontPath);
        console.log("Fonte de emoji carregada com sucesso!");
      } else {
        console.warn("Fonte de emoji não encontrada. Emojis podem não ser exibidos corretamente.");
      }
    } catch (fontError) {
      console.warn("Erro ao carregar fonte de emoji:", fontError.message);
    }

    // Tenta adicionar o logotipo
    try {
      const logoPath = path.join(process.cwd(), 'docs', 'logotipo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [150, 100],
          align: 'center'
        });
        doc.moveDown(1);
      } else {
        console.warn("Logotipo não encontrado. Usando placeholder.");
        // Desenha um retângulo como placeholder
        doc.rect(50, 50, 150, 50)
           .fillAndStroke('#f6f6f6', '#dddddd');
        doc.fillColor('#333333')
           .fontSize(16)
           .text('ToLearn', 75, 65);
      }
    } catch (logoError) {
      console.warn("Erro ao adicionar logotipo:", logoError.message);
      // Desenha um retângulo como placeholder em caso de erro
      doc.rect(50, 50, 150, 50)
         .fillAndStroke('#f6f6f6', '#dddddd');
      doc.fillColor('#333333')
         .fontSize(16)
         .text('ToLearn', 75, 65);
    }

    // Adiciona o cabeçalho do relatório
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('RELATÓRIO DE DESEMPENHO DA TURMA', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Adiciona os metadados da turma e da avaliação
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Turma: ${dados.turma}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Série: ${dados.serie}`, { align: 'right' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Disciplina: ${dados.disciplina}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Professor: ${dados.professor}`, { align: 'right' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Tema: ${dados.tema_edo}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Período: ${dados.periodo}`, { align: 'right' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Total de alunos: ${dados.total_alunos}`, { continued: true })
       .font('Helvetica-Bold')
       .text(`   Média geral: ${dados.media_geral}`, { align: 'right' });
    
    doc.moveDown(0.5);
    
    // Adiciona uma linha divisória
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown(1);
    
    // Adiciona o conteúdo do relatório
    const linhas = relatorio.split('\n');
    let emTituloRelatorio = true;
    let emTituloSecao = false;
    
    for (const linha of linhas) {
      // Pula linhas vazias
      if (linha.trim() === '') {
        doc.moveDown(0.5);
        continue;
      }
      
      // Detecta o título principal do relatório
      if (linha.includes('RELATÓRIO DE DESEMPENHO DA TURMA')) {
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text(linha, { align: 'center' });
        emTituloRelatorio = false;
        doc.moveDown(1);
      }
      // Detecta títulos de seções
      else if (linha.includes('Análise Geral') || 
               linha.includes('Pontos Fortes') || 
               linha.includes('Desafios Coletivos') || 
               linha.includes('Análise de Grupos') || 
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
    console.log("PDF de turma gerado com sucesso para:", dados.turma);
    
  } catch (error) {
    // Tratamento de erro
    console.error("Erro ao gerar relatório de turma em PDF:", error.message);
    throw new Error(`Erro ao gerar o relatório de turma em PDF: ${error.message}`);
  }
}
