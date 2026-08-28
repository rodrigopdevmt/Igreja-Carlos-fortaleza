import React, { useState } from 'react';
import {
  Radio,
  Eye,
  Send,
  Pin,
  Heart,
  MessageSquare,
  Sparkles,
  Share2,
  Sliders,
  Volume2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useChurch, Person } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { LivePlayer } from '@/components/live/LivePlayer';
import { LiveChat } from '@/components/live/LiveChat';

export const LivesPage: React.FC = () => {
  const {
    liveStream,
    currentTenant,
    members,
    activeViewerMember,
    setActiveViewerMember,
    toggleMemberLiveAccess,
    grantAllMembersLiveAccess,
    checkMemberLiveAccess,
    credentials,
    hasRole,
  } = useChurch();

  // Modals
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Search in Permissions Modal
  const [memberSearch, setMemberSearch] = useState('');
  const [permissionFilter, setPermissionFilter] = useState<'all' | 'granted' | 'blocked'>('all');

  // Credential input in Auth Modal
  const [authInput, setAuthInput] = useState('');
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string } | null>(null);

  const canManagePermissions = hasRole(['owner', 'pastor', 'media', 'manager']);
  const isViewerAuthorized = Boolean(activeViewerMember && activeViewerMember.can_access_lives);

  const handleValidateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInput.trim()) return;

    const result = checkMemberLiveAccess(authInput);
    if (result.granted && result.member) {
      setActiveViewerMember(result.member);
      setAuthResult({ success: true, message: result.message });
      setTimeout(() => {
        setAuthModalOpen(false);
        setAuthResult(null);
        setAuthInput('');
      }, 1200);
    } else {
      setAuthResult({
        success: false,
        message: result.message || 'Acesso negado: membro sem autorização para transmissões.',
      });
      if (result.member) {
        setActiveViewerMember(result.member);
      }
    }
  };

  const handleRequestAccess = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 4000);
  };

  const filteredMembersForPermissions = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.document.includes(memberSearch) ||
      (m.ministry && m.ministry.toLowerCase().includes(memberSearch.toLowerCase()));

    if (permissionFilter === 'granted') return matchesSearch && m.can_access_lives;
    if (permissionFilter === 'blocked') return matchesSearch && !m.can_access_lives;
    return matchesSearch;
  });

  const authorizedCount = members.filter((m) => m.can_access_lives).length;
  const blockedCount = members.length - authorizedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Transmissão Ao Vivo & Culto Online
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              EM DIRETO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Console de streaming eclesiástico 4K com controle nominal de acesso por membro
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3A2E1F]/60 border border-[#DAA017]/30 text-xs font-semibold text-[#DAA017]">
            <Eye className="w-4 h-4" /> {liveStream.viewers_count} Online
          </div>

          {canManagePermissions && (
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              onClick={() => setPermissionsModalOpen(true)}
              className="text-xs shadow-md"
            >
              Permissões de Membros ({authorizedCount}/{members.length})
            </Button>
          )}
        </div>
      </div>

      {/* Member Access / Active Viewer Authentication Bar */}
      <div className="p-4 rounded-2xl bg-[#221B13]/95 border border-[#DAA017]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <img
              src={
                activeViewerMember?.photo_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
              }
              alt={activeViewerMember?.full_name || 'Membro'}
              className="w-12 h-12 rounded-xl object-cover border border-[#DAA017]/40 ring-2 ring-[#DAA017]/10"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-[9px] font-bold ${
                isViewerAuthorized ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
              }`}
            >
              {isViewerAuthorized ? '✓' : '✕'}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#DAA017] uppercase tracking-wider">
                Membro Conectado:
              </span>
              {isViewerAuthorized ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Acesso Liberado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30 animate-pulse">
                  <ShieldAlert className="w-3 h-3" /> Sem Permissão de Live
                </span>
              )}
            </div>
            <h3 className="font-serif text-base font-bold text-[#F8F5EC] truncate">
              {activeViewerMember ? activeViewerMember.full_name : 'Nenhum Membro Identificado'}
            </h3>
            <p className="text-xs text-[#F8F5EC]/60 truncate">
              {activeViewerMember?.ministry || 'Membro do Rol Geral'} • {currentTenant.name}
            </p>
          </div>
        </div>

        {/* Member Switcher Dropdown & Validate Action */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-xl border border-[#DAA017]/25 text-xs text-[#F8F5EC]">
            <Users className="w-3.5 h-3.5 text-[#DAA017]" />
            <span className="text-[11px] text-[#F8F5EC]/70 shrink-0">Simular Membro:</span>
            <select
              value={activeViewerMember?.id || ''}
              onChange={(e) => {
                const found = members.find((m) => m.id === e.target.value);
                if (found) setActiveViewerMember(found);
              }}
              className="bg-transparent text-[#DAA017] font-semibold focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#1A1A1A] text-[#F8F5EC]">
                  {m.can_access_lives ? '🟢' : '🔴'} {m.full_name} ({m.can_access_lives ? 'Autorizado' : 'Bloqueado'})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={QrCode}
            onClick={() => setAuthModalOpen(true)}
            className="text-xs py-2"
          >
            Validar Credencial
          </Button>
        </div>
      </div>

      {/* Main Broadcast Stage & Live Chat Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 8 Cols - Video Player Component with Permission Gate */}
        <div className="lg:col-span-8">
          <LivePlayer
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenPermissionsModal={() => setPermissionsModalOpen(true)}
          />
        </div>

        {/* Right: 4 Cols - Live Chat & Intercessory Prayer Stream */}
        <div className="lg:col-span-4">
          <LiveChat
            onOpenAuthModal={() => setAuthModalOpen(true)}
            maxHeight="h-[580px]"
          />
        </div>
      </div>

      {/* Modal: Gestão de Permissões de Acesso às Lives por Membro */}
      <Modal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        title="Gestão de Permissões de Acesso às Transmissões"
        subtitle="Igreja Apostólica Boas Novas • Controle Nominal de Membresia"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Summary Metric Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/25 text-center">
              <span className="text-[10px] uppercase font-bold text-[#F8F5EC]/60">Total Membros</span>
              <p className="font-serif text-lg font-bold text-[#F8F5EC]">{members.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Liberados (Lives)</span>
              <p className="font-serif text-lg font-bold text-emerald-400">{authorizedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-300">Bloqueados</span>
              <p className="font-serif text-lg font-bold text-rose-400">{blockedCount}</p>
            </div>
          </div>

          {/* Quick Filter & Bulk Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="w-full sm:w-64">
              <Input
                icon={Search}
                placeholder="Buscar membro ou ministério..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setPermissionFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  permissionFilter === 'all'
                    ? 'bg-[#DAA017] text-[#1A1A1A]'
                    : 'bg-[#1A1A1A] text-[#F8F5EC]/70 hover:bg-[#3A2E1F]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPermissionFilter('granted')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  permissionFilter === 'granted'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1A1A1A] text-emerald-400/80 hover:bg-emerald-950/60'
                }`}
              >
                Autorizados
              </button>
              <button
                onClick={() => setPermissionFilter('blocked')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  permissionFilter === 'blocked'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#1A1A1A] text-rose-400/80 hover:bg-rose-950/60'
                }`}
              >
                Bloqueados
              </button>
            </div>
          </div>

          {/* Bulk Master Buttons */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#3A2E1F]/50 border border-[#DAA017]/20 text-xs">
            <span className="text-[#F8F5EC]/80 font-medium">Ações em massa:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => grantAllMembersLiveAccess(true)}
                className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 font-semibold"
              >
                Liberar Todos
              </button>
              <button
                onClick={() => grantAllMembersLiveAccess(false)}
                className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/30 hover:bg-rose-900 font-semibold"
              >
                Bloquear Todos
              </button>
            </div>
          </div>

          {/* Members List with 1-Click Permission Toggle */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-[#DAA017]/10">
            {filteredMembersForPermissions.map((member) => (
              <div
                key={member.id}
                className="pt-2 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      member.photo_url ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
                    }
                    alt={member.full_name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#DAA017]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[#F8F5EC] truncate">{member.full_name}</p>
                    <p className="text-[11px] text-[#DAA017] truncate">{member.ministry || 'Membro Ativo'}</p>
                    <p className="text-[10px] text-[#F8F5EC]/40 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] py-1 text-[#DAA017] hover:bg-[#3A2E1F]"
                    onClick={() => {
                      setActiveViewerMember(member);
                      setPermissionsModalOpen(false);
                    }}
                    title="Assistir como este membro"
                  >
                    Testar Visão
                  </Button>

                  <button
                    onClick={() => toggleMemberLiveAccess(member.id)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      member.can_access_lives
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-500/40'
                    }`}
                  >
                    {member.can_access_lives ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Liberado
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" /> Bloqueado
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#DAA017]/20">
            <Button variant="primary" size="sm" onClick={() => setPermissionsModalOpen(false)}>
              Concluir Alterações
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Validar Credencial / Identificar Membro */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthResult(null);
        }}
        title="Validação de Acesso às Transmissões"
        subtitle="Informe o Código da Credencial, CPF ou E-mail do Membro"
        maxWidth="md"
      >
        <form onSubmit={handleValidateCredential} className="space-y-4">
          <Input
            label="Código da Credencial, CPF ou E-mail *"
            placeholder="Ex: BN-2024-0001 ou debora.santos@gmail.com"
            value={authInput}
            onChange={(e) => setAuthInput(e.target.value)}
            required
            autoFocus
          />

          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/20 text-xs space-y-1">
            <p className="font-bold text-[#DAA017] flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> Códigos de Demonstração Rápidos:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setAuthInput('BN-2024-0001')}
                className="px-2 py-0.5 rounded bg-[#3A2E1F] text-[#F8F5EC] hover:bg-[#DAA017] hover:text-black font-mono text-[10px]"
              >
                BN-2024-0001 (Apóstolo)
              </button>
              <button
                type="button"
                onClick={() => setAuthInput('BN-2024-0142')}
                className="px-2 py-0.5 rounded bg-[#3A2E1F] text-[#F8F5EC] hover:bg-[#DAA017] hover:text-black font-mono text-[10px]"
              >
                BN-2024-0142 (Louvor)
              </button>
              <button
                type="button"
                onClick={() => setAuthInput('matheus.lima@hotmail.com')}
                className="px-2 py-0.5 rounded bg-[#3A2E1F] text-[#F8F5EC] hover:bg-[#DAA017] hover:text-black font-mono text-[10px]"
              >
                Matheus (Bloqueado)
              </button>
            </div>
          </div>

          {authResult && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                authResult.success
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
              }`}
            >
              {authResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{authResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DAA017]/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAuthModalOpen(false);
                setAuthResult(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Verificar Permissão
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
