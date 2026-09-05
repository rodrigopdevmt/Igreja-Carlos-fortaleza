/**
 * Dados oficiais da IABN extraídos dos documentos institucionais:
 * - Programaçao Mensal da IABN - Agosto/2026 (.docx)
 * - Escala de Serviço Religioso do Templo Agosto/2026 (.pptx)
 * - Temas Mensais de 2026 (.pptx)
 * - AVISOS IABN (.pptx)
 */

// =============================================================================
// TEMA CENTRAL DO ANO 2026
// =============================================================================
export const YEAR_THEME = {
  title: 'Enraizados em Cristo, frutificando para a glória de Deus',
  reference: 'Colossenses 2:6,7',
  verse:
    '"Portanto, como vocês receberam Cristo Jesus, o Senhor, continuem a viver nele, enraizados e edificados nele, firmados na fé, como foram ensinados, transbordando de gratidão."',
};

// =============================================================================
// TEMAS MENSAIS DE 2026
// =============================================================================
export interface MonthlyTheme {
  month: string;
  title: string;
  reference: string;
}

export const MONTHLY_THEMES_2026: MonthlyTheme[] = [
  { month: 'Janeiro', title: 'Firmados no Santo Evangelho!', reference: '1 Coríntios 16:13' },
  { month: 'Fevereiro', title: 'Enraizados na Palavra!', reference: 'Salmos 1:1,2' },
  { month: 'Março', title: 'Uma igreja que ora!', reference: 'Jeremias 29:13' },
  { month: 'Abril', title: 'Crescendo em santidade!', reference: 'Hebreus 12:14' },
  { month: 'Maio', title: 'Vida plena no corpo de Cristo!', reference: 'Colossenses 2:9-10' },
  { month: 'Junho', title: 'Chamado para servir!', reference: 'João 12:26' },
  { month: 'Julho', title: 'Frutificando no Espírito!', reference: 'Gálatas 5:22,23' },
  { month: 'Agosto', title: 'Famílias enraizadas!', reference: 'Salmos 127:1' },
  { month: 'Setembro', title: 'Santidade e poder!', reference: '1 Pedro 1:15,16' },
  { month: 'Outubro', title: 'Vivendo a Fé Reformada!', reference: 'Romanos 1:17' },
  { month: 'Novembro', title: 'Gratidão e Generosidade!', reference: '2 Coríntios 9:11' },
  { month: 'Dezembro', title: 'O Maravilhoso Advento!', reference: 'Isaías 9:6' },
];

// =============================================================================
// PROGRAMAÇÃO MENSAL - AGOSTO/2026
// =============================================================================
export interface MonthlyEvent {
  day: number;
  dayLabel: string;
  event: string;
  time?: string;
  type: 'culto' | 'reuniao' | 'oracao' | 'ensino' | 'livre' | 'especial';
}

export const MONTHLY_PROGRAM_AGOSTO: MonthlyEvent[] = [
  { day: 1, dayLabel: 'Sábado', event: 'LIVRE', type: 'livre' },
  { day: 2, dayLabel: 'Domingo', event: 'Culto da Família', time: '18h30', type: 'culto' },
  { day: 3, dayLabel: 'Segunda-feira', event: 'LIVRE', type: 'livre' },
  { day: 4, dayLabel: 'Terça-feira', event: 'PG\'s Conexão', time: '19h30', type: 'reuniao' },
  { day: 5, dayLabel: 'Quarta-feira', event: 'Sala de Oração e Escola Bíblica', time: '19h30', type: 'oracao' },
  { day: 6, dayLabel: 'Quinta-feira', event: 'Reunião Diretoria Administrativa', time: '19h30', type: 'reuniao' },
  { day: 7, dayLabel: 'Sexta-feira', event: 'LIVRE', type: 'livre' },
  { day: 8, dayLabel: 'Sábado', event: 'Imersão', time: '19h30', type: 'especial' },
  { day: 9, dayLabel: 'Domingo', event: 'Culto de Santa Ceia', time: '18h30', type: 'culto' },
  { day: 10, dayLabel: 'Segunda-feira', event: 'LIVRE', type: 'livre' },
  { day: 11, dayLabel: 'Terça-feira', event: 'PG\'s Conexão', time: '19h30', type: 'reuniao' },
  { day: 12, dayLabel: 'Quarta-feira', event: 'Sala de Oração e Escola Bíblica', time: '19h30', type: 'oracao' },
  { day: 13, dayLabel: 'Quinta-feira', event: 'LIVRE', type: 'livre' },
  { day: 14, dayLabel: 'Sexta-feira', event: 'LIVRE', type: 'livre' },
  { day: 15, dayLabel: 'Sábado', event: 'LIVRE', type: 'livre' },
  { day: 16, dayLabel: 'Domingo', event: 'SEMANA DE ORAÇÃO E JEJUM EM FAVOR DO ALCANCE DE VIDAS! \nCulto de CELEBRAÇÃO', time: '09h00', type: 'especial' },
  { day: 17, dayLabel: 'Segunda-feira', event: 'SEMANA DE ORAÇÃO E JEJUM', type: 'especial' },
  { day: 18, dayLabel: 'Terça-feira', event: 'PG\'s Conexão', time: '19h30', type: 'reuniao' },
  { day: 19, dayLabel: 'Quarta-feira', event: 'Sala de Oração e Escola Bíblica', time: '19h30', type: 'oracao' },
  { day: 20, dayLabel: 'Quinta-feira', event: 'SEMANA DE ORAÇÃO E JEJUM', type: 'especial' },
  { day: 21, dayLabel: 'Sexta-feira', event: 'SEMANA DE ORAÇÃO E JEJUM', type: 'especial' },
  { day: 22, dayLabel: 'Sábado', event: '12 horas de Oração', type: 'especial' },
  { day: 23, dayLabel: 'Domingo', event: 'Culto de CELEBRAÇÃO', time: '18h30', type: 'culto' },
  { day: 24, dayLabel: 'Segunda-feira', event: 'LIVRE', type: 'livre' },
  { day: 25, dayLabel: 'Terça-feira', event: 'GRUPÃO CONEXÃO', time: '19h30', type: 'reuniao' },
  { day: 26, dayLabel: 'Quarta-feira', event: 'Sala de Oração e Escola Bíblica', time: '19h30', type: 'oracao' },
  { day: 27, dayLabel: 'Quinta-feira', event: 'LIVRE', type: 'livre' },
  { day: 28, dayLabel: 'Sexta-feira', event: 'LIVRE', type: 'livre' },
  { day: 29, dayLabel: 'Sábado', event: 'LIVRE', type: 'livre' },
  { day: 30, dayLabel: 'Domingo', event: 'Culto de MISSÕES', time: '18h30', type: 'culto' },
  { day: 31, dayLabel: 'Segunda-feira', event: 'LIVRE', type: 'livre' },
];

// =============================================================================
// ESCALA DE SERVIÇO RELIGIOSO DO TEMPLO - AGOSTO/2026
// =============================================================================
export interface ServiceScale {
  date: string;
  service: string;
  leader: string;
  preacher: string;
  reception: string;
  doorman: string;
}

export const SERVICE_SCALE_AGOSTO: ServiceScale[] = [
  { date: '02/08', service: 'Culto da Família', leader: 'Pr. William', preacher: 'Pr. Demontieux', reception: 'Dalila', doorman: 'Marquinhos' },
  { date: '05/08', service: 'Culto de Oração e Escola Bíblica', leader: 'Fernanda', preacher: 'Dc. Regys', reception: 'Pietro', doorman: 'Júnior' },
  { date: '09/08', service: 'Celebração da Ceia do Senhor', leader: 'Pra. Mônica', preacher: 'Pr. Demontieux', reception: 'Darliany', doorman: 'Daniel' },
  { date: '12/08', service: 'Culto de Oração e Escola Bíblica', leader: 'Dc. Ednei', preacher: 'Dc. Regys', reception: 'Eduardo', doorman: 'Danilo' },
  { date: '16/08', service: 'Culto de Celebração', leader: 'Pr. William', preacher: 'Pr. Demontieux', reception: 'Fernanda', doorman: 'Júnior' },
  { date: '19/08', service: 'Culto de Oração e Escola Bíblica', leader: 'Neire', preacher: 'Dc. Regys', reception: 'Enoc', doorman: 'Enoc' },
  { date: '23/08', service: 'Culto de Celebração', leader: 'Pr. William', preacher: 'Pra. Mônica', reception: 'Pâmela', doorman: 'Daniel' },
  { date: '26/08', service: 'Culto de Oração e Escola Bíblica', leader: 'Danilo', preacher: 'Dc. Regys', reception: 'Zé Carlos', doorman: 'Danilo' },
  { date: '30/08', service: 'Culto de Missões', leader: 'Dca. Lorena', preacher: 'Missionários Erasmo & Salete', reception: 'Pr. William', doorman: 'Marquinhos' },
];

// =============================================================================
// AVISOS IABN
// =============================================================================
export interface ChurchAnnouncement {
  day: string;
  time: string;
  title: string;
}

export const CHURCH_ANNOUNCEMENTS: ChurchAnnouncement[] = [
  { day: 'Terça-feira', time: '19h30', title: 'PG\'s Conexão' },
  { day: 'Quarta-feira', time: '19h30', title: 'Sala de Oração' },
  { day: 'Quarta-feira', time: '19h50', title: 'Escola Bíblica' },
  { day: 'Quarta-feira', time: '20h50', title: 'Ensaio do Louvor' },
  { day: 'Domingo', time: '09h30', title: 'Culto de Celebração (primeiro do mês)' },
  { day: 'Domingo', time: '18h30', title: 'Culto de Celebração' },
];