import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AppRole,
  MemberStatus,
  CredentialStatus,
  TransactionType,
  EventType,
  CameraStatus,
  Database
} from '@/integrations/supabase/types';
import {
  insertLiveChatMessageToDb,
  togglePinLiveChatMessageInDb,
  deleteLiveChatMessageInDb,
} from '@/services/liveChatService';

export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type Person = Database['public']['Tables']['people']['Row'];
export type Credential = Database['public']['Tables']['credentials']['Row'];
export type Donation = Database['public']['Tables']['donations']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Camera = Database['public']['Tables']['cameras']['Row'];
export type LiveStream = Database['public']['Tables']['lives']['Row'];
export type LiveChatMessage = Database['public']['Tables']['live_chat_messages']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type SundaySchoolClass = Database['public']['Tables']['classes']['Row'];
export type AuditLog = Database['public']['Tables']['audit_log']['Row'];

interface ChurchContextType {
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  updateChurchProfile: (updates: Partial<Tenant>) => void;
  
  currentRole: AppRole;
  switchRole: (role: AppRole) => void;
  hasRole: (allowedRoles: AppRole[]) => boolean;

  // People & Members
  members: Person[];
  addMember: (member: Omit<Person, 'id' | 'created_at' | 'tenant_id'>) => void;
  updateMember: (id: string, updates: Partial<Person>) => void;
  deleteMember: (id: string) => void;

  // Credentials
  credentials: Credential[];
  issueCredential: (personId: string, templateId?: string) => Credential;
  revokeCredential: (credentialId: string) => void;
  validateQrCode: (code: string) => { valid: boolean; member?: Person; credential?: Credential; message: string };

  // Finance
  donations: Donation[];
  transactions: Transaction[];
  addDonation: (donation: Omit<Donation, 'id' | 'tenant_id' | 'receipt_number'>) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'tenant_id'>) => void;
  financialMetrics: {
    totalTithes: number;
    totalOfferings: number;
    totalMissions: number;
    totalExpenses: number;
    netBalance: number;
  };

  // Events & Check-in
  events: Event[];
  recordAttendance: (eventId: string, personId: string, method: 'qr_code' | 'manual' | 'face') => void;
  recentAttendance: { personName: string; eventName: string; time: string; method: string }[];

  // Security Cameras
  cameras: Camera[];
  toggleCameraRecording: (cameraId: string) => void;
  triggerCameraAlert: (cameraId: string) => void;

  // Live Stream, Chat & Member Access Permissions
  liveStream: LiveStream;
  liveChatMessages: LiveChatMessage[];
  sendLiveChatMessage: (message: string, isPrayerRequest?: boolean, senderName?: string) => Promise<LiveChatMessage>;
  togglePinMessage: (messageId: string) => void;
  deleteLiveChatMessage: (messageId: string) => void;
  toggleMemberLiveAccess: (personId: string, granted?: boolean) => void;
  grantAllMembersLiveAccess: (granted: boolean) => void;
  checkMemberLiveAccess: (identifier: string) => { granted: boolean; member?: Person; message: string };
  activeViewerMember: Person | null;
  setActiveViewerMember: (member: Person | null) => void;

  // Groups & Sunday School
  groups: Group[];
  classes: SundaySchoolClass[];

  // Global Metrics
  stats: {
    totalMembers: number;
    activeCredentials: number;
    monthlyTithes: number;
    activeEventsCount: number;
    onlineViewers: number;
    activeCellsCount: number;
  };

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entity: string, details: string) => void;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

const initialTenants: Tenant[] = [
  {
    id: 'tenant-sede',
    name: 'Igreja Apostólica Boas Novas',
    slug: 'boas-novas',
    logo_url: null,
    city: 'São Paulo',
    state: 'SP',
    pastor_name: 'Apóstolo Carlos Alberto & Bispa Helena',
    created_at: '2020-01-01T00:00:00Z',
    status: 'active',
  },
];

const initialMembers: Person[] = [
  {
    id: 'mem-1',
    tenant_id: 'tenant-sede',
    full_name: 'Ap. Carlos Alberto Silveira',
    email: 'carlos.alberto@boasnovas.org.br',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
    birth_date: '1968-04-12',
    baptism_date: '1984-11-20',
    marital_status: 'Casado(a)',
    gender: 'Masculino',
    address: 'Av. Paulista, 1500 - Bela Vista, SP',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    ministry: 'Ministério Pastoral & Conselho Apostólico',
    notes: 'Pastor Presidente e fundador',
    can_access_lives: true,
    live_access_tier: 'ministerial',
    created_at: '2020-01-01T10:00:00Z',
  },
  {
    id: 'mem-2',
    tenant_id: 'tenant-sede',
    full_name: 'Bispa Helena Silveira',
    email: 'helena.silveira@boasnovas.org.br',
    phone: '(11) 98765-4322',
    document: '234.567.890-11',
    birth_date: '1970-08-25',
    baptism_date: '1988-05-14',
    marital_status: 'Casado(a)',
    gender: 'Feminino',
    address: 'Av. Paulista, 1500 - Bela Vista, SP',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    ministry: 'Rede de Mulheres & Ação Social',
    notes: 'Líder do ministério de intercessão e assistência às famílias',
    can_access_lives: true,
    live_access_tier: 'ministerial',
    created_at: '2020-01-01T10:00:00Z',
  },
  {
    id: 'mem-3',
    tenant_id: 'tenant-sede',
    full_name: 'Pr. Lucas Mendes Rocha',
    email: 'lucas.mendes@boasnovas.org.br',
    phone: '(11) 97654-3210',
    document: '345.678.901-22',
    birth_date: '1985-02-14',
    baptism_date: '2001-09-10',
    marital_status: 'Casado(a)',
    gender: 'Masculino',
    address: 'Rua Vergueiro, 890 - Paraíso, SP',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    ministry: 'Pastor Adjunto & Ensino Bíblico',
    notes: 'Coordenador da Escola Dominical e Discipulado',
    can_access_lives: true,
    live_access_tier: 'ministerial',
    created_at: '2020-02-15T14:30:00Z',
  },
  {
    id: 'mem-4',
    tenant_id: 'tenant-sede',
    full_name: 'Débora Cristina Santos',
    email: 'debora.santos@gmail.com',
    phone: '(11) 96543-2109',
    document: '456.789.012-33',
    birth_date: '1992-10-30',
    baptism_date: '2010-06-25',
    marital_status: 'Casado(a)',
    gender: 'Feminino',
    address: 'Rua Domingos de Morais, 432 - Vila Mariana, SP',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    ministry: 'Ministério de Louvor & Adoração',
    notes: 'Líder do ministério de louvor e solista',
    can_access_lives: true,
    live_access_tier: 'standard',
    created_at: '2020-03-01T11:00:00Z',
  },
  {
    id: 'mem-5',
    tenant_id: 'tenant-sede',
    full_name: 'Gabriel Ribeiro Farias',
    email: 'gabriel.ribeiro@outlook.com',
    phone: '(11) 95432-1098',
    document: '567.890.123-44',
    birth_date: '1996-05-18',
    baptism_date: '2014-12-14',
    marital_status: 'Solteiro(a)',
    gender: 'Masculino',
    address: 'Rua Augusta, 1200 - Consolação, SP',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    ministry: 'Mídia, Telão & Transmissão Ao Vivo',
    notes: 'Diretor técnico das transmissões online',
    can_access_lives: true,
    live_access_tier: 'ministerial',
    created_at: '2020-04-10T16:00:00Z',
  },
  {
    id: 'mem-6',
    tenant_id: 'tenant-sede',
    full_name: 'Diácono Paulo Henrique Ramos',
    email: 'paulo.ramos@gmail.com',
    phone: '(11) 94321-0987',
    document: '678.901.234-55',
    birth_date: '1978-11-03',
    baptism_date: '1998-04-12',
    marital_status: 'Casado(a)',
    gender: 'Masculino',
    address: 'Alameda Santos, 789 - Cerqueira César, SP',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    ministry: 'Diaconato & Recepção de Visitantes',
    notes: 'Responsável pelo acolhimento e logística dos cultos',
    can_access_lives: true,
    live_access_tier: 'standard',
    created_at: '2020-05-20T09:00:00Z',
  },
  {
    id: 'mem-7',
    tenant_id: 'tenant-sede',
    full_name: 'Mariana Azevedo Costa',
    email: 'mariana.costa@gmail.com',
    phone: '(11) 93210-9876',
    document: '789.012.345-66',
    birth_date: '1994-07-19',
    baptism_date: '2012-08-19',
    marital_status: 'Casado(a)',
    gender: 'Feminino',
    address: 'Rua Pamplona, 340 - Jardim Paulista, SP',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    ministry: 'Rede de Jovens (Geração Boas Novas)',
    notes: 'Líder da Célula Radicais da Graça',
    can_access_lives: true,
    live_access_tier: 'standard',
    created_at: '2021-01-15T10:30:00Z',
  },
  {
    id: 'mem-8',
    tenant_id: 'tenant-sede',
    full_name: 'Matheus Guimarães Lima',
    email: 'matheus.lima@hotmail.com',
    phone: '(11) 92109-8765',
    document: '890.123.456-77',
    birth_date: '1998-09-08',
    baptism_date: '2016-10-02',
    marital_status: 'Solteiro(a)',
    gender: 'Masculino',
    address: 'Rua Haddock Lobo, 912 - Cerqueira César, SP',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    ministry: 'Segurança & Monitoramento Portaria',
    notes: 'Obreiro responsável pelo controle de acessos',
    can_access_lives: false,
    live_access_tier: 'blocked',
    created_at: '2021-03-22T14:15:00Z',
  },
  {
    id: 'mem-9',
    tenant_id: 'tenant-sede',
    full_name: 'Ester Ferreira Prado',
    email: 'ester.prado@gmail.com',
    phone: '(11) 91098-7654',
    document: '901.234.567-88',
    birth_date: '1989-03-11',
    baptism_date: '2008-07-27',
    marital_status: 'Casado(a)',
    gender: 'Feminino',
    address: 'Rua Bela Cintra, 650 - Consolação, SP',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    ministry: 'Ministério Infantil (Boas Novas Kids)',
    notes: 'Coordenadora pedagógica das classes infantis',
    can_access_lives: true,
    live_access_tier: 'standard',
    created_at: '2021-05-18T11:45:00Z',
  },
  {
    id: 'mem-10',
    tenant_id: 'tenant-sede',
    full_name: 'Ricardo Oliveira Neves',
    email: 'ricardo.neves@gmail.com',
    phone: '(11) 90987-6543',
    document: '012.345.678-99',
    birth_date: '1982-12-05',
    baptism_date: '2004-03-15',
    marital_status: 'Casado(a)',
    gender: 'Masculino',
    address: 'Rua Frei Caneca, 410 - Bela Vista, SP',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    ministry: 'Tesouraria & Finanças',
    notes: 'Contador e gestor de auditoria interna',
    can_access_lives: false,
    live_access_tier: 'blocked',
    created_at: '2021-08-04T08:30:00Z',
  },
];

const initialCredentials: Credential[] = [
  {
    id: 'cred-1',
    tenant_id: 'tenant-sede',
    person_id: 'mem-1',
    person_name: 'Ap. Carlos Alberto Silveira',
    person_role: 'Apóstolo Presidente',
    code: 'BN-2024-0001',
    qr_hash: 'BN:AUTH:0001:APOSTOLO:CARLOS-ALBERTO',
    status: 'active',
    issued_at: '2024-01-01T00:00:00Z',
    expires_at: '2027-12-31T23:59:59Z',
    template_id: 'tpl-apostolico',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cred-2',
    tenant_id: 'tenant-sede',
    person_id: 'mem-2',
    person_name: 'Bispa Helena Silveira',
    person_role: 'Bispa / Conselho Apostólico',
    code: 'BN-2024-0002',
    qr_hash: 'BN:AUTH:0002:BISPA:HELENA-SILVEIRA',
    status: 'active',
    issued_at: '2024-01-01T00:00:00Z',
    expires_at: '2027-12-31T23:59:59Z',
    template_id: 'tpl-apostolico',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cred-3',
    tenant_id: 'tenant-sede',
    person_id: 'mem-3',
    person_name: 'Pr. Lucas Mendes Rocha',
    person_role: 'Pastor Adjunto',
    code: 'BN-2024-0015',
    qr_hash: 'BN:AUTH:0015:PASTOR:LUCAS-MENDES',
    status: 'active',
    issued_at: '2024-01-10T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    template_id: 'tpl-pastoral',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cred-4',
    tenant_id: 'tenant-sede',
    person_id: 'mem-4',
    person_name: 'Débora Cristina Santos',
    person_role: 'Ministério de Louvor',
    code: 'BN-2024-0142',
    qr_hash: 'BN:AUTH:0142:LOUVOR:DEBORA-SANTOS',
    status: 'active',
    issued_at: '2024-02-01T00:00:00Z',
    expires_at: '2025-12-31T23:59:59Z',
    template_id: 'tpl-ministerial',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cred-5',
    tenant_id: 'tenant-sede',
    person_id: 'mem-5',
    person_name: 'Gabriel Ribeiro Farias',
    person_role: 'Equipe de Mídia',
    code: 'BN-2024-0189',
    qr_hash: 'BN:AUTH:0189:MIDIA:GABRIEL-FARIAS',
    status: 'active',
    issued_at: '2024-02-15T00:00:00Z',
    expires_at: '2025-12-31T23:59:59Z',
    template_id: 'tpl-ministerial',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cred-6',
    tenant_id: 'tenant-sede',
    person_id: 'mem-6',
    person_name: 'Paulo Henrique Ramos',
    person_role: 'Corpo Diaconal',
    code: 'BN-2024-0220',
    qr_hash: 'BN:AUTH:0220:DIACONATO:PAULO-RAMOS',
    status: 'active',
    issued_at: '2024-03-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    template_id: 'tpl-diaconal',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'cred-7',
    tenant_id: 'tenant-sede',
    person_id: 'mem-7',
    person_name: 'Mariana Azevedo Costa',
    person_role: 'Líder de Célula',
    code: 'BN-2024-0305',
    qr_hash: 'BN:AUTH:0305:LIDER:MARIANA-COSTA',
    status: 'active',
    issued_at: '2024-03-10T00:00:00Z',
    expires_at: '2025-12-31T23:59:59Z',
    template_id: 'tpl-membro',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
];

const initialDonations: Donation[] = [
  {
    id: 'don-1',
    tenant_id: 'tenant-sede',
    person_id: 'mem-10',
    person_name: 'Ricardo Oliveira Neves',
    amount: 3500.0,
    type: 'tithe',
    payment_method: 'pix',
    date: '2026-08-25T19:30:00Z',
    receipt_number: 'REC-2026-0825-01',
    notes: 'Dízimo mensal via PIX Chave CNPJ',
  },
  {
    id: 'don-2',
    tenant_id: 'tenant-sede',
    person_id: 'mem-4',
    person_name: 'Débora Cristina Santos',
    amount: 1200.0,
    type: 'tithe',
    payment_method: 'pix',
    date: '2026-08-24T20:15:00Z',
    receipt_number: 'REC-2026-0824-02',
    notes: 'Dízimo familiar',
  },
  {
    id: 'don-3',
    tenant_id: 'tenant-sede',
    person_id: null,
    person_name: 'Culto de Domingo - Ofertas Altar',
    amount: 14850.0,
    type: 'offering',
    payment_method: 'cash',
    date: '2026-08-24T21:00:00Z',
    receipt_number: 'REC-2026-0824-03',
    notes: 'Coleta geral de ofertas do Culto da Família',
  },
  {
    id: 'don-4',
    tenant_id: 'tenant-sede',
    person_id: 'mem-6',
    person_name: 'Paulo Henrique Ramos',
    amount: 2500.0,
    type: 'building_campaign',
    payment_method: 'credit_card',
    date: '2026-08-22T15:40:00Z',
    receipt_number: 'REC-2026-0822-04',
    notes: 'Campanha de Expansão do Templo Sede',
  },
  {
    id: 'don-5',
    tenant_id: 'tenant-sede',
    person_id: 'mem-7',
    person_name: 'Mariana Azevedo Costa',
    amount: 850.0,
    type: 'missions',
    payment_method: 'pix',
    date: '2026-08-20T11:20:00Z',
    receipt_number: 'REC-2026-0820-05',
    notes: 'Oferta missionária para Base Europa (Lisboa)',
  },
  {
    id: 'don-6',
    tenant_id: 'tenant-sede',
    person_id: null,
    person_name: 'Dízimos Anônimos e PIX Diretos',
    amount: 22990.0,
    type: 'tithe',
    payment_method: 'pix',
    date: '2026-08-15T18:00:00Z',
    receipt_number: 'REC-2026-0815-06',
    notes: 'Total de dízimos processados na primeira quinzena',
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    tenant_id: 'tenant-sede',
    type: 'income',
    category: 'Dízimos & Ofertas',
    description: 'Entrada consolidada de dízimos e ofertas semanais',
    amount: 45890.0,
    date: '2026-08-25T20:00:00Z',
    status: 'completed',
    payment_method: 'PIX / Depósito',
  },
  {
    id: 'tx-2',
    tenant_id: 'tenant-sede',
    type: 'expense',
    category: 'Manutenção do Templo',
    description: 'Manutenção preventiva ar-condicionado central e gerador',
    amount: 4200.0,
    date: '2026-08-23T14:00:00Z',
    status: 'completed',
    payment_method: 'Transferência Bancária',
  },
  {
    id: 'tx-3',
    tenant_id: 'tenant-sede',
    type: 'expense',
    category: 'Missões & Ação Social',
    description: 'Envio de mantimentos e cestas básicas Comunidade Norte',
    amount: 6800.0,
    date: '2026-08-21T10:30:00Z',
    status: 'completed',
    payment_method: 'PIX',
  },
  {
    id: 'tx-4',
    tenant_id: 'tenant-sede',
    type: 'expense',
    category: 'Mídia & Streaming',
    description: 'Assinatura servidores CDN 4K e links dedicados de fibra',
    amount: 1850.0,
    date: '2026-08-18T09:00:00Z',
    status: 'completed',
    payment_method: 'Cartão Corporativo',
  },
  {
    id: 'tx-5',
    tenant_id: 'tenant-sede',
    type: 'income',
    category: 'Campanha Templo',
    description: 'Doações direcionadas para aquisição de novos painéis LED',
    amount: 12500.0,
    date: '2026-08-15T17:00:00Z',
    status: 'completed',
    payment_method: 'PIX',
  },
];

const initialEvents: Event[] = [
  {
    id: 'evt-1',
    tenant_id: 'tenant-sede',
    title: 'Grande Culto da Família & Santa Ceia Apostólica',
    description: 'Celebração com palavra apostólica, louvor orquestrado e comunhão.',
    event_type: 'culto',
    start_time: '2026-08-30T18:30:00Z',
    end_time: '2026-08-30T21:00:00Z',
    location: 'Nave Principal - Templo Sede',
    banner_url: 'https://images.unsplash.com/photo-1510525004068-0dd80b2c8a0b?w=800&auto=format&fit=crop&q=80',
    expected_attendance: 1400,
  },
  {
    id: 'evt-2',
    tenant_id: 'tenant-sede',
    title: 'Quarta do Avivamento & Doutrina Bíblica',
    description: 'Estudo aprofundado do Livro de Atos e ministração de dons espirituais.',
    event_type: 'culto',
    start_time: '2026-09-02T19:45:00Z',
    end_time: '2026-09-02T21:30:00Z',
    location: 'Nave Principal - Templo Sede',
    banner_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    expected_attendance: 850,
  },
  {
    id: 'evt-3',
    tenant_id: 'tenant-sede',
    title: 'Vigília Apostólica: Noite dos Escolhidos',
    description: 'Intercessão contínua pelas nações, famílias e quebra de cadeias.',
    event_type: 'vigilia',
    start_time: '2026-09-05T23:00:00Z',
    end_time: '2026-09-06T05:00:00Z',
    location: 'Nave Principal & Transmissão Internacional',
    banner_url: 'https://images.unsplash.com/photo-1545232979-fbf6c547fbba?w=800&auto=format&fit=crop&q=80',
    expected_attendance: 1100,
  },
  {
    id: 'evt-4',
    tenant_id: 'tenant-sede',
    title: 'Batismo nas Águas & Consagração de Obreiros',
    description: 'Testemunho público de fé e unção de novos servos da casa.',
    event_type: 'batismo',
    start_time: '2026-09-13T09:00:00Z',
    end_time: '2026-09-13T12:00:00Z',
    location: 'Tanque Batismal & Pátio Central',
    banner_url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80',
    expected_attendance: 600,
  },
];

const initialCameras: Camera[] = [
  {
    id: 'cam-1',
    tenant_id: 'tenant-sede',
    name: 'CAM 01 - Nave Principal & Platéia',
    location: 'Fundo da Nave / Visão Panorâmica',
    stream_url: 'https://stream.boasnovas.org.br/cam1',
    snapshot_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    resolution: '4K UltraHD (3840x2160)',
    ptz_enabled: true,
    fps: 60,
  },
  {
    id: 'cam-2',
    tenant_id: 'tenant-sede',
    name: 'CAM 02 - Altar Apostólico & Púlpito',
    location: 'Púlpito Central',
    stream_url: 'https://stream.boasnovas.org.br/cam2',
    snapshot_url: 'https://images.unsplash.com/photo-1510525004068-0dd80b2c8a0b?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    resolution: '4K UltraHD 60fps',
    ptz_enabled: true,
    fps: 60,
  },
  {
    id: 'cam-3',
    tenant_id: 'tenant-sede',
    name: 'CAM 03 - Hall de Entrada & Credenciamento',
    location: 'Foyer Principal',
    stream_url: 'https://stream.boasnovas.org.br/cam3',
    snapshot_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    resolution: '1080p Full HD',
    ptz_enabled: false,
    fps: 30,
  },
  {
    id: 'cam-4',
    tenant_id: 'tenant-sede',
    name: 'CAM 04 - Estacionamento VIP & Acesso Norte',
    location: 'Área Externa Portaria',
    stream_url: 'https://stream.boasnovas.org.br/cam4',
    snapshot_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    resolution: '1080p NightVision AI',
    ptz_enabled: true,
    fps: 30,
  },
  {
    id: 'cam-5',
    tenant_id: 'tenant-sede',
    name: 'CAM 05 - Espaço Kids & Berçário',
    location: 'Ala Educacional Infantil',
    stream_url: 'https://stream.boasnovas.org.br/cam5',
    snapshot_url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80',
    status: 'recording',
    resolution: '1080p Full HD',
    ptz_enabled: false,
    fps: 30,
  },
  {
    id: 'cam-6',
    tenant_id: 'tenant-sede',
    name: 'CAM 06 - Galeria Superior & Mezanino',
    location: '2º Pavimento Nave',
    stream_url: 'https://stream.boasnovas.org.br/cam6',
    snapshot_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    status: 'online',
    resolution: '2K QuadHD',
    ptz_enabled: true,
    fps: 30,
  },
];

const initialLiveStream: LiveStream = {
  id: 'live-current',
  tenant_id: 'tenant-sede',
  title: 'Transmissão Ao Vivo: Culto de Celebração Apostólica & Milagres',
  stream_url: 'https://youtube.com/live/demo-boasnovas',
  platform: 'custom',
  status: 'live',
  viewers_count: 1482,
  started_at: '2026-08-28T19:00:00Z',
  preacher: 'Apóstolo Carlos Alberto Silveira',
};

const initialChatMessages: LiveChatMessage[] = [
  {
    id: 'msg-1',
    tenant_id: 'tenant-sede',
    live_id: 'live-current',
    sender_name: 'Pr. Marcos Vinicius (Congr. Norte)',
    message: 'Igreja reunida e conectada da Zona Norte! Deus abençoe nosso Apóstolo!',
    sent_at: '2026-08-28T19:15:20Z',
    is_pinned: true,
    is_prayer_request: false,
  },
  {
    id: 'msg-2',
    tenant_id: 'tenant-sede',
    live_id: 'live-current',
    sender_name: 'Irmã Claudia Macedo',
    message: 'Peço oração pela cura e restauração da saúde do meu irmão Marcelo no hospital.',
    sent_at: '2026-08-28T19:18:45Z',
    is_pinned: false,
    is_prayer_request: true,
  },
  {
    id: 'msg-3',
    tenant_id: 'tenant-sede',
    live_id: 'live-current',
    sender_name: 'Missionário Daniel (Lisboa)',
    message: 'Boas Novas Lisboa assistindo! A unção transborda além das fronteiras! Amém!',
    sent_at: '2026-08-28T19:22:10Z',
    is_pinned: false,
    is_prayer_request: false,
  },
  {
    id: 'msg-4',
    tenant_id: 'tenant-sede',
    live_id: 'live-current',
    sender_name: 'Diácono Roberto Silva',
    message: 'Peço oração por portas abertas de emprego e provisão financeira.',
    sent_at: '2026-08-28T19:25:30Z',
    is_pinned: false,
    is_prayer_request: true,
  },
];

const initialGroups: Group[] = [
  {
    id: 'grp-1',
    tenant_id: 'tenant-sede',
    name: 'Célula Boas Novas - Bela Vista',
    leader_id: 'mem-7',
    leader_name: 'Mariana Azevedo Costa',
    description: 'Pequeno grupo de comunhão e discipulado nas terças-feiras.',
    meeting_day: 'Terça-feira',
    meeting_time: '20:00',
    category: 'celula',
    members_count: 18,
  },
  {
    id: 'grp-2',
    tenant_id: 'tenant-sede',
    name: 'Célula Morumbi & Jardins',
    leader_id: 'mem-6',
    leader_name: 'Paulo Henrique Ramos',
    description: 'Grupo familiar de oração e compartilhamento da palavra.',
    meeting_day: 'Quinta-feira',
    meeting_time: '19:30',
    category: 'celula',
    members_count: 22,
  },
  {
    id: 'grp-3',
    tenant_id: 'tenant-sede',
    name: 'Rede de Homens Apostólicos',
    leader_id: 'mem-3',
    leader_name: 'Pr. Lucas Mendes Rocha',
    description: 'Encontros mensais de fortalecimento da liderança e sacerdócio no lar.',
    meeting_day: 'Sábado (Mensal)',
    meeting_time: '08:00',
    category: 'ministerio',
    members_count: 85,
  },
  {
    id: 'grp-4',
    tenant_id: 'tenant-sede',
    name: 'Geração Boas Novas (Jovens & Universitários)',
    leader_id: 'mem-5',
    leader_name: 'Gabriel Ribeiro Farias',
    description: 'Movimento jovem aos sábados com adoração e impacto social.',
    meeting_day: 'Sábado',
    meeting_time: '19:30',
    category: 'ministerio',
    members_count: 140,
  },
];

const initialClasses: SundaySchoolClass[] = [
  {
    id: 'cls-1',
    tenant_id: 'tenant-sede',
    name: 'Classe Teologia & Fundamentos Apostólicos',
    teacher_name: 'Pr. Lucas Mendes Rocha',
    age_group: 'Adultos & Obreiros',
    room: 'Auditório Alpha',
    students_count: 65,
  },
  {
    id: 'cls-2',
    tenant_id: 'tenant-sede',
    name: 'Classe Novos Convertidos (Primeiros Passos)',
    teacher_name: 'Bispa Helena Silveira',
    age_group: 'Recém-Batizados',
    room: 'Sala 03 - Térreo',
    students_count: 32,
  },
  {
    id: 'cls-3',
    tenant_id: 'tenant-sede',
    name: 'Boas Novas Kids: Soldados de Cristo',
    teacher_name: 'Ester Ferreira Prado',
    age_group: '07 a 11 anos',
    room: 'Pavilhão Infantil Sala A',
    students_count: 48,
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    tenant_id: 'tenant-sede',
    user_id: 'usr-1',
    user_name: 'Ap. Carlos Alberto',
    action: 'EMITIR_CREDENCIAL',
    entity: 'credentials',
    details: 'Emitida credencial digital com QR Code para Débora Cristina Santos (BN-2024-0142)',
    created_at: '2026-08-28T09:12:00Z',
  },
  {
    id: 'log-2',
    tenant_id: 'tenant-sede',
    user_id: 'usr-2',
    user_name: 'Ricardo Neves (Tesouraria)',
    action: 'LANCAMENTO_FINANCEIRO',
    entity: 'donations',
    details: 'Registrado lote de dízimos via PIX no valor de R$ 22.990,00',
    created_at: '2026-08-28T10:45:00Z',
  },
  {
    id: 'log-3',
    tenant_id: 'tenant-sede',
    user_id: 'usr-3',
    user_name: 'Gabriel Ribeiro (Mídia)',
    action: 'INICIAR_TRANSMISSAO',
    entity: 'lives',
    details: 'Iniciada transmissão 4K ao vivo para YouTube e App Oficial',
    created_at: '2026-08-28T18:58:00Z',
  },
];

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants] = useState<Tenant[]>(initialTenants);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(initialTenants[0]);
  const [currentRole, setCurrentRole] = useState<AppRole>('owner');

  const [members, setMembers] = useState<Person[]>(initialMembers);
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [cameras, setCameras] = useState<Camera[]>(initialCameras);
  const [liveStream] = useState<LiveStream>(initialLiveStream);
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>(initialChatMessages);
  const [groups] = useState<Group[]>(initialGroups);
  const [classes] = useState<SundaySchoolClass[]>(initialClasses);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [recentAttendance, setRecentAttendance] = useState<{ personName: string; eventName: string; time: string; method: string }[]>([
    { personName: 'Débora Cristina Santos', eventName: 'Grande Culto da Família', time: '18:45', method: 'QR Code App' },
    { personName: 'Paulo Henrique Ramos', eventName: 'Grande Culto da Família', time: '18:32', method: 'QR Code App' },
    { personName: 'Mariana Azevedo Costa', eventName: 'Grande Culto da Família', time: '18:20', method: 'Reconhecimento' },
    { personName: 'Gabriel Ribeiro Farias', eventName: 'Grande Culto da Família', time: '18:15', method: 'QR Code App' },
  ]);

  const switchTenant = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId);
    if (found) {
      setCurrentTenant(found);
      addAuditLog('TROCA_TENANT', 'tenants', `Sessão alternada para ${found.name}`);
    }
  };

  const updateChurchProfile = (updates: Partial<Tenant>) => {
    setCurrentTenant((prev) => {
      const updated = { ...prev, ...updates };
      addAuditLog('ATUALIZAR_DADOS_IGREJA', 'tenants', `Dados cadastrais da igreja atualizados: ${updated.name}`);
      return updated;
    });
  };

  const switchRole = (role: AppRole) => {
    setCurrentRole(role);
    addAuditLog('TROCA_PAPEL_RBAC', 'user_roles', `Permissão alterada na sessão para '${role}'`);
  };

  const hasRole = (allowedRoles: AppRole[]) => {
    if (currentRole === 'owner') return true;
    return allowedRoles.includes(currentRole);
  };

  const addAuditLog = (action: string, entity: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      tenant_id: currentTenant.id,
      user_id: 'usr-current',
      user_name: currentRole === 'owner' ? 'Ap. Carlos Alberto (Admin)' : `Usuário (${currentRole})`,
      action,
      entity,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // CRUD Members
  const addMember = (data: Omit<Person, 'id' | 'created_at' | 'tenant_id'>) => {
    const newId = `mem-${Date.now()}`;
    const newPerson: Person = {
      ...data,
      id: newId,
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString(),
    };
    setMembers((prev) => [newPerson, ...prev]);
    addAuditLog('CADASTRO_MEMBRO', 'people', `Novo membro cadastrado: ${newPerson.full_name}`);
    
    // Auto-issue digital credential
    issueCredential(newId);
  };

  const updateMember = (id: string, updates: Partial<Person>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    addAuditLog('EDICAO_MEMBRO', 'people', `Dados atualizados para membro ID: ${id}`);
  };

  const deleteMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setCredentials((prev) => prev.filter((c) => c.person_id !== id));
    if (target) {
      addAuditLog('EXCLUSAO_MEMBRO', 'people', `Membro removido do sistema: ${target.full_name}`);
    }
  };

  // Credentials
  const issueCredential = (personId: string, templateId = 'tpl-membro'): Credential => {
    const person = members.find((m) => m.id === personId);
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const code = `BN-2026-${codeNumber}`;
    const qrHash = `BN:AUTH:${codeNumber}:${person?.full_name?.toUpperCase().replace(/\s+/g, '-') || 'MEMBRO'}`;
    
    const newCred: Credential = {
      id: `cred-${Date.now()}`,
      tenant_id: currentTenant.id,
      person_id: personId,
      person_name: person?.full_name || 'Novo Membro',
      person_role: person?.ministry || 'Membro Ativo',
      code,
      qr_hash: qrHash,
      status: 'active',
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString(),
      template_id: templateId,
      photo_url: person?.photo_url || null,
    };

    setCredentials((prev) => [newCred, ...prev.filter((c) => c.person_id !== personId)]);
    addAuditLog('EMISSAO_CREDENCIAL', 'credentials', `Credencial digital emitida para ${newCred.person_name} (${code})`);
    return newCred;
  };

  const revokeCredential = (credentialId: string) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === credentialId ? { ...c, status: 'revoked' } : c))
    );
    addAuditLog('REVOGACAO_CREDENCIAL', 'credentials', `Credencial ${credentialId} revogada.`);
  };

  const validateQrCode = (code: string) => {
    const matched = credentials.find(
      (c) => c.code.toLowerCase() === code.toLowerCase() || c.qr_hash === code
    );
    if (!matched) {
      return { valid: false, message: 'Credencial não localizada ou código inválido.' };
    }
    if (matched.status !== 'active') {
      return { valid: false, credential: matched, message: `Credencial ${matched.status.toUpperCase()}! Acesso negado.` };
    }
    const member = members.find((m) => m.id === matched.person_id);
    return {
      valid: true,
      credential: matched,
      member,
      message: `Credencial Válida: ${matched.person_name} (${matched.person_role})`,
    };
  };

  // Finance
  const addDonation = (donation: Omit<Donation, 'id' | 'tenant_id' | 'receipt_number'>) => {
    const recNumber = `REC-2026-${Date.now().toString().slice(-6)}`;
    const newDon: Donation = {
      ...donation,
      id: `don-${Date.now()}`,
      tenant_id: currentTenant.id,
      receipt_number: recNumber,
    };
    setDonations((prev) => [newDon, ...prev]);

    // Also register in transactions
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      tenant_id: currentTenant.id,
      type: 'income',
      category: donation.type === 'tithe' ? 'Dízimos' : donation.type === 'missions' ? 'Missões' : 'Ofertas',
      description: `${donation.type.toUpperCase()} recebido de ${donation.person_name} (${donation.payment_method.toUpperCase()})`,
      amount: donation.amount,
      date: donation.date,
      status: 'completed',
      payment_method: donation.payment_method,
    };
    setTransactions((prev) => [newTx, ...prev]);
    addAuditLog('DOACAO_RECEBIDA', 'donations', `${formatReceiptSummary(newDon)}`);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'tenant_id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      tenant_id: currentTenant.id,
    };
    setTransactions((prev) => [newTx, ...prev]);
    addAuditLog('TRANSACAO_REGISTRADA', 'transactions', `${newTx.type.toUpperCase()}: ${newTx.description} (R$ ${newTx.amount})`);
  };

  const formatReceiptSummary = (d: Donation) => {
    return `Recibo ${d.receipt_number}: R$ ${d.amount.toFixed(2)} - ${d.person_name}`;
  };

  // Financial Metrics
  const financialMetrics = {
    totalTithes: donations.filter((d) => d.type === 'tithe').reduce((acc, c) => acc + c.amount, 0) + 18200,
    totalOfferings: donations.filter((d) => d.type === 'offering').reduce((acc, c) => acc + c.amount, 0),
    totalMissions: donations.filter((d) => d.type === 'missions').reduce((acc, c) => acc + c.amount, 0),
    totalExpenses: transactions.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0),
    get netBalance() {
      return (
        donations.reduce((acc, c) => acc + c.amount, 0) -
        transactions.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0)
      );
    },
  };

  // Attendance
  const recordAttendance = (eventId: string, personId: string, method: 'qr_code' | 'manual' | 'face') => {
    const person = members.find((m) => m.id === personId);
    const event = events.find((e) => e.id === eventId);
    const timeStr = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());

    setRecentAttendance((prev) => [
      {
        personName: person?.full_name || 'Visitante',
        eventName: event?.title || 'Culto Geral',
        time: timeStr,
        method: method === 'qr_code' ? 'QR Code App' : method === 'face' ? 'Reconhecimento' : 'Manual',
      },
      ...prev.slice(0, 19),
    ]);

    addAuditLog('CHECKIN_PRESENCA', 'attendance', `Check-in de ${person?.full_name || 'Membro'} no evento ${event?.title || 'Culto'}`);
  };

  // Cameras
  const toggleCameraRecording = (cameraId: string) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === cameraId) {
          const nextStatus: CameraStatus = c.status === 'recording' ? 'online' : 'recording';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const triggerCameraAlert = (cameraId: string) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === cameraId ? { ...c, status: 'alert' } : c))
    );
    const cam = cameras.find((c) => c.id === cameraId);
    addAuditLog('ALERTA_SEGURANCA', 'cameras', `Alerta de movimento/perímetro disparado em: ${cam?.name}`);
  };

  const [activeViewerMember, setActiveViewerMember] = useState<Person | null>(initialMembers[0]);

  const toggleMemberLiveAccess = (personId: string, granted?: boolean) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === personId) {
          const nextVal = granted !== undefined ? granted : !m.can_access_lives;
          return {
            ...m,
            can_access_lives: nextVal,
            live_access_tier: nextVal ? (m.live_access_tier === 'blocked' ? 'standard' : m.live_access_tier || 'standard') : 'blocked',
          };
        }
        return m;
      })
    );

    const target = members.find((m) => m.id === personId);
    const newStatus = granted !== undefined ? granted : !target?.can_access_lives;
    addAuditLog(
      newStatus ? 'CONCEDER_ACESSO_LIVE' : 'REVOGAR_ACESSO_LIVE',
      'people',
      `Permissão de transmissão ao vivo alterada para: ${target?.full_name || personId} -> ${newStatus ? 'AUTORIZADO' : 'BLOQUEADO'}`
    );
  };

  const grantAllMembersLiveAccess = (granted: boolean) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        can_access_lives: granted,
        live_access_tier: granted ? (m.live_access_tier === 'blocked' ? 'standard' : m.live_access_tier || 'standard') : 'blocked',
      }))
    );
    addAuditLog(
      'PERMISSAO_LIVES_EM_MASSA',
      'people',
      `${granted ? 'Liberado' : 'Revogado'} acesso de transmissão ao vivo para todos os membros (${members.length} pessoas)`
    );
  };

  const checkMemberLiveAccess = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cred = credentials.find(
      (c) => c.code.toLowerCase() === cleanId || c.qr_hash.toLowerCase() === cleanId
    );
    
    let matchedMember: Person | undefined;
    if (cred) {
      matchedMember = members.find((m) => m.id === cred.person_id);
    } else {
      matchedMember = members.find(
        (m) =>
          m.id.toLowerCase() === cleanId ||
          m.email.toLowerCase() === cleanId ||
          m.document.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
          m.full_name.toLowerCase().includes(cleanId)
      );
    }

    if (!matchedMember) {
      return {
        granted: false,
        message: 'Membro não localizado no rol da igreja. Solicite cadastro à secretaria.',
      };
    }

    if (!matchedMember.can_access_lives) {
      return {
        granted: false,
        member: matchedMember,
        message: `Acesso negado: ${matchedMember.full_name} não possui permissão ativa para assistir à transmissão ao vivo.`,
      };
    }

    return {
      granted: true,
      member: matchedMember,
      message: `Acesso autorizado com sucesso! Bem-vindo(a) ${matchedMember.full_name}.`,
    };
  };

  // Live Chat
  const sendLiveChatMessage = async (
    message: string,
    isPrayerRequest = false,
    customSenderName?: string
  ): Promise<LiveChatMessage> => {
    const sender =
      customSenderName ||
      (activeViewerMember
        ? activeViewerMember.full_name
        : currentRole === 'owner'
        ? 'Apóstolo Carlos Alberto'
        : 'Secretaria Boas Novas');

    const createdMsg = await insertLiveChatMessageToDb({
      tenant_id: currentTenant.id,
      live_id: liveStream.id,
      sender_name: sender,
      message,
      is_pinned: false,
      is_prayer_request: isPrayerRequest,
    });

    setLiveChatMessages((prev) => {
      // Evita duplicatas se já adicionado por realtime
      if (prev.some((m) => m.id === createdMsg.id)) return prev;
      return [...prev, createdMsg];
    });

    return createdMsg;
  };

  const togglePinMessage = async (messageId: string) => {
    const target = liveChatMessages.find((m) => m.id === messageId);
    const nextPinned = target ? !target.is_pinned : false;

    await togglePinLiveChatMessageInDb(messageId, nextPinned);

    setLiveChatMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_pinned: nextPinned } : m))
    );
  };

  const deleteLiveChatMessage = async (messageId: string) => {
    await deleteLiveChatMessageInDb(messageId);
    setLiveChatMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Aggregated Stats
  const stats = {
    totalMembers: 1247 + members.length - 10,
    activeCredentials: 892 + credentials.length - 7,
    monthlyTithes: 45890 + donations.reduce((a, b) => a + b.amount, 0) - 45890,
    activeEventsCount: 24,
    onlineViewers: liveStream.viewers_count,
    activeCellsCount: 38,
  };

  return (
    <ChurchContext.Provider
      value={{
        currentTenant,
        tenants,
        switchTenant,
        updateChurchProfile,
        currentRole,
        switchRole,
        hasRole,
        members,
        addMember,
        updateMember,
        deleteMember,
        credentials,
        issueCredential,
        revokeCredential,
        validateQrCode,
        donations,
        transactions,
        addDonation,
        addTransaction,
        financialMetrics,
        events,
        recordAttendance,
        recentAttendance,
        cameras,
        toggleCameraRecording,
        triggerCameraAlert,
        liveStream,
        liveChatMessages,
        sendLiveChatMessage,
        togglePinMessage,
        deleteLiveChatMessage,
        toggleMemberLiveAccess,
        grantAllMembersLiveAccess,
        checkMemberLiveAccess,
        activeViewerMember,
        setActiveViewerMember,
        groups,
        classes,
        stats,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
