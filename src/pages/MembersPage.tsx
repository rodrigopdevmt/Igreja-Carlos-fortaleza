import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  QrCode,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Building2,
  Download,
  CheckCircle,
  Eye,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Video,
  FileText,
} from 'lucide-react';
import { useChurch, Person } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const MembersPage: React.FC = () => {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    currentTenant,
    credentials,
    toggleMemberLiveAccess,
  } = useChurch();

  const [search, setSearch] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('all');
  const [liveAccessFilter, setLiveAccessFilter] = useState<'all' | 'granted' | 'blocked'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    document: '',
    birth_date: '1990-05-15',
    baptism_date: '2010-10-12',
    marital_status: 'Casado(a)',
    gender: 'Masculino',
    address: '',
    photo_url: '',
    ministry: 'Membro Ativo',
    notes: '',
    can_access_lives: true,
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.document.includes(search);
    const matchesMinistry =
      selectedMinistry === 'all' || m.ministry?.toLowerCase().includes(selectedMinistry.toLowerCase());
    
    let matchesLiveAccess = true;
    if (liveAccessFilter === 'granted') matchesLiveAccess = Boolean(m.can_access_lives);
    if (liveAccessFilter === 'blocked') matchesLiveAccess = !m.can_access_lives;

    return matchesSearch && matchesMinistry && matchesLiveAccess;
  });

  const handleOpenCreate = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      document: '',
      birth_date: '1990-05-15',
      baptism_date: '2010-10-12',
      marital_status: 'Casado(a)',
      gender: 'Masculino',
      address: '',
      photo_url: '',
      ministry: 'Membro Ativo',
      notes: '',
      can_access_lives: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (member: Person) => {
    setSelectedMember(member);
    setFormData({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      document: member.document,
      birth_date: member.birth_date,
      baptism_date: member.baptism_date || '',
      marital_status: member.marital_status,
      gender: member.gender,
      address: member.address,
      photo_url: member.photo_url || '',
      ministry: member.ministry || 'Membro Ativo',
      notes: member.notes || '',
      can_access_lives: member.can_access_lives ?? true,
    });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    addMember({
      ...formData,
      photo_url:
        formData.photo_url ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    });
    setModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    updateMember(selectedMember.id, formData);
    setEditModalOpen(false);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nome,Email,Telefone,Documento,Ministério,Permissao_Lives,Congregação']
        .concat(
          members.map(
            (m) =>
              `"${m.full_name}","${m.email}","${m.phone}","${m.document}","${m.ministry}","${
                m.can_access_lives ? 'Liberado' : 'Bloqueado'
              }","${currentTenant.name}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `membros_boas_novas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Membros & Rol de Pessoas
            </h1>
            <Badge variant="gold" size="sm">
              {filteredMembers.length} Registros
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Gestão eclesiástica de ovelhas, ministérios, batismos e permissões individuais de live
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/demo/documents">
            <Button variant="outline" size="sm" icon={FileText} className="text-[#DAA017] border-[#DAA017]/40">
              Emitir Certificado / Carta
            </Button>
          </Link>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Exportar CSV
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#221B13]/90 border border-[#DAA017]/25 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="w-full lg:w-96">
          <Input
            icon={Search}
            placeholder="Buscar por nome, e-mail ou documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs text-[#F8F5EC]/70">
            <Filter className="w-3.5 h-3.5 text-[#DAA017]" /> Ministério:
          </div>
          <select
            value={selectedMinistry}
            onChange={(e) => setSelectedMinistry(e.target.value)}
            className="bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3 py-2 text-xs border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
          >
            <option value="all">Todos os Ministérios</option>
            <option value="Pastoral">Corpo Pastoral</option>
            <option value="Louvor">Louvor & Adoração</option>
            <option value="Diaconato">Diaconato</option>
            <option value="Mídia">Mídia & Transmissão</option>
            <option value="Kids">Ministério Infantil</option>
            <option value="Jovens">Rede de Jovens</option>
            <option value="Membro">Membros Ativos</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-[#F8F5EC]/70">
            <Radio className="w-3.5 h-3.5 text-[#DAA017]" /> Lives:
          </div>
          <select
            value={liveAccessFilter}
            onChange={(e) => setLiveAccessFilter(e.target.value as any)}
            className="bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3 py-2 text-xs border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
          >
            <option value="all">Todas as Permissões</option>
            <option value="granted">Lives Liberadas</option>
            <option value="blocked">Lives Bloqueadas</option>
          </select>
        </div>
      </div>

      {/* Members Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMembers.map((member) => {
          const cred = credentials.find((c) => c.person_id === member.id);

          return (
            <div
              key={member.id}
              className="card-gold-glass rounded-xl p-5 flex flex-col justify-between transition-all duration-200 group relative"
            >
              <div>
                {/* Avatar & Header */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="relative">
                    <img
                      src={
                        member.photo_url ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
                      }
                      alt={member.full_name}
                      className="w-13 h-13 rounded-xl object-cover border border-[#DAA017]/50 shadow-md ring-2 ring-[#DAA017]/10"
                    />
                    <button
                      onClick={() => toggleMemberLiveAccess(member.id)}
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full border border-black shadow-md transition-transform hover:scale-110 ${
                        member.can_access_lives
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                      title={
                        member.can_access_lives
                          ? 'Live Liberada (clique para bloquear)'
                          : 'Live Bloqueada (clique para liberar)'
                      }
                    >
                      {member.can_access_lives ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-serif text-base font-bold text-[#F8F5EC] truncate group-hover:text-[#DAA017] transition-colors">
                        {member.full_name}
                      </h3>
                    </div>

                    <p className="text-xs text-[#DAA017] font-medium truncate mt-0.5">
                      {member.ministry || 'Membro Ativo'}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#F8F5EC]/50 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Batismo: {member.baptism_date ? formatDate(member.baptism_date) : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Permission Indicator Pill */}
                <div className="mb-3 flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15 text-xs">
                  <span className="text-[11px] text-[#F8F5EC]/70 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-[#DAA017]" /> Acesso às Lives:
                  </span>
                  <button
                    onClick={() => toggleMemberLiveAccess(member.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      member.can_access_lives
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30 hover:bg-rose-950 hover:text-rose-300'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/30 hover:bg-emerald-950 hover:text-emerald-300'
                    }`}
                  >
                    {member.can_access_lives ? 'Autorizado' : 'Bloqueado'}
                  </button>
                </div>

                {/* Contact Snippets */}
                <div className="space-y-1.5 py-3 border-t border-b border-[#DAA017]/15 text-xs text-[#F8F5EC]/75">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#DAA017]/70 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#DAA017]/70 shrink-0" />
                    <span>{member.phone}</span>
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {cred ? (
                    <Link to="/demo/credentials">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 transition-colors">
                        <QrCode className="w-3 h-3" /> {cred.code}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-medium">Sem credencial</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setDetailsModalOpen(true);
                    }}
                    className="p-2.5 rounded-lg text-[#F8F5EC]/60 hover:text-[#DAA017] hover:bg-[#3A2E1F]/50 transition-colors"
                    title="Visualizar Ficha Completa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-2.5 rounded-lg text-[#F8F5EC]/60 hover:text-[#DAA017] hover:bg-[#3A2E1F]/50 transition-colors"
                    title="Editar Membro"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o cadastro de ${member.full_name}?`)) {
                        deleteMember(member.id);
                      }
                    }}
                    className="p-2.5 rounded-lg text-[#F8F5EC]/60 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Excluir Membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Novo Membro */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cadastrar Novo Membro"
        subtitle="Igreja Apostólica Boas Novas • Ficha Pastoral"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Completo *"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              label="E-mail *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Telefone / WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Documento (CPF / ID)"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Data de Batismo"
              type="date"
              value={formData.baptism_date}
              onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
            />
            <div>
              <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
                Estado Civil
              </label>
              <select
                value={formData.marital_status}
                onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
                Ministério / Cargo
              </label>
              <input
                type="text"
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              />
            </div>
          </div>

          <Input
            label="Endereço Residencial"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Rua, Número, Bairro, Cidade - UF"
          />

          <Input
            label="URL da Foto (Avatar)"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            placeholder="https://..."
          />

          {/* Live Access Permission Toggle */}
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/25 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F8F5EC] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#DAA017]" /> Liberar Acesso às Transmissões Ao Vivo (Lives)
              </span>
              <p className="text-[11px] text-[#F8F5EC]/60">
                Permite ao membro assistir cultos online restritos via app ou portal
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.can_access_lives}
                onChange={(e) => setFormData({ ...formData, can_access_lives: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#3A2E1F] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DAA017]" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAA017]/20">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Membro & Emitir Carteirinha
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar Membro */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Membro"
        subtitle={selectedMember?.full_name}
        maxWidth="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nome Completo *"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="E-mail *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Telefone / WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ministério / Atribuição"
              value={formData.ministry}
              onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
            />
            <Input
              label="Data de Batismo"
              type="date"
              value={formData.baptism_date}
              onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
            />
          </div>

          {/* Live Access Permission Toggle */}
          <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/25 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#F8F5EC] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#DAA017]" /> Permissão para Transmissões Ao Vivo
              </span>
              <p className="text-[11px] text-[#F8F5EC]/60">
                Status de liberação para assistir aos cultos ao vivo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.can_access_lives}
                onChange={(e) => setFormData({ ...formData, can_access_lives: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#3A2E1F] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DAA017]" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAA017]/20">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalhes & Ficha Eclesiástica */}
      {selectedMember && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="Ficha Cadastral do Membro"
          subtitle="Igreja Apostólica Boas Novas"
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/30">
              <img
                src={
                  selectedMember.photo_url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
                }
                alt={selectedMember.full_name}
                className="w-16 h-16 rounded-xl object-cover border border-[#DAA017]"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
                  {selectedMember.full_name}
                </h3>
                <p className="text-xs text-[#DAA017] font-semibold">
                  {selectedMember.ministry}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[#F8F5EC]/60">
                    Cadastrado em: {formatDate(selectedMember.created_at)}
                  </span>
                  {selectedMember.can_access_lives ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Live Liberada
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                      Live Bloqueada
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15">
                <span className="text-[#DAA017] font-bold block mb-0.5">E-mail:</span>
                <span className="text-[#F8F5EC]/90">{selectedMember.email}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15">
                <span className="text-[#DAA017] font-bold block mb-0.5">Telefone:</span>
                <span className="text-[#F8F5EC]/90">{selectedMember.phone}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15">
                <span className="text-[#DAA017] font-bold block mb-0.5">Documento:</span>
                <span className="text-[#F8F5EC]/90">{selectedMember.document}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15">
                <span className="text-[#DAA017] font-bold block mb-0.5">Data Batismo:</span>
                <span className="text-[#F8F5EC]/90">
                  {selectedMember.baptism_date ? formatDate(selectedMember.baptism_date) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15 text-xs">
              <span className="text-[#DAA017] font-bold block mb-0.5">Endereço Residencial:</span>
              <span className="text-[#F8F5EC]/90">{selectedMember.address || 'Não informado'}</span>
            </div>

            {selectedMember.notes && (
              <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/15 text-xs">
                <span className="text-[#DAA017] font-bold block mb-0.5">Observações Pastorais:</span>
                <span className="text-[#F8F5EC]/80 italic">{selectedMember.notes}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setDetailsModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
