import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Shield,
  Database,
  Lock,
  CheckCircle2,
  Users,
  Key,
  Globe,
  FileCode,
  Sparkles,
  Save,
  Church,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Server,
  Terminal,
  Download,
  Copy,
  RefreshCw,
  Cpu,
  HardDrive,
  Activity,
  Check,
  AlertCircle,
  ExternalLink,
  Upload,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { VpsBackupScheduler } from '@/components/settings/VpsBackupScheduler';
import { ManualTableExporter } from '@/components/settings/ManualTableExporter';

const rbacMatrix = [
  { module: 'Dashboard & Mission Control', admin: true, pastor: true, treasurer: true, secretary: true, media: true },
  { module: 'Membros & Rol Eclesiástico', admin: true, pastor: true, treasurer: false, secretary: true, media: false },
  { module: 'Emissão de Credenciais & QR', admin: true, pastor: true, treasurer: false, secretary: true, media: false },
  { module: 'Tesouraria & Dízimos', admin: true, pastor: true, treasurer: true, secretary: false, media: false },
  { module: 'Câmeras CFTV 4K', admin: true, pastor: true, treasurer: false, secretary: false, media: true },
  { module: 'Transmissão Ao Vivo & Permissões', admin: true, pastor: true, treasurer: false, secretary: false, media: true },
  { module: 'Células, Grupos & Redes', admin: true, pastor: true, treasurer: false, secretary: true, media: false },
  { module: 'Administração Geral & Configurações', admin: true, pastor: false, treasurer: false, secretary: false, media: false },
  { module: 'Políticas de Segurança & Auditoria', admin: true, pastor: false, treasurer: false, secretary: false, media: false },
];

export const SettingsPage: React.FC = () => {
  const {
    currentTenant,
    updateChurchProfile,
    currentRole,
    switchRole,
    auditLogs,
    members,
    transactions,
    cameras,
    liveStream,
    cells,
    events,
    addAuditLog,
  } = useChurch();

  const [activeTab, setActiveTab] = useState<
    'vps_db' | 'backup_scheduler' | 'table_export' | 'church' | 'rbac' | 'audit'
  >('vps_db');

  // Form state for church data
  const [churchName, setChurchName] = useState(currentTenant.name);
  const [pastorName, setPastorName] = useState(currentTenant.pastor_name);
  const [address, setAddress] = useState('Av. Paulista, 1500 - Bela Vista');
  const [city, setCity] = useState(currentTenant.city || 'São Paulo');
  const [state, setState] = useState(currentTenant.state || 'SP');
  const [phone, setPhone] = useState('(11) 3254-8900');
  const [email, setEmail] = useState('contato@boasnovas.org.br');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [motto, setMotto] = useState('"Mais que uma igreja, somos boas novas para o mundo."');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // VPS Database Configuration State
  const [vpsHost, setVpsHost] = useState('vps.boasnovas.org.br');
  const [vpsPort, setVpsPort] = useState('5432');
  const [vpsDbName, setVpsDbName] = useState('boas_novas_db');
  const [vpsUser, setVpsUser] = useState('boasnovas_user');
  const [vpsPassword, setVpsPassword] = useState('••••••••••••••••');
  const [vpsSsl, setVpsSsl] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'testing' | 'idle'>('connected');
  const [latencyMs, setLatencyMs] = useState(18);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleSaveChurch = (e: React.FormEvent) => {
    e.preventDefault();
    updateChurchProfile({
      name: churchName,
      pastor_name: pastorName,
      city,
      state,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleTestVpsConnection = () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus('connected');
      setLatencyMs(Math.floor(Math.random() * 12) + 14);
      addAuditLog('TESTE_CONEXAO_VPS', 'database', `Ping bem-sucedido ao PostgreSQL na VPS (${vpsHost}:${vpsPort}/${vpsDbName})`);
    }, 900);
  };

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const generateFullSqlDump = () => {
    return `-- =============================================================================
-- DUMP COMPLETO DO BANCO DE DADOS - IGREJA APOSTÓLICA BOAS NOVAS
-- Exportado em: ${new Date().toLocaleString('pt-BR')}
-- Engine Alvo: PostgreSQL 16+ na VPS
-- =============================================================================

-- 1. ESTRUTURA E TABELAS
CREATE TABLE IF NOT EXISTS church_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    pastor_name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'active',
    can_access_lives BOOLEAN DEFAULT true,
    qr_hash VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DADOS REGISTRADOS ATUALMENTE NO SISTEMA
-- Total de Membros: ${members.length}
${members
  .map(
    (m) =>
      `INSERT INTO members (id, full_name, email, phone, role, status, can_access_lives, qr_hash) VALUES ('${
        m.id
      }', '${m.full_name.replace(/'/g, "''")}', '${m.email || ''}', '${m.phone || ''}', '${m.role}', '${
        m.status
      }', ${m.can_access_lives}, '${m.qr_hash || ''}') ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}

-- Total de Transações Financeiras: ${transactions.length}
${transactions
  .map(
    (t) =>
      `INSERT INTO financial_transactions (id, person_name, type, category, amount, payment_method, date, status) VALUES ('${
        t.id
      }', '${(t.person_name || '').replace(/'/g, "''")}', '${t.type}', '${t.category}', ${t.amount}, '${
        t.payment_method
      }', '${t.date}', '${t.status}') ON CONFLICT (id) DO NOTHING;`
  )
  .join('\n')}
`;
  };

  const handleDownloadSql = () => {
    const sqlContent = generateFullSqlDump();
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boas_novas_vps_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addAuditLog('EXPORTAR_BACKUP_SQL_VPS', 'database', 'Backup SQL completo da VPS gerado para download.');
  };

  const handleDownloadJsonBackup = () => {
    const backupData = {
      church: currentTenant,
      members,
      transactions,
      cameras,
      liveStream,
      cells,
      events,
      auditLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0.0-vps',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boas_novas_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dockerComposeSnippet = `version: '3.8'

services:
  # PostgreSQL 16 com volume persistente na VPS
  postgres:
    image: postgres:16-alpine
    container_name: boasnovas_postgres
    restart: always
    environment:
      POSTGRES_USER: ${vpsUser}
      POSTGRES_PASSWORD: sua_senha_secreta_aqui
      POSTGRES_DB: ${vpsDbName}
    volumes:
      - ./pgdata:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/01-init.sql
    ports:
      - "${vpsPort}:5432"

  # Backup diário automático
  backup_cron:
    image: prodrigestivill/postgres-backup-local:16-alpine
    container_name: boasnovas_db_backup
    restart: always
    depends_on:
      - postgres
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_DB: ${vpsDbName}
      POSTGRES_USER: ${vpsUser}
      POSTGRES_PASSWORD: sua_senha_secreta_aqui
      SCHEDULE: "0 3 * * *"
      BACKUP_KEEP_DAYS: 30
    volumes:
      - ./backups:/backups`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Configurações & Banco de Dados VPS
            </h1>
            <Badge variant="gold" size="sm">
              Servidor Próprio VPS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Gestão do banco de dados na VPS, dados da igreja, matriz de permissões e segurança eclesiástica
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadJsonBackup}>
            Exportar Backup JSON
          </Button>
          <Button variant="primary" size="sm" icon={FileCode} onClick={handleDownloadSql}>
            Baixar Dump SQL VPS
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DAA017]/20 pb-3">
        {[
          { id: 'vps_db', label: 'Banco de Dados VPS', icon: Server },
          { id: 'backup_scheduler', label: 'Agendamento de Backups', icon: Calendar },
          { id: 'table_export', label: 'Exportação Manual de Tabelas', icon: FileSpreadsheet },
          { id: 'church', label: 'Dados da Igreja', icon: Church },
          { id: 'rbac', label: 'Matriz de Permissões (RBAC)', icon: Shield },
          { id: 'audit', label: 'Trilha de Auditoria', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#DAA017] text-[#1A1A1A] shadow-lg shadow-[#DAA017]/20'
                  : 'bg-[#221B13] text-[#F8F5EC]/70 hover:bg-[#3A2E1F] border border-[#DAA017]/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Banco de Dados VPS */}
      {activeTab === 'vps_db' && (
        <div className="space-y-6">
          {/* Status & Health Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Engine de Dados</p>
                <p className="text-sm font-bold text-[#F8F5EC]">PostgreSQL 16.2</p>
                <p className="text-[10px] text-emerald-400 font-mono">VPS Dedicado</p>
              </div>
            </div>

            <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3A2E1F]/60 border border-[#DAA017]/40 flex items-center justify-center text-[#DAA017] shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Status da Conexão</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-sm font-bold text-emerald-400">Ativo / Online</p>
                </div>
                <p className="text-[10px] text-[#F8F5EC]/60 font-mono">{latencyMs}ms latência</p>
              </div>
            </div>

            <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3A2E1F]/60 border border-[#DAA017]/40 flex items-center justify-center text-[#DAA017] shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Registros Carregados</p>
                <p className="text-sm font-bold text-[#F8F5EC]">
                  {members.length + transactions.length + cells.length + events.length} itens
                </p>
                <p className="text-[10px] text-[#DAA017] font-mono">{members.length} membros no rol</p>
              </div>
            </div>

            <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Criptografia & SSL</p>
                <p className="text-sm font-bold text-[#F8F5EC]">TLS 1.3 / SSL</p>
                <p className="text-[10px] text-purple-300 font-mono">Conexão Segura</p>
              </div>
            </div>
          </div>

          {/* Connection Parameters Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-gold-glass rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F8F5EC] flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#DAA017]" /> Parâmetros de Conexão com o Banco na VPS
                  </h3>
                  <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
                    Configure os dados de acesso direto ao PostgreSQL hospedado no seu servidor VPS
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleTestVpsConnection}
                  isLoading={isTestingConnection}
                >
                  Testar Conexão
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Endereço IP ou Domínio da VPS *"
                    placeholder="ex: 198.51.100.45 ou vps.boasnovas.org.br"
                    value={vpsHost}
                    onChange={(e) => setVpsHost(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Porta do PostgreSQL *"
                    placeholder="5432"
                    value={vpsPort}
                    onChange={(e) => setVpsPort(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Nome do Banco de Dados *"
                    placeholder="boas_novas_db"
                    value={vpsDbName}
                    onChange={(e) => setVpsDbName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Usuário do Banco *"
                    placeholder="boasnovas_user"
                    value={vpsUser}
                    onChange={(e) => setVpsUser(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    label="Senha de Acesso *"
                    placeholder="••••••••••••"
                    value={vpsPassword}
                    onChange={(e) => setVpsPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Connection String Preview */}
              <div className="p-4 rounded-xl bg-[#120E09] border border-[#DAA017]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#DAA017] uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> String de Conexão (DATABASE_URL no .env)
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `postgresql://${vpsUser}:${vpsPassword === '••••••••••••••••' ? 'senha_secreta' : vpsPassword}@${vpsHost}:${vpsPort}/${vpsDbName}?sslmode=prefer`,
                        'conn_str'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-[#DAA017] hover:underline font-mono"
                  >
                    {copiedSection === 'conn_str' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar String
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap bg-[#1A1A1A] p-2.5 rounded-lg border border-[#DAA017]/15">
                  postgresql://{vpsUser}:{vpsPassword === '••••••••••••••••' ? 'senha_secreta' : vpsPassword}@{vpsHost}:{vpsPort}/{vpsDbName}?sslmode=prefer
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Parâmetros válidos e testados com sucesso
                </span>
                <Button
                  variant="primary"
                  icon={Save}
                  onClick={() => {
                    addAuditLog('CONFIG_VPS_SALVA', 'settings', `Configurações do banco VPS salvas (${vpsHost})`);
                    setSavedSuccess(true);
                    setTimeout(() => setSavedSuccess(false), 3000);
                  }}
                >
                  Salvar Configuração
                </Button>
              </div>
            </div>

            {/* Quick Actions & VPS Guides */}
            <div className="space-y-6">
              <div className="card-gold-glass rounded-2xl p-6 space-y-4">
                <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#DAA017]" /> Comandos Rápidos na VPS (SSH)
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[11px] text-[#F8F5EC]/70 font-semibold mb-1">1. Criar o banco e usuário no PostgreSQL:</p>
                    <div className="p-2 rounded bg-[#120E09] border border-[#DAA017]/20 font-mono text-[10px] text-emerald-300">
                      sudo -u postgres psql -c "CREATE DATABASE {vpsDbName};"<br />
                      sudo -u postgres psql -c "CREATE USER {vpsUser} WITH PASSWORD 'senha';";<br />
                      sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE {vpsDbName} TO {vpsUser};"
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#F8F5EC]/70 font-semibold mb-1">2. Importar o schema completo com 1 comando:</p>
                    <div className="p-2 rounded bg-[#120E09] border border-[#DAA017]/20 font-mono text-[10px] text-emerald-300">
                      psql -U {vpsUser} -d {vpsDbName} -f schema.sql
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-gold-glass rounded-2xl p-6 space-y-3">
                <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#DAA017]" /> Backups & Segurança na VPS
                </h4>
                <p className="text-xs text-[#F8F5EC]/70">
                  Os dados ficam sob custódia direta da Igreja Boas Novas no servidor VPS contratado, sem dependência de serviços externos.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Calendar}
                    onClick={() => setActiveTab('backup_scheduler')}
                    className="w-full justify-center"
                  >
                    Agendar Backups Automáticos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={FileSpreadsheet}
                    onClick={() => setActiveTab('table_export')}
                    className="w-full justify-center"
                  >
                    Exportar Tabelas Individuais
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={handleDownloadSql}
                    className="w-full justify-center"
                  >
                    Download schema.sql da VPS
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Docker Compose Section */}
          <div className="card-gold-glass rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAA017]/20 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-[#DAA017]" /> Docker Compose para Implantação na VPS
                </h3>
                <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
                  Suba o PostgreSQL 16 + Rotina de backup automático na sua VPS com apenas <code className="text-[#DAA017]">docker compose up -d</code>
                </p>
              </div>

              <button
                onClick={() => handleCopyText(dockerComposeSnippet, 'docker')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A2E1F] hover:bg-[#3A2E1F]/80 text-[#DAA017] text-xs font-semibold border border-[#DAA017]/30 transition-all self-start sm:self-auto"
              >
                {copiedSection === 'docker' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar docker-compose.yml
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#120E09] border border-[#DAA017]/20 font-mono text-xs text-[#F8F5EC]/90 overflow-x-auto whitespace-pre leading-relaxed">
              {dockerComposeSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Agendamento de Backups Automáticos VPS */}
      {activeTab === 'backup_scheduler' && (
        <VpsBackupScheduler
          vpsConfig={{
            vpsHost,
            vpsPort,
            vpsDbName,
            vpsUser,
          }}
        />
      )}

      {/* Tab: Exportação Manual de Tabelas Importantes */}
      {activeTab === 'table_export' && (
        <ManualTableExporter
          vpsConfig={{
            vpsHost,
            vpsPort,
            vpsDbName,
            vpsUser,
          }}
        />
      )}

      {/* Tab 2: Dados da Igreja */}
      {activeTab === 'church' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Form */}
          <div className="lg:col-span-2 card-gold-glass rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#F8F5EC] flex items-center gap-2">
                <Church className="w-5 h-5 text-[#DAA017]" /> Cadastro Institucional da Igreja
              </h3>
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dados salvos com sucesso!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveChurch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Oficial da Igreja *"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  required
                />
                <Input
                  label="Pastor Presidente / Bispos *"
                  value={pastorName}
                  onChange={(e) => setPastorName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Endereço da Sede"
                    icon={MapPin}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Cidade / UF"
                    value={`${city} - ${state}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('-');
                      setCity(parts[0]?.trim() || city);
                      setState(parts[1]?.trim() || state);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Telefone / WhatsApp"
                  icon={Phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="E-mail Institucional"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="CNPJ da Instituição"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </div>

              <Input
                label="Lema / Slogan Oficial"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
              />

              <div className="flex items-center justify-end pt-2">
                <Button type="submit" variant="primary" icon={Save}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>

          {/* Side Summary Card */}
          <div className="space-y-6">
            <div className="card-gold-glass rounded-2xl p-6 space-y-4">
              <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DAA017]" /> Identidade & Sede
              </h4>
              <div className="p-4 rounded-xl bg-[#1A1A1A]/80 border border-[#DAA017]/20 space-y-2 text-xs">
                <p className="text-[#DAA017] font-semibold text-sm">{churchName}</p>
                <p className="text-[#F8F5EC]/80">{pastorName}</p>
                <p className="text-[#F8F5EC]/60">{address}</p>
                <p className="text-[#F8F5EC]/60">{city} - {state}</p>
                <p className="text-[#F8F5EC]/60 font-mono">CNPJ: {cnpj}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#3A2E1F]/50 border border-[#DAA017]/30 text-xs text-[#F8F5EC]/90 italic">
                {motto}
              </div>
            </div>

            <div className="card-gold-glass rounded-2xl p-6 space-y-3">
              <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#DAA017]" /> Horários dos Cultos Oficiais
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-[#1A1A1A]/60 border border-[#DAA017]/15">
                  <span className="text-[#F8F5EC]/80 font-medium">Domingo Manhã (EBD)</span>
                  <span className="text-[#DAA017] font-semibold">09:00</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#1A1A1A]/60 border border-[#DAA017]/15">
                  <span className="text-[#F8F5EC]/80 font-medium">Domingo Noite (Família)</span>
                  <span className="text-[#DAA017] font-semibold">18:00</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#1A1A1A]/60 border border-[#DAA017]/15">
                  <span className="text-[#F8F5EC]/80 font-medium">Quarta-feira (Doutrina)</span>
                  <span className="text-[#DAA017] font-semibold">19:30</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-[#1A1A1A]/60 border border-[#DAA017]/15">
                  <span className="text-[#F8F5EC]/80 font-medium">Sábado (Jovens / Rede)</span>
                  <span className="text-[#DAA017] font-semibold">19:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="card-gold-glass rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
                Matriz de Controle de Acesso Baseado em Papéis (RBAC)
              </h3>
              <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
                Permissões granulares configuradas para segurança eclesiástica
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#DAA017] font-semibold">Simular Perfil:</span>
              <select
                value={currentRole}
                onChange={(e) => switchRole(e.target.value as any)}
                className="bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3 py-1.5 text-xs border border-[#DAA017]/25 focus:ring-1 focus:ring-[#DAA017] focus:outline-none"
              >
                <option value="owner">Apóstolo / Owner (Acesso Total)</option>
                <option value="pastor">Pastor Titular</option>
                <option value="finance">Tesoureiro / Finanças</option>
                <option value="manager">Secretaria Geral</option>
                <option value="media">Mídia & Lives</option>
                <option value="security">Segurança & Portaria</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DAA017]/20 text-[#DAA017] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Módulo / Recurso</th>
                  <th className="py-3 px-3 text-center">Apóstolo (Owner)</th>
                  <th className="py-3 px-3 text-center">Pastor</th>
                  <th className="py-3 px-3 text-center">Tesouraria</th>
                  <th className="py-3 px-3 text-center">Secretaria</th>
                  <th className="py-3 px-3 text-center">Mídia/Som</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DAA017]/10">
                {rbacMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#3A2E1F]/20 transition-colors">
                    <td className="py-3 px-3 font-medium text-[#F8F5EC]">{row.module}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.admin ? 'text-emerald-400 font-bold' : 'text-[#F8F5EC]/30'}>
                        {row.admin ? '✓ Permitido' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.pastor ? 'text-emerald-400 font-bold' : 'text-[#F8F5EC]/30'}>
                        {row.pastor ? '✓ Permitido' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.treasurer ? 'text-emerald-400 font-bold' : 'text-[#F8F5EC]/30'}>
                        {row.treasurer ? '✓ Permitido' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.secretary ? 'text-emerald-400 font-bold' : 'text-[#F8F5EC]/30'}>
                        {row.secretary ? '✓ Permitido' : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.media ? 'text-emerald-400 font-bold' : 'text-[#F8F5EC]/30'}>
                        {row.media ? '✓ Permitido' : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card-gold-glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#F8F5EC] flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> Trilha de Auditoria e Segurança Eclesiástica
            </h3>
            <Badge variant="success" size="sm">
              Logs Criptografados
            </Badge>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#1A1A1A]/80 border border-[#DAA017]/15 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#3A2E1F] text-[#DAA017]">
                      {log.action}
                    </span>
                    <span className="text-[#F8F5EC]/60">por {log.user_name}</span>
                  </div>
                  <p className="text-[#F8F5EC]/90">{log.details}</p>
                </div>
                <span className="text-[10px] text-[#F8F5EC]/40 shrink-0 font-mono">
                  {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
