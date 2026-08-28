import React, { useState } from 'react';
import {
  Users,
  QrCode,
  CircleDollarSign,
  Calendar,
  Radio,
  Plus,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  Eye,
  Send,
  HeartHandshake,
} from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';

const chartData = [
  { month: 'Jan', tithes: 38200, attendance: 980 },
  { month: 'Fev', tithes: 41000, attendance: 1040 },
  { month: 'Mar', tithes: 39500, attendance: 1110 },
  { month: 'Abr', tithes: 43200, attendance: 1180 },
  { month: 'Mai', tithes: 42800, attendance: 1210 },
  { month: 'Jun', tithes: 44900, attendance: 1235 },
  { month: 'Jul', tithes: 45100, attendance: 1240 },
  { month: 'Ago', tithes: 45890, attendance: 1247 },
];

export const DashboardPage: React.FC = () => {
  const {
    stats,
    currentTenant,
    events,
    recentAttendance,
    liveStream,
    addMember,
    addDonation,
    members,
    auditLogs,
  } = useChurch();

  // Modals state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  // Form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberMinistry, setNewMemberMinistry] = useState('Membro Ativo');

  const [donAmount, setDonAmount] = useState('');
  const [donPerson, setDonPerson] = useState('');
  const [donType, setDonType] = useState<'tithe' | 'offering' | 'missions'>('tithe');
  const [donMethod, setDonMethod] = useState<'pix' | 'cash' | 'credit_card'>('pix');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    addMember({
      full_name: newMemberName,
      email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      phone: newMemberPhone || '(11) 98888-0000',
      document: '000.000.000-00',
      birth_date: '1995-01-01',
      baptism_date: '2015-01-01',
      marital_status: 'Casado(a)',
      gender: 'Não especificado',
      address: 'São Paulo - SP',
      photo_url: null,
      ministry: newMemberMinistry,
      notes: 'Cadastrado via Quick Action no Dashboard',
    });

    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setMemberModalOpen(false);
  };

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(donAmount);
    if (isNaN(val) || val <= 0) return;

    addDonation({
      person_id: null,
      person_name: donPerson.trim() || 'Membro / Doador',
      amount: val,
      type: donType,
      payment_method: donMethod,
      date: new Date().toISOString(),
      notes: 'Lançamento via Quick Action no Dashboard',
    });

    setDonAmount('');
    setDonPerson('');
    setDonationModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome with Church Identity */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3A2E1F]/90 via-[#261E14]/95 to-[#16120D] border border-[#DAA017]/30 p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gold" size="sm">
                <Sparkles className="w-3 h-3 mr-1" /> Painel de Controle Eclesiástico
              </Badge>
              <span className="text-xs text-[#F8F5EC]/60 hidden sm:inline">
                {currentTenant.name}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F8F5EC] tracking-tight">
              Igreja Apostólica <span className="text-gold-gradient">Boas Novas</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#F8F5EC]/70 max-w-2xl font-light">
              "Mais que uma igreja, somos boas novas para o mundo." • {currentTenant.pastor_name}
            </p>
          </div>

          {/* Quick Actions Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setMemberModalOpen(true)}
            >
              Novo Membro
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={CircleDollarSign}
              onClick={() => setDonationModalOpen(true)}
            >
              Lançar Dízimo/Oferta
            </Button>
            <Link to="/demo/credentials">
              <Button variant="outline" size="sm" icon={QrCode}>
                Credenciais
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Section (Requested exact values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          id="metric-members"
          title="Membros Ativos"
          value={stats.totalMembers.toLocaleString('pt-BR')}
          subtitle="Comunhão & Discipulado"
          icon={Users}
          trend={{ value: '8.4% este mês', positive: true }}
          highlight={false}
        />
        <MetricCard
          id="metric-credentials"
          title="Credenciais Emitidas"
          value={stats.activeCredentials.toLocaleString('pt-BR')}
          subtitle="Carteirinhas com QR Code"
          icon={QrCode}
          trend={{ value: '12 novas hoje', positive: true }}
          highlight={false}
        />
        <MetricCard
          id="metric-finance"
          title="Dízimos & Ofertas"
          value={formatCurrency(stats.monthlyTithes)}
          subtitle="Entradas consolidadas"
          icon={CircleDollarSign}
          trend={{ value: '14.2% meta batida', positive: true }}
          highlight={true}
        />
        <MetricCard
          id="metric-events"
          title="Eventos & Cultos"
          value={stats.activeEventsCount.toString()}
          subtitle="Agenda pastoral do mês"
          icon={Calendar}
          trend={{ value: '4 esta semana', positive: true }}
          highlight={false}
        />
      </div>

      {/* Recharts Live Analytics Section (Membros Ativos, Ofertas Mensais, Participação em Cultos) */}
      <DashboardMetrics />

      {/* Live Stream Status & Check-in Portaria Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Status Widget */}
        <div className="rounded-2xl card-brown border-rose-500/30 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                AO VIVO
              </span>
              <span className="text-xs text-[#F8F5EC]/70 flex items-center gap-1 font-semibold">
                <Eye className="w-3.5 h-3.5 text-[#DAA017]" /> {liveStream.viewers_count} online
              </span>
            </div>

            <h4 className="font-serif text-sm font-bold text-[#F8F5EC] line-clamp-2">
              {liveStream.title}
            </h4>
            <p className="text-xs text-[#DAA017] mt-1">
              Ministração: {liveStream.preacher}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DAA017]/20 flex items-center justify-between">
            <span className="text-[11px] text-[#F8F5EC]/60">
              Qualidade 4K UHD • Transmissão Ativa
            </span>
            <Link to="/demo/lives">
              <Button variant="outline" size="sm" className="text-xs py-1">
                Abrir Console
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Check-in Recent Activity (Portaria Digital) */}
        <div className="lg:col-span-2 rounded-2xl card-brown p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 gold-gradient rounded-full" />
              <h4 className="font-serif text-sm font-bold text-[#F8F5EC]">
                Últimos Check-ins na Portaria (QR Code & Biometria)
              </h4>
            </div>
            <span className="text-[10px] text-[#DAA017] font-semibold uppercase tracking-wider">Portaria Sede</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recentAttendance.slice(0, 4).map((att, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15 text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-medium text-[#F8F5EC] truncate">{att.personName}</p>
                  <p className="text-[10px] text-[#F8F5EC]/50">{att.eventName}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#DAA017] font-semibold">{att.time}</span>
                  <p className="text-[9px] text-emerald-400">{att.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Events & System Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Agenda */}
        <div className="rounded-2xl card-brown p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 gold-gradient rounded-full" />
              <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
                Agenda de Hoje & Cultos
              </h3>
            </div>
            <Link to="/demo/agenda">
              <Button variant="ghost" size="sm" className="text-xs text-[#DAA017]">
                Ver Todos
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-xl bg-[#1A1A1A]/80 border border-[#DAA017]/20 hover:border-[#DAA017]/50 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[#3A2E1F] border border-[#DAA017]/30 text-[#DAA017] text-center shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(event.start_time).toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                    <p className="font-serif text-base font-extrabold leading-none">
                      {new Date(event.start_time).getDate()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#F8F5EC]">
                      {event.title}
                    </h4>
                    <p className="text-xs text-[#F8F5EC]/60 mt-0.5 line-clamp-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#DAA017]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>• {event.location}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="gold" size="sm">
                  {event.event_type.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Multi-Tenant RLS Security Monitor */}
        <div className="rounded-2xl card-brown p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 gold-gradient rounded-full" />
              <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
                Auditoria & RLS em Tempo Real
              </h3>
            </div>
            <Badge variant="success" size="sm">
              Protegido RLS
            </Badge>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#1A1A1A]/80 border border-[#DAA017]/15 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3A2E1F] text-[#DAA017] border border-[#DAA017]/30">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[#F8F5EC]/60">por {log.user_name}</span>
                  </div>
                  <p className="text-[#F8F5EC]/85">{log.details}</p>
                </div>
                <span className="text-[10px] text-[#F8F5EC]/40 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Novo Membro */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title="Cadastrar Novo Membro"
        subtitle="Inclusão com emissão automática de Carteirinha Digital & QR Code"
      >
        <form onSubmit={handleCreateMember} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="ex: Carlos Eduardo de Souza"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="membro@email.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98888-0000"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
              Ministério / Cargo Eclesiástico
            </label>
            <select
              value={newMemberMinistry}
              onChange={(e) => setNewMemberMinistry(e.target.value)}
              className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
            >
              <option value="Membro Ativo">Membro Ativo</option>
              <option value="Diaconato">Diaconato</option>
              <option value="Ministério de Louvor">Ministério de Louvor</option>
              <option value="Ministério Infantil (Kids)">Ministério Infantil (Kids)</option>
              <option value="Mídia & Transmissão">Mídia & Transmissão</option>
              <option value="Liderança de Célula">Liderança de Célula</option>
              <option value="Obreiro(a) / Evangelista">Obreiro(a) / Evangelista</option>
              <option value="Corpo Pastoral">Corpo Pastoral</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMemberModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirmar & Emitir Credencial
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Lançar Dízimo/Oferta */}
      <Modal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        title="Lançamento Financeiro"
        subtitle="Registro de Dízimo, Oferta ou Campanha com emissão de Recibo"
      >
        <form onSubmit={handleCreateDonation} className="space-y-4">
          <Input
            label="Valor em Reais (R$) *"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={donAmount}
            onChange={(e) => setDonAmount(e.target.value)}
            required
          />
          <Input
            label="Nome do Ofertante / Dizimista"
            placeholder="Nome do membro ou deixe em branco para anônimo"
            value={donPerson}
            onChange={(e) => setDonPerson(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
                Categoria
              </label>
              <select
                value={donType}
                onChange={(e) => setDonType(e.target.value as any)}
                className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              >
                <option value="tithe">Dízimo</option>
                <option value="offering">Oferta Voluntária</option>
                <option value="missions">Missões & Ação Social</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
                Forma de Pagamento
              </label>
              <select
                value={donMethod}
                onChange={(e) => setDonMethod(e.target.value as any)}
                className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              >
                <option value="pix">PIX Chave CNPJ</option>
                <option value="credit_card">Cartão de Crédito / Débito</option>
                <option value="cash">Dinheiro Espécie no Altar</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDonationModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar & Gerar Recibo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
