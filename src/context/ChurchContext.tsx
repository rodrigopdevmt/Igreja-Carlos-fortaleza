import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const POSTGREST_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3100';

async function pgFetch<T>(table: string, params = ''): Promise<T[]> {
  try {
    const res = await fetch(`${POSTGREST_URL}/${table}?${params}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
}

async function pgInsert<T>(table: string, row: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${POSTGREST_URL}/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[pgInsert] ${table} FAILED ${res.status}:`, errBody);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`[pgInsert] ${table} EXCEPTION:`, e);
    return null;
  }
}

async function pgUpdate<T>(table: string, match: Record<string, unknown>, updates: Record<string, unknown>): Promise<T | null> {
  try {
    const params = new URLSearchParams();
    Object.entries(match).forEach(([k, v]) => params.append(k, `eq.${v}`));
    const res = await fetch(`${POSTGREST_URL}/${table}?${params.toString()}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[pgUpdate] ${table} FAILED ${res.status}:`, errBody);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`[pgUpdate] ${table} EXCEPTION:`, e);
    return null;
  }
}

async function pgDelete(table: string, match: Record<string, unknown>): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    Object.entries(match).forEach(([k, v]) => params.append(k, `eq.${v}`));
    const res = await fetch(`${POSTGREST_URL}/${table}?${params.toString()}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[pgDelete] ${table} FAILED ${res.status}:`, errBody);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[pgDelete] ${table} EXCEPTION:`, e);
    return false;
  }
}

interface ChurchContextType {
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  updateChurchProfile: (updates: Partial<Tenant>) => void;
  
  currentRole: AppRole;
  switchRole: (role: AppRole) => void;
  hasRole: (allowedRoles: AppRole[]) => boolean;

  members: Person[];
  addMember: (member: Omit<Person, 'id' | 'created_at' | 'tenant_id'>) => Promise<string | null>;
  updateMember: (id: string, updates: Partial<Person>) => void;
  deleteMember: (id: string) => void;

  credentials: Credential[];
  issueCredential: (personId: string, templateId?: string) => Credential;
  revokeCredential: (credentialId: string) => void;
  validateQrCode: (code: string) => { valid: boolean; member?: Person; credential?: Credential; message: string };

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

  events: Event[];
  recordAttendance: (eventId: string, personId: string, method: 'qr_code' | 'manual' | 'face') => void;
  recentAttendance: { personName: string; eventName: string; time: string; method: string }[];

  cameras: Camera[];
  toggleCameraRecording: (cameraId: string) => void;
  triggerCameraAlert: (cameraId: string) => void;

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

  groups: Group[];
  classes: SundaySchoolClass[];

  stats: {
    totalMembers: number;
    activeCredentials: number;
    monthlyTithes: number;
    activeEventsCount: number;
    onlineViewers: number;
    activeCellsCount: number;
  };

  auditLogs: AuditLog[];
  addAuditLog: (action: string, entity: string, details: string) => void;
  loading: boolean;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

const emptyTenant: Tenant = {
  id: '',
  name: '',
  slug: '',
  logo_url: null,
  city: '',
  state: '',
  pastor_name: '',
  status: 'active',
  created_at: '',
};

const emptyLiveStream: LiveStream = {
  id: '00000000-0000-0000-0000-000000000001',
  tenant_id: '00000000-0000-0000-0000-000000000001',
  title: 'Culto Geral',
  stream_url: '',
  platform: 'custom',
  status: 'ended',
  viewers_count: 0,
  started_at: '',
  preacher: '',
};

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(emptyTenant);
  const [currentRole, setCurrentRole] = useState<AppRole>('owner');

  const [members, setMembers] = useState<Person[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [liveStream, setLiveStream] = useState<LiveStream>(emptyLiveStream);
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<{ personName: string; eventName: string; time: string; method: string }[]>([]);

  const [activeViewerMember, setActiveViewerMember] = useState<Person | null>(null);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const tenantId = '00000000-0000-0000-0000-000000000001';

      const [ten, ppl, creds, dons, txns, evts, cams, grp, cls, logs, lives] = await Promise.all([
        pgFetch<Tenant>('tenants', 'order=created_at&limit=10'),
        pgFetch<Person>('people', `tenant_id=eq.${tenantId}&order=full_name&limit=500`),
        pgFetch<Credential>('credentials', `tenant_id=eq.${tenantId}&order=issued_at.desc&limit=500`),
        pgFetch<Donation>('donations', `tenant_id=eq.${tenantId}&order=date.desc&limit=500`),
        pgFetch<Transaction>('transactions', `tenant_id=eq.${tenantId}&order=date.desc&limit=500`),
        pgFetch<Event>('events', `tenant_id=eq.${tenantId}&order=start_time.desc&limit=100`),
        pgFetch<Camera>('cameras', `tenant_id=eq.${tenantId}&order=name&limit=50`),
        pgFetch<Group>('groups', `tenant_id=eq.${tenantId}&order=name&limit=100`),
        pgFetch<SundaySchoolClass>('classes', `tenant_id=eq.${tenantId}&order=name&limit=100`),
        pgFetch<AuditLog>('audit_log', `tenant_id=eq.${tenantId}&order=created_at.desc&limit=100`),
        pgFetch<LiveStream>('lives', `tenant_id=eq.${tenantId}&order=started_at.desc&limit=1`),
      ]);

      if (ten.length > 0) {
        setTenants(ten);
        setCurrentTenant(ten[0]);
      }
      if (lives.length > 0) {
        setLiveStream(lives[0]);
      }
      setMembers(ppl);
      setCredentials(creds);
      setDonations(dons);
      setTransactions(txns);
      setEvents(evts);
      setCameras(cams);
      setGroups(grp);
      setClasses(cls);
      setAuditLogs(logs);
      setLoading(false);
    }

    loadAll();
  }, []);

  const switchTenant = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId);
    if (found) {
      setCurrentTenant(found);
      addAuditLog('TROCA_TENANT', 'tenants', `Sessão alternada para ${found.name}`);
    }
  };

  const updateChurchProfile = async (updates: Partial<Tenant>) => {
    setCurrentTenant((prev) => {
      const updated = { ...prev, ...updates };
      if (prev.id) {
        pgUpdate('tenants', { id: prev.id }, updates);
      }
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
      user_name: currentRole === 'owner' ? 'Admin' : `Usuário (${currentRole})`,
      action,
      entity,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    pgInsert('audit_log', {
      tenant_id: currentTenant.id,
      user_id: 'usr-current',
      user_name: newLog.user_name,
      action,
      entity,
      details,
    });
  };

  const addMember = async (data: Omit<Person, 'id' | 'created_at' | 'tenant_id'>): Promise<string | null> => {
    const newPerson = await pgInsert<Person>('people', {
      ...data,
      tenant_id: currentTenant.id,
    });
    if (newPerson) {
      setMembers((prev) => [newPerson, ...prev]);
      addAuditLog('CADASTRO_MEMBRO', 'people', `Novo membro cadastrado: ${newPerson.full_name}`);
      const cred = await issueCredential(newPerson.id);
      return cred.code;
    }
    return null;
  };

  const updateMember = async (id: string, updates: Partial<Person>) => {
    await pgUpdate('people', { id }, updates);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addAuditLog('EDICAO_MEMBRO', 'people', `Dados atualizados para membro ID: ${id}`);
  };

  const deleteMember = async (id: string) => {
    const target = members.find((m) => m.id === id);
    await pgDelete('people', { id });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setCredentials((prev) => prev.filter((c) => c.person_id !== id));
    if (target) {
      addAuditLog('EXCLUSAO_MEMBRO', 'people', `Membro removido do sistema: ${target.full_name}`);
    }
  };

  const issueCredential = async (personId: string, templateId = 'tpl-membro'): Promise<Credential> => {
    const person = members.find((m) => m.id === personId);
    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const code = `BN-2026-${codeNumber}`;
    const qrHash = `BN:AUTH:${codeNumber}:${person?.full_name?.toUpperCase().replace(/\s+/g, '-') || 'MEMBRO'}`;
    
    const newCred = await pgInsert<Credential>('credentials', {
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
    });

    if (newCred) {
      setCredentials((prev) => [newCred, ...prev.filter((c) => c.person_id !== personId)]);
      addAuditLog('EMISSAO_CREDENCIAL', 'credentials', `Credencial digital emitida para ${newCred.person_name} (${code})`);
      return newCred;
    }

    // fallback local
    const localCred: Credential = {
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
    setCredentials((prev) => [localCred, ...prev.filter((c) => c.person_id !== personId)]);
    return localCred;
  };

  const revokeCredential = async (credentialId: string) => {
    await pgUpdate('credentials', { id: credentialId }, { status: 'revoked' });
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

  const addDonation = async (donation: Omit<Donation, 'id' | 'tenant_id' | 'receipt_number'>) => {
    const recNumber = `REC-2026-${Date.now().toString().slice(-6)}`;
    const newDon = await pgInsert<Donation>('donations', {
      ...donation,
      tenant_id: currentTenant.id,
      receipt_number: recNumber,
    });

    if (newDon) {
      setDonations((prev) => [newDon, ...prev]);
    } else {
      const localDon: Donation = {
        ...donation,
        id: `don-${Date.now()}`,
        tenant_id: currentTenant.id,
        receipt_number: recNumber,
      };
      setDonations((prev) => [localDon, ...prev]);
    }

    const newTx = await pgInsert<Transaction>('transactions', {
      tenant_id: currentTenant.id,
      type: 'income',
      category: donation.type === 'tithe' ? 'Dízimos' : donation.type === 'missions' ? 'Missões' : 'Ofertas',
      description: `${donation.type.toUpperCase()} recebido de ${donation.person_name} (${donation.payment_method?.toUpperCase() || 'N/I'})`,
      amount: donation.amount,
      date: donation.date,
      status: 'completed',
      payment_method: donation.payment_method,
    });

    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'tenant_id'>) => {
    const newTx = await pgInsert<Transaction>('transactions', {
      ...tx,
      tenant_id: currentTenant.id,
    });

    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
    } else {
      setTransactions((prev) => [{ ...tx, id: `tx-${Date.now()}`, tenant_id: currentTenant.id }, ...prev]);
    }
  };

  const financialMetrics = {
    totalTithes: donations.filter((d) => d.type === 'tithe').reduce((acc, c) => acc + Number(c.amount || 0), 0),
    totalOfferings: donations.filter((d) => d.type === 'offering').reduce((acc, c) => acc + Number(c.amount || 0), 0),
    totalMissions: donations.filter((d) => d.type === 'missions').reduce((acc, c) => acc + Number(c.amount || 0), 0),
    totalExpenses: transactions.filter((t) => t.type === 'expense').reduce((acc, c) => acc + Number(c.amount || 0), 0),
    get netBalance() {
      return (
        donations.reduce((acc, c) => acc + Number(c.amount || 0), 0) -
        transactions.filter((t) => t.type === 'expense').reduce((acc, c) => acc + Number(c.amount || 0), 0)
      );
    },
  };

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

  const toggleCameraRecording = (cameraId: string) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === cameraId) {
          const nextStatus: CameraStatus = c.status === 'recording' ? 'online' : 'recording';
          pgUpdate('cameras', { id: cameraId }, { status: nextStatus });
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
    pgUpdate('cameras', { id: cameraId }, { status: 'alert' });
    addAuditLog('ALERTA_SEGURANCA', 'cameras', `Alerta de movimento/perímetro disparado em: ${cam?.name}`);
  };

  const toggleMemberLiveAccess = async (personId: string, granted?: boolean) => {
    const target = members.find((m) => m.id === personId);
    const nextVal = granted !== undefined ? granted : !target?.can_access_lives;
    const nextTier = nextVal ? (target?.live_access_tier === 'blocked' ? 'standard' : target?.live_access_tier || 'standard') : 'blocked';

    await pgUpdate('people', { id: personId }, { can_access_lives: nextVal, live_access_tier: nextTier });
    setMembers((prev) =>
      prev.map((m) => (m.id === personId ? { ...m, can_access_lives: nextVal, live_access_tier: nextTier } : m))
    );
    addAuditLog(
      nextVal ? 'CONCEDER_ACESSO_LIVE' : 'REVOGAR_ACESSO_LIVE',
      'people',
      `Permissão de transmissão ao vivo alterada para: ${target?.full_name || personId} -> ${nextVal ? 'AUTORIZADO' : 'BLOQUEADO'}`
    );
  };

  const grantAllMembersLiveAccess = async (granted: boolean) => {
    for (const m of members) {
      await pgUpdate('people', { id: m.id }, {
        can_access_lives: granted,
        live_access_tier: granted ? (m.live_access_tier === 'blocked' ? 'standard' : m.live_access_tier || 'standard') : 'blocked',
      });
    }
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
          m.email?.toLowerCase() === cleanId ||
          m.document?.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
          m.full_name?.toLowerCase().includes(cleanId)
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
        ? 'Admin'
        : 'Visitante');

    const createdMsg = await insertLiveChatMessageToDb({
      tenant_id: currentTenant.id,
      live_id: liveStream.id || 'live-current',
      sender_name: sender,
      message,
      is_pinned: false,
      is_prayer_request: isPrayerRequest,
    });

    setLiveChatMessages((prev) => {
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

  const stats = {
    totalMembers: members.length,
    activeCredentials: credentials.filter((c) => c.status === 'active').length,
    monthlyTithes: financialMetrics.totalTithes,
    activeEventsCount: events.length,
    onlineViewers: liveStream.viewers_count || 0,
    activeCellsCount: groups.filter((g) => g.category === 'celula').length,
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
        loading,
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
