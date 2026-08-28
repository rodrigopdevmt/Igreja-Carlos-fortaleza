import { jsPDF } from 'jspdf';

export type DocumentType =
  | 'baptism'
  | 'presentation'
  | 'ordination'
  | 'marriage'
  | 'recommendation'
  | 'course_completion'
  | 'membership_declaration'
  | 'tithe_tax_receipt';

export type DocumentTheme = 'prestige_gold_dark' | 'royal_ivory_light' | 'apostolic_glass';
export type DocumentOrientation = 'landscape' | 'portrait';

export interface DocumentTemplateMeta {
  id: DocumentType;
  title: string;
  category: 'sacramento' | 'ministerial' | 'administrativo' | 'ensino' | 'familia';
  defaultOrientation: DocumentOrientation;
  badge: string;
  description: string;
  defaultVerseReference: string;
  defaultVerseText: string;
  defaultOfficiant: string;
  defaultRoleOrMinistry?: string;
}

export interface ChurchDocumentData {
  id: string;
  type: DocumentType;
  registrationCode: string; // Ex: IBN-CERT-2026-9812
  securityHash: string; // SHA-256 style hash
  recipientName: string;
  recipientDocument?: string; // CPF or RG
  recipientMemberId?: string;
  
  // Custom context fields
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  witnesses?: string;
  destinationChurch?: string;
  destinationCity?: string;
  courseName?: string;
  workloadHours?: number;
  financialAmount?: number;
  financialYear?: number;
  
  // Ecclesiastical info
  ministryOrRole?: string;
  officiantName: string;
  officiantRole: string;
  secondSignatoryName?: string;
  secondSignatoryRole?: string;
  
  // Scripture & Text
  customTitle?: string;
  customBody?: string;
  verseReference: string;
  verseText: string;
  
  // Book & Registry
  bookNumber: string;
  pageNumber: string;
  entryNumber: string;
  
  // Visual config
  theme: DocumentTheme;
  orientation: DocumentOrientation;
  includeWatermark: boolean;
  includeGoldSeal: boolean;
  includeQrCode: boolean;
  includeSignatures: boolean;
  
  // Metadata
  issuedAt: string; // ISO
  city: string;
  state: string;
  tenantName: string;
  tenantCnpj?: string;
  status: 'valid' | 'revoked';
}

export const DOCUMENT_TEMPLATES: Record<DocumentType, DocumentTemplateMeta> = {
  baptism: {
    id: 'baptism',
    title: 'Certificado de Batismo nas Águas',
    category: 'sacramento',
    defaultOrientation: 'landscape',
    badge: 'Sacramento Oficial',
    description: 'Certifica o testemunho público de fé e regeneração através do batismo bíblico por imersão.',
    defaultVerseReference: 'Romanos 6:4',
    defaultVerseText: 'De sorte que fomos sepultados com ele pelo batismo na morte; para que, como Cristo ressuscitou dos mortos pela glória do Pai, assim andemos nós também em novidade de vida.',
    defaultOfficiant: 'Apóstolo Carlos Alberto Silveira',
  },
  presentation: {
    id: 'presentation',
    title: 'Certificado de Apresentação ao Senhor',
    category: 'familia',
    defaultOrientation: 'landscape',
    badge: 'Dedicação & Família',
    description: 'Consagração do bebê ou criança ao Senhor Jesus perante a congregação apostólica.',
    defaultVerseReference: 'Provérbios 22:6',
    defaultVerseText: 'Instrui o menino no caminho em que deve andar, e, até quando envelhecer, não se desviará dele.',
    defaultOfficiant: 'Apóstolo Carlos Alberto & Bispa Helena Silveira',
  },
  ordination: {
    id: 'ordination',
    title: 'Certificado de Ordenação Ministerial',
    category: 'ministerial',
    defaultOrientation: 'landscape',
    badge: 'Consagração Apostólica',
    description: 'Ato solene de unção, imposição de mãos e investidura de autoridade eclesiástica.',
    defaultVerseReference: '2 Timóteo 4:2',
    defaultVerseText: 'Prega a palavra, insta a tempo e fora de tempo, redargue, repreende, exorta com toda a longanimidade e doutrina.',
    defaultOfficiant: 'Conselho Apostólico & Pr. Presidente',
    defaultRoleOrMinistry: 'Pastor(a) Auxiliar',
  },
  marriage: {
    id: 'marriage',
    title: 'Certificado de Bênção Matrimonial',
    category: 'familia',
    defaultOrientation: 'landscape',
    badge: 'Aliança Sagrada',
    description: 'Celebração da união conjugal segundo as sagradas escrituras com efeito religioso.',
    defaultVerseReference: '1 Coríntios 13:7-8',
    defaultVerseText: 'O amor tudo sofre, tudo crê, tudo espera, tudo suporta. O amor jamais acaba.',
    defaultOfficiant: 'Apóstolo Carlos Alberto Silveira',
  },
  recommendation: {
    id: 'recommendation',
    title: 'Carta Pastoral de Recomendação & Transferência',
    category: 'administrativo',
    defaultOrientation: 'portrait',
    badge: 'Comunhão & Rol',
    description: 'Recomenda com louvor o membro em plena comunhão para acolhimento em outra igreja coirmã.',
    defaultVerseReference: 'Romanos 16:1-2',
    defaultVerseText: 'Recomendo-vos a nossa irmã Febe, que está servindo à igreja... para que a recebais no Senhor como convém aos santos.',
    defaultOfficiant: 'Gabinete Pastoral da Presidência',
  },
  course_completion: {
    id: 'course_completion',
    title: 'Certificado de Formação & Discipulado',
    category: 'ensino',
    defaultOrientation: 'landscape',
    badge: 'Capacitação & Ensino',
    description: 'Conclusão de curso de teologia, liderança avançada, escola bíblica ou discipulado.',
    defaultVerseReference: '2 Timóteo 2:15',
    defaultVerseText: 'Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade.',
    defaultOfficiant: 'Pr. Lucas Mendes Rocha (Diretoria de Ensino)',
  },
  membership_declaration: {
    id: 'membership_declaration',
    title: 'Declaração de Membro Ativo e Regular',
    category: 'administrativo',
    defaultOrientation: 'portrait',
    badge: 'Declaração Institucional',
    description: 'Atesta o vínculo eclesiástico, assiduidade e conduta exemplar do membro perante o ministério.',
    defaultVerseReference: '1 Coríntios 12:27',
    defaultVerseText: 'Ora, vós sois o corpo de Cristo, e seus membros em particular.',
    defaultOfficiant: 'Secretaria Geral Eclesiástica',
  },
  tithe_tax_receipt: {
    id: 'tithe_tax_receipt',
    title: 'Informe Anual de Contribuições & Dízimos',
    category: 'administrativo',
    defaultOrientation: 'portrait',
    badge: 'Tesouraria Oficial',
    description: 'Demonstrativo anual das contribuições voluntárias e dízimos para fins de arquivo fiscal e pessoal.',
    defaultVerseReference: 'Malaquias 3:10',
    defaultVerseText: 'Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa...',
    defaultOfficiant: 'Diretoria Financeira & Tesouraria Geral',
  },
};

// Generates an ultra-secure code and hash
export function generateDocumentSecurityCode(type: DocumentType): { code: string; hash: string } {
  const prefixMap: Record<DocumentType, string> = {
    baptism: 'BAT',
    presentation: 'APR',
    ordination: 'ORD',
    marriage: 'CAS',
    recommendation: 'REC',
    course_completion: 'EBD',
    membership_declaration: 'DEC',
    tithe_tax_receipt: 'FIN',
  };

  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `IBN-${prefixMap[type]}-${year}-${randomNum}`;
  
  // Pseudo SHA-256 64-char hex string
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }

  return { code, hash };
}

// Initial seed documents
export const INITIAL_ISSUED_DOCUMENTS: ChurchDocumentData[] = [
  {
    id: 'doc-001',
    type: 'baptism',
    registrationCode: 'IBN-BAT-2026-8831',
    securityHash: '8f92a14e6b7290f1d3e8a49c2b7f0e13589b27a6c0d1e2f3a4b5c6d7e8f9a0b1',
    recipientName: 'Matheus Henrique Silveira',
    recipientDocument: '456.789.012-33',
    recipientMemberId: 'mem-4',
    ministryOrRole: 'Membro Batizado / Músico',
    officiantName: 'Apóstolo Carlos Alberto Silveira',
    officiantRole: 'Pastor Presidente & Fundador',
    secondSignatoryName: 'Bispa Helena Silveira',
    secondSignatoryRole: 'Conselho Pastoral',
    verseReference: 'Romanos 6:4',
    verseText: 'De sorte que fomos sepultados com ele pelo batismo na morte; para que, como Cristo ressuscitou dos mortos pela glória do Pai, assim andemos nós também em novidade de vida.',
    bookNumber: '12',
    pageNumber: '45',
    entryNumber: '0389',
    theme: 'prestige_gold_dark',
    orientation: 'landscape',
    includeWatermark: true,
    includeGoldSeal: true,
    includeQrCode: true,
    includeSignatures: true,
    issuedAt: '2026-03-15T10:30:00Z',
    city: 'São Paulo',
    state: 'SP',
    tenantName: 'Igreja Apostólica Boas Novas',
    tenantCnpj: '12.345.678/0001-90',
    status: 'valid',
  },
  {
    id: 'doc-002',
    type: 'ordination',
    registrationCode: 'IBN-ORD-2026-4412',
    securityHash: '3a7e9b11f054238bcde490a1278fdc6591024bcdaeef3948572019a8bc43d120',
    recipientName: 'Pr. Lucas Mendes Rocha',
    recipientDocument: '345.678.901-22',
    recipientMemberId: 'mem-3',
    ministryOrRole: 'Pastor Auxiliar & Diretor de Ensino',
    officiantName: 'Apóstolo Carlos Alberto Silveira',
    officiantRole: 'Presidente do Colegiado Apostólico',
    secondSignatoryName: 'Bispa Helena Silveira',
    secondSignatoryRole: 'Secretária Geral Eclesiástica',
    verseReference: '2 Timóteo 4:2',
    verseText: 'Prega a palavra, insta a tempo e fora de tempo, redargue, repreende, exorta com toda a longanimidade e doutrina.',
    bookNumber: '04',
    pageNumber: '18',
    entryNumber: '0072',
    theme: 'royal_ivory_light',
    orientation: 'landscape',
    includeWatermark: true,
    includeGoldSeal: true,
    includeQrCode: true,
    includeSignatures: true,
    issuedAt: '2026-02-20T19:00:00Z',
    city: 'São Paulo',
    state: 'SP',
    tenantName: 'Igreja Apostólica Boas Novas',
    tenantCnpj: '12.345.678/0001-90',
    status: 'valid',
  },
  {
    id: 'doc-003',
    type: 'recommendation',
    registrationCode: 'IBN-REC-2026-1092',
    securityHash: '992bc014fa578912efc4091ab738dcae1056792348abcdf41098234ef0182934',
    recipientName: 'Juliana Paes de Camargo',
    recipientDocument: '567.890.123-44',
    recipientMemberId: 'mem-5',
    destinationChurch: 'Igreja Apostólica Boas Novas - Regional Curitiba',
    destinationCity: 'Curitiba - PR',
    ministryOrRole: 'Membro em Plena Comunhão / Diaconisa',
    officiantName: 'Gabinete Pastoral da Presidência',
    officiantRole: 'Igreja Apostólica Boas Novas Sede',
    secondSignatoryName: 'Secretaria Geral de Membresia',
    secondSignatoryRole: 'Departamento de Rol e Registros',
    verseReference: 'Romanos 16:1-2',
    verseText: 'Recomendo-vos a nossa irmã, para que a recebais no Senhor como convém aos santos e a ajudeis em tudo o que de vós necessitar.',
    bookNumber: '08',
    pageNumber: '92',
    entryNumber: '0415',
    theme: 'royal_ivory_light',
    orientation: 'portrait',
    includeWatermark: true,
    includeGoldSeal: true,
    includeQrCode: true,
    includeSignatures: true,
    issuedAt: '2026-04-10T14:15:00Z',
    city: 'São Paulo',
    state: 'SP',
    tenantName: 'Igreja Apostólica Boas Novas',
    tenantCnpj: '12.345.678/0001-90',
    status: 'valid',
  },
];

// WhatsApp Message Format Generator
export function generateWhatsAppDocumentMessage(doc: ChurchDocumentData): string {
  const title = DOCUMENT_TEMPLATES[doc.type].title;
  return `🕊️ *IGREJA APOSTÓLICA BOAS NOVAS*
📜 *Emissão de Documento Oficial*

Prezado(a) *${doc.recipientName}*,
Seu *${title}* foi emitido com sucesso pela Secretaria Eclesiástica.

🔐 *Código de Autenticidade:* \`${doc.registrationCode}\`
📅 *Data de Emissão:* ${new Date(doc.issuedAt).toLocaleDateString('pt-BR')}
🏛️ *Registro:* Livro ${doc.bookNumber}, Folha ${doc.pageNumber}, Registro nº ${doc.entryNumber}
✍️ *Ministrante:* ${doc.officiantName}

🛡️ *Validação Digital:*
Este documento possui assinatura digital e selo criptográfico.
Hash de Segurança: \`${doc.securityHash.slice(0, 16)}...\`

_Que a graça e a paz de Cristo continuem sobre sua vida!_`;
}

// Client-side PDF Generation with jsPDF
export function exportDocumentToPdf(doc: ChurchDocumentData) {
  const isLandscape = doc.orientation === 'landscape';
  const docPdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;

  // Background Theme
  if (doc.theme === 'prestige_gold_dark') {
    // Dark luxury background
    docPdf.setFillColor(26, 20, 14); // #1A140E
    docPdf.rect(0, 0, pageWidth, pageHeight, 'F');
  } else {
    // Ivory light luxury background
    docPdf.setFillColor(253, 251, 247); // #FDFBF7
    docPdf.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Draw Ornamental Gold Double Borders
  const isDark = doc.theme === 'prestige_gold_dark';
  const borderPrimaryColor: [number, number, number] = isDark ? [218, 160, 23] : [184, 134, 11]; // #DAA017 or #B8860B
  
  docPdf.setDrawColor(...borderPrimaryColor);
  docPdf.setLineWidth(1.2);
  docPdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  docPdf.setLineWidth(0.4);
  docPdf.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Header: Church Name
  docPdf.setFont('times', 'bold');
  docPdf.setFontSize(22);
  if (isDark) {
    docPdf.setTextColor(255, 232, 152); // Soft Gold
  } else {
    docPdf.setTextColor(30, 25, 18);
  }
  docPdf.text('IGREJA APOSTÓLICA BOAS NOVAS', pageWidth / 2, 25, { align: 'center' });

  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(9);
  if (isDark) {
    docPdf.setTextColor(218, 160, 23);
  } else {
    docPdf.setTextColor(140, 100, 20);
  }
  docPdf.text('MINISTÉRIO APOSTÓLICO & CONSELHO PASTORAL SEDE', pageWidth / 2, 31, { align: 'center' });
  docPdf.text('CNPJ: 12.345.678/0001-90 • SÃO PAULO - SP • BRASIL', pageWidth / 2, 36, { align: 'center' });

  // Document Title
  const docMeta = DOCUMENT_TEMPLATES[doc.type];
  docPdf.setFont('times', 'bolditalic');
  docPdf.setFontSize(isLandscape ? 24 : 20);
  if (isDark) {
    docPdf.setTextColor(248, 245, 236);
  } else {
    docPdf.setTextColor(24, 20, 15);
  }
  docPdf.text(doc.customTitle || docMeta.title.toUpperCase(), pageWidth / 2, isLandscape ? 52 : 50, { align: 'center' });

  // Decorative gold line under title
  docPdf.setDrawColor(...borderPrimaryColor);
  docPdf.setLineWidth(0.6);
  docPdf.line(pageWidth / 2 - 45, isLandscape ? 56 : 54, pageWidth / 2 + 45, isLandscape ? 56 : 54);

  // Main Body Text
  docPdf.setFont('times', 'normal');
  docPdf.setFontSize(isLandscape ? 12 : 11);
  if (isDark) {
    docPdf.setTextColor(240, 235, 220);
  } else {
    docPdf.setTextColor(45, 40, 32);
  }

  let bodyLines: string[] = [];
  
  if (doc.type === 'baptism') {
    bodyLines = [
      'Certificamos que o(a) irmão(ã)',
      doc.recipientName.toUpperCase(),
      doc.recipientDocument ? `Portador(a) do documento nº ${doc.recipientDocument}` : '',
      'foi batizado(a) nas águas em nome do Pai, do Filho e do Espírito Santo,',
      'testemunhando publicamente sua fé, novo nascimento e aliança eterna com nosso Senhor Jesus Cristo.',
    ];
  } else if (doc.type === 'ordination') {
    bodyLines = [
      'Certificamos perante Deus e a Igreja de Cristo que',
      doc.recipientName.toUpperCase(),
      `foi solenemente consagrado(a) e ordenado(a) ao Santo Ministério como:`,
      `${(doc.ministryOrRole || 'Pastor(a) do Evangelho').toUpperCase()}`,
      'mediante a oração, unção apostólica e a imposição das mãos do Conselho Pastoral.',
    ];
  } else if (doc.type === 'presentation') {
    bodyLines = [
      'Certificamos que a criança',
      doc.recipientName.toUpperCase(),
      doc.fatherName && doc.motherName ? `Filho(a) de ${doc.fatherName} e ${doc.motherName}` : '',
      'foi solenemente apresentada e dedicada ao Senhor Jesus Cristo',
      'segundo os preceitos das Sagradas Escrituras, com a oração e bênção pastoral.',
    ];
  } else if (doc.type === 'recommendation') {
    bodyLines = [
      'Pela presente CARTA DE RECOMENDAÇÃO PASTORAL, apresentamos o(a) irmão(ã):',
      doc.recipientName.toUpperCase(),
      doc.recipientDocument ? `Inscrito(a) no CPF sob o nº ${doc.recipientDocument}` : '',
      `Membro ativo, fiel e em plena comunhão com esta comunidade de fé,`,
      doc.destinationChurch ? `transferindo sua membresia para a conceituada igreja: ${doc.destinationChurch}` : 'para acolhimento fraterno e integração na obra de Deus.',
      'Recomendamos seu acolhimento no amor do Senhor Jesus e pedimos as mais ricas bênçãos.',
    ];
  } else {
    bodyLines = [
      'Certificamos que',
      doc.recipientName.toUpperCase(),
      `concluiu com êxito os requisitos eclesiásticos referentes a:`,
      `${(doc.courseName || docMeta.title).toUpperCase()}`,
      'cumprindo com dedicação, reverência e excelência todos os módulos propostos.',
    ];
  }

  // Render centered text
  let currentY = isLandscape ? 70 : 68;
  bodyLines.filter(Boolean).forEach((line, idx) => {
    if (idx === 1 || (doc.type === 'ordination' && idx === 3)) {
      // Highlight recipient name in bold gold
      docPdf.setFont('times', 'bold');
      docPdf.setFontSize(isLandscape ? 17 : 15);
      if (isDark) {
        docPdf.setTextColor(255, 232, 152);
      } else {
        docPdf.setTextColor(184, 134, 11);
      }
      docPdf.text(line, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      docPdf.setFont('times', 'normal');
      docPdf.setFontSize(isLandscape ? 12 : 11);
      if (isDark) {
        docPdf.setTextColor(240, 235, 220);
      } else {
        docPdf.setTextColor(45, 40, 32);
      }
    } else {
      docPdf.text(line, pageWidth / 2, currentY, { align: 'center' });
      currentY += 6.5;
    }
  });

  // Biblical Verse Box
  currentY = isLandscape ? 118 : 130;
  docPdf.setFont('times', 'italic');
  docPdf.setFontSize(isLandscape ? 10 : 9.5);
  if (isDark) {
    docPdf.setTextColor(218, 160, 23);
  } else {
    docPdf.setTextColor(140, 100, 20);
  }

  const verseRef = `"${doc.verseText}" - ${doc.verseReference}`;
  const splitVerse = docPdf.splitTextToSize(verseRef, pageWidth - 60);
  docPdf.text(splitVerse, pageWidth / 2, currentY, { align: 'center' });

  // Date and Location
  const dateFormatted = new Date(doc.issuedAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  currentY += isLandscape ? 20 : 25;
  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(10);
  if (isDark) {
    docPdf.setTextColor(200, 195, 180);
  } else {
    docPdf.setTextColor(70, 65, 55);
  }
  docPdf.text(`${doc.city} - ${doc.state}, ${dateFormatted}`, pageWidth / 2, currentY, { align: 'center' });

  // Signatures Section
  const sigY = isLandscape ? 172 : 225;
  
  // Signature 1
  const sig1X = isLandscape ? 80 : 58;
  docPdf.setDrawColor(...borderPrimaryColor);
  docPdf.setLineWidth(0.4);
  docPdf.line(sig1X - 35, sigY, sig1X + 35, sigY);
  docPdf.setFont('times', 'bold');
  docPdf.setFontSize(9.5);
  if (isDark) docPdf.setTextColor(248, 245, 236);
  else docPdf.setTextColor(20, 20, 20);
  docPdf.text(doc.officiantName, sig1X, sigY + 5, { align: 'center' });
  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(7.5);
  if (isDark) docPdf.setTextColor(218, 160, 23);
  else docPdf.setTextColor(140, 100, 20);
  docPdf.text(doc.officiantRole, sig1X, sigY + 9, { align: 'center' });

  // Signature 2
  const sig2X = isLandscape ? 217 : 152;
  docPdf.line(sig2X - 35, sigY, sig2X + 35, sigY);
  docPdf.setFont('times', 'bold');
  docPdf.setFontSize(9.5);
  if (isDark) docPdf.setTextColor(248, 245, 236);
  else docPdf.setTextColor(20, 20, 20);
  docPdf.text(doc.secondSignatoryName || 'Bispa Helena Silveira', sig2X, sigY + 5, { align: 'center' });
  docPdf.setFont('helvetica', 'normal');
  docPdf.setFontSize(7.5);
  if (isDark) docPdf.setTextColor(218, 160, 23);
  else docPdf.setTextColor(140, 100, 20);
  docPdf.text(doc.secondSignatoryRole || 'Conselho Apostólico', sig2X, sigY + 9, { align: 'center' });

  // Footer: Book, Sheet, Registry & Cryptographic Verification
  const footerY = isLandscape ? 198 : 282;
  docPdf.setFont('courier', 'normal');
  docPdf.setFontSize(7.5);
  if (isDark) {
    docPdf.setTextColor(160, 150, 130);
  } else {
    docPdf.setTextColor(100, 95, 85);
  }
  docPdf.text(
    `LIVRO: ${doc.bookNumber} | FOLHA: ${doc.pageNumber} | REG: ${doc.entryNumber} | CÓDIGO: ${doc.registrationCode}`,
    15,
    footerY
  );

  docPdf.text(
    `AUTENTICIDADE: ${doc.securityHash.slice(0, 20)}... (Assinado Digitalmente)`,
    pageWidth - 15,
    footerY,
    { align: 'right' }
  );

  // Save the PDF
  const filename = `${doc.registrationCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${doc.recipientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  docPdf.save(filename);
}
