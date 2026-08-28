import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialReportApiData, FinancialTransactionApiItem } from './api';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * Gera e realiza o download do relatório oficial de Dízimos e Ofertas em PDF
 */
export function exportFinancialReportToPdf(reportData: FinancialReportApiData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Cabeçalho Dourado e Faixa Institucional
  doc.setFillColor(34, 27, 19); // #221B13 tom escuro nobre
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Linha dourada decorativa
  doc.setFillColor(218, 160, 23); // #DAA017
  doc.rect(0, 32, pageWidth, 1.5, 'F');

  // Título e Subtítulo da Igreja
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(reportData.tenantName.toUpperCase(), margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(218, 160, 23);
  doc.text('DEPARTAMENTO DE TESOURARIA & AUDITORIA ECLESIÁSTICA', margin, 19);

  doc.setTextColor(220, 220, 220);
  doc.setFontSize(8);
  doc.text(`${reportData.churchCity} • Pastor Presidente: ${reportData.pastorName}`, margin, 25);

  // Protocolo e Data no canto direito do cabeçalho
  doc.setFontSize(8);
  doc.setTextColor(218, 160, 23);
  doc.text(`PROTOCOLO: ${reportData.reportId}`, pageWidth - margin, 13, { align: 'right' });
  doc.setTextColor(220, 220, 220);
  doc.text(`EMISSÃO: ${new Date(reportData.generatedAt).toLocaleString('pt-BR')}`, pageWidth - margin, 19, {
    align: 'right',
  });
  doc.text(`EXERCÍCIO: ${reportData.periodLabel}`, pageWidth - margin, 25, { align: 'right' });

  // 2. Título do Relatório
  let currentY = 40;
  doc.setTextColor(34, 27, 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BALANCETE ANALÍTICO DE DÍZIMOS, OFERTAS E MISSÕES', margin, currentY);

  currentY += 6;

  // 3. Quadro Resumo Executivo (Cards de Totais)
  const sum = reportData.summary;
  const colWidth = (pageWidth - margin * 2 - 9) / 4;
  const boxHeight = 16;

  const boxes = [
    { title: 'TOTAL DE DÍZIMOS', value: formatCurrency(sum.totalTithes), bg: [248, 245, 236], border: [218, 160, 23] },
    { title: 'OFERTAS & MISSÕES', value: formatCurrency(sum.totalOfferings + sum.totalMissions), bg: [248, 245, 236], border: [218, 160, 23] },
    { title: 'CAMPANHA DO TEMPLO', value: formatCurrency(sum.totalBuildingCampaign), bg: [248, 245, 236], border: [218, 160, 23] },
    { title: 'RECEITA LÍQUIDA', value: formatCurrency(sum.totalIncome), bg: [230, 245, 235], border: [16, 185, 129] },
  ];

  boxes.forEach((box, index) => {
    const x = margin + index * (colWidth + 3);
    doc.setFillColor(box.bg[0], box.bg[1], box.bg[2]);
    doc.setDrawColor(box.border[0], box.border[1], box.border[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, currentY, colWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text(box.title, x + 3, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(box.border[0], box.border[1], box.border[2]);
    doc.text(box.value, x + 3, currentY + 11.5);
  });

  currentY += boxHeight + 6;

  // 4. Detalhamento por Canal de Arrecadação
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(34, 27, 19);
  doc.text('Distribuição por Meio de Arrecadação:', margin, currentY);

  currentY += 2;

  const channelsData = reportData.paymentMethodBreakdown.map((c) => [
    c.method,
    formatCurrency(c.total),
    `${c.percentage.toFixed(1)}%`,
    `${c.count} lançamentos`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Canal / Método de Pagamento', 'Total Arrecadado', 'Participação', 'Volume']],
    body: channelsData,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: {
      fillColor: [34, 27, 19],
      textColor: [218, 160, 23],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [250, 248, 242],
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 5. Tabela Detalhada de Transações e Recibos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(34, 27, 19);
  doc.text('Extrato Discriminado de Dízimos e Ofertas:', margin, currentY);

  currentY += 2;

  const tableRows = reportData.transactions.map((t) => [
    formatDate(t.date),
    t.receiptNumber,
    t.typeName,
    t.donorOrBeneficiary,
    t.paymentMethodLabel,
    t.type === 'expense' ? `-${formatCurrency(t.amount)}` : formatCurrency(t.amount),
    t.auditHash || 'VALIDADO',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Nº Recibo', 'Categoria', 'Identificação / Dizimista', 'Meio', 'Valor (R$)', 'Auditoria RLS']],
    body: tableRows,
    theme: 'striped',
    margin: { left: margin, right: margin },
    styles: { fontSize: 7, cellPadding: 1.8 },
    headStyles: {
      fillColor: [34, 27, 19],
      textColor: [248, 245, 236],
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 42 },
      4: { cellWidth: 24 },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 20, halign: 'center', fontSize: 6, textColor: [100, 100, 100] },
    },
    alternateRowStyles: {
      fillColor: [252, 250, 245],
    },
    didParseCell: (data) => {
      // Destaque em verde para entradas e vermelho para saídas
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw || '');
        if (text.startsWith('-')) {
          data.cell.styles.textColor = [185, 28, 28];
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
  });

  // 6. Rodapé Institucional com Assinaturas e Versículo
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Se estiver muito próximo do fim da página, cria nova página para as assinaturas
  let signY = finalY;
  if (signY > pageHeight - 35) {
    doc.addPage();
    signY = 25;
  }

  // Linhas de Assinatura
  const signColWidth = (pageWidth - margin * 2 - 20) / 2;
  const leftSignX = margin + 10;
  const rightSignX = margin + signColWidth + 20;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(leftSignX, signY + 10, leftSignX + signColWidth - 20, signY + 10);
  doc.line(rightSignX, signY + 10, rightSignX + signColWidth - 20, signY + 10);

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('TESOURARIA GERAL', leftSignX + (signColWidth - 20) / 2, signY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Responsável Contábil & RLS', leftSignX + (signColWidth - 20) / 2, signY + 17, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('CONSELHO PASTORAL', rightSignX + (signColWidth - 20) / 2, signY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(reportData.pastorName, rightSignX + (signColWidth - 20) / 2, signY + 17, { align: 'center' });

  // Versículo Bíblico e Rodapé Final
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const verseText =
    '"Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa... diz o Senhor dos Exércitos." (Malaquias 3:10)';
  doc.text(verseText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Download do arquivo PDF
  const filename = `Relatorio_Dizimos_Ofertas_${reportData.tenantName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Gera e realiza o download do extrato detalhado de Dízimos e Ofertas em formato CSV
 */
export function exportFinancialReportToCsv(reportData: FinancialReportApiData) {
  const sum = reportData.summary;

  // Linhas do CSV formatadas para compatibilidade universal (Excel / Sheets com delimitador ponto e vírgula)
  const rows: string[] = [
    `"RELATÓRIO FINANCEIRO ECLESIÁSTICO - ${reportData.tenantName.toUpperCase()}"`,
    `"Protocolo";"${reportData.reportId}"`,
    `"Período";"${reportData.periodLabel}"`,
    `"Emissão";"${new Date(reportData.generatedAt).toLocaleString('pt-BR')}"`,
    `"Pastor Presidente";"${reportData.pastorName}"`,
    `"Cidade/UF";"${reportData.churchCity}"`,
    `""`,
    `"RESUMO CONSOLIDADO"`,
    `"Total de Dízimos (R$)";"${sum.totalTithes.toFixed(2).replace('.', ',')}"`,
    `"Total de Ofertas (R$)";"${sum.totalOfferings.toFixed(2).replace('.', ',')}"`,
    `"Total de Missões (R$)";"${sum.totalMissions.toFixed(2).replace('.', ',')}"`,
    `"Campanha do Templo (R$)";"${sum.totalBuildingCampaign.toFixed(2).replace('.', ',')}"`,
    `"Receita Total de Entradas (R$)";"${sum.totalIncome.toFixed(2).replace('.', ',')}"`,
    `"Despesas Operacionais (R$)";"${sum.totalExpenses.toFixed(2).replace('.', ',')}"`,
    `"Saldo Líquido em Caixa (R$)";"${sum.netBalance.toFixed(2).replace('.', ',')}"`,
    `"Arrecadação via PIX";"${sum.pixPercentage}%"`,
    `""`,
    `"EXTRATO ANALÍTICO DE DÍZIMOS E OFERTAS"`,
    `"Data";"Nº Recibo";"Tipo / Categoria";"Dizimista / Ofertante";"Meio de Pagamento";"Valor (R$)";"Observações";"Status Auditoria";"Hash RLS"`,
  ];

  reportData.transactions.forEach((tx) => {
    const formattedAmount = tx.amount.toFixed(2).replace('.', ',');
    const line = [
      `"${formatDate(tx.date)}"`,
      `"${tx.receiptNumber}"`,
      `"${tx.typeName}"`,
      `"${tx.donorOrBeneficiary}"`,
      `"${tx.paymentMethodLabel}"`,
      `"${tx.type === 'expense' ? '-' : ''}${formattedAmount}"`,
      `"${tx.notes.replace(/"/g, '""')}"`,
      `"${tx.status === 'audited' ? 'Auditado RLS' : 'Confirmado'}"`,
      `"${tx.auditHash || 'AUD-OK'}"`,
    ].join(';');

    rows.push(line);
  });

  // Prefixa com UTF-8 BOM (\uFEFF) para garantir que o Excel abra acentos e caracteres em português corretamente
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Extrato_Dizimos_Ofertas_${reportData.tenantName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
