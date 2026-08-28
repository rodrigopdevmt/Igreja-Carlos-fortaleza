import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  HardDrive,
  Shield,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Server,
  Cloud,
  FileCode,
  Bell,
  Trash2,
  FileArchive,
  RefreshCw,
  FolderLock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  BackupScheduleConfig,
  BackupExecutionHistory,
  initialBackupHistory,
  getCronExpressionFromSchedule,
  generateBackupShellScript,
  generateSystemdTimer,
} from '@/services/vpsBackupService';
import { useChurch } from '@/context/ChurchContext';

interface VpsBackupSchedulerProps {
  vpsConfig: {
    vpsHost: string;
    vpsPort: string;
    vpsDbName: string;
    vpsUser: string;
  };
}

export const VpsBackupScheduler: React.FC<VpsBackupSchedulerProps> = ({ vpsConfig }) => {
  const { addAuditLog } = useChurch();

  // Estado de configuração do agendador
  const [schedule, setSchedule] = useState<BackupScheduleConfig>({
    enabled: true,
    frequency: 'daily',
    customCron: '0 3 * * *',
    executionTime: '03:00',
    weeklyDay: 0, // Domingo
    retentionDays: 30,
    targetDestination: 'local_vps',
    backupPath: '/var/backups/postgres',
    compression: 'gzip',
    encryptWithGpg: false,
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notifyEmail: 'admin@boasnovas.org.br',
    notifyWebhookUrl: 'https://discord.com/api/webhooks/exemplo/notificacao-boas-novas',
    status: 'idle',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(),
  });

  const [history, setHistory] = useState<BackupExecutionHistory[]>(initialBackupHistory);
  const [activeScriptTab, setActiveScriptTab] = useState<'cron' | 'bash' | 'systemd' | 'docker'>('cron');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estado de Execução Manual de Backup
  const [isExecutingManual, setIsExecutingManual] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [selectedLogHistory, setSelectedLogHistory] = useState<BackupExecutionHistory | null>(null);

  // Calcula expressão cron
  const currentCron = getCronExpressionFromSchedule(schedule);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSaveSchedule = () => {
    setSavedSuccess(true);
    addAuditLog(
      'CONFIG_BACKUP_AGENDADO',
      'vps_backup',
      `Agendamento de backup atualizado: ${schedule.frequency.toUpperCase()} (${currentCron}), Retenção: ${schedule.retentionDays} dias, Destino: ${schedule.targetDestination}`
    );
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Simulação de execução manual de backup com logs passo a passo
  const handleTriggerManualBackup = () => {
    if (isExecutingManual) return;
    setIsExecutingManual(true);
    setExecutionLogs([
      `[${new Date().toLocaleTimeString('pt-BR')}] Conectando ao host PostgreSQL na VPS (${vpsConfig.vpsHost}:${vpsConfig.vpsPort})...`,
    ]);

    setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('pt-BR')}] Verificando permissões do usuário '${vpsConfig.vpsUser}' no banco '${vpsConfig.vpsDbName}'... [OK]`,
      ]);
    }, 700);

    setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('pt-BR')}] Executando pg_dump para 12 tabelas do rol eclesiástico e financeiro...`,
      ]);
    }, 1500);

    setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('pt-BR')}] Aplicando compressão ${schedule.compression.toUpperCase()} nível 9...`,
      ]);
    }, 2400);

    setTimeout(() => {
      const now = new Date();
      const ext = schedule.compression === 'gzip' ? 'sql.gz' : 'sql';
      const fileName = `${vpsConfig.vpsDbName}_manual_${now.toISOString().replace(/[-:T.]/g, '').slice(0, 14)}.${ext}`;
      const newHistoryItem: BackupExecutionHistory = {
        id: `bkp-hist-${Date.now()}`,
        executedAt: now.toISOString(),
        type: 'manual',
        durationSeconds: 3.4,
        sizeBytes: 1024 * 512,
        sizeFormatted: '512 KB',
        status: 'success',
        fileName,
        tablesIncluded: 12,
        recordsCount: 154,
        checksum: 'c28d90f84092b1a8d0521e1029c7dbf8139589d81d2f939ac1e42f9b42e72901',
        destination: `${schedule.backupPath} (Local VPS)`,
        logs: [
          `[${now.toLocaleTimeString('pt-BR')}] Início da rotina manual.`,
          `[${now.toLocaleTimeString('pt-BR')}] 12 tabelas exportadas com sucesso via pg_dump.`,
          `[${now.toLocaleTimeString('pt-BR')}] Compressão finalizada: ${fileName}.`,
          `[${now.toLocaleTimeString('pt-BR')}] Notificação enviada para os administradores.`,
        ],
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setIsExecutingManual(false);
      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString('pt-BR')}] ✅ Backup concluído com sucesso: ${fileName} (512 KB)`,
      ]);

      addAuditLog(
        'EXECUCAO_BACKUP_MANUAL',
        'vps_backup',
        `Backup manual concluído: ${fileName} (512 KB) na VPS`
      );
    }, 3200);
  };

  const handleDownloadScript = () => {
    const scriptContent = generateBackupShellScript(schedule, vpsConfig);
    const blob = new Blob([scriptContent], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_postgres.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Geradores de código para as abas
  const bashScript = generateBackupShellScript(schedule, vpsConfig);
  const systemdFiles = generateSystemdTimer(schedule);

  const crontabSnippet = `# =============================================================================
# AGENDAMENTO CRON NA VPS (Adicionar via: crontab -e)
# Executa a rotina de backup de acordo com o intervalo definido
# =============================================================================
${currentCron} /usr/local/bin/backup_postgres.sh >> /var/log/postgres_backup.log 2>&1
`;

  const dockerSnippet = `  # Contêiner de Backup Agendado para docker-compose.yml
  db_backup:
    image: prodrigestivill/postgres-backup-local:16-alpine
    container_name: boasnovas_backup_cron
    restart: always
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${vpsConfig.vpsDbName}
      POSTGRES_USER: ${vpsConfig.vpsUser}
      POSTGRES_PASSWORD: sua_senha_secreta_aqui
      SCHEDULE: "${currentCron}"
      BACKUP_KEEP_DAYS: ${schedule.retentionDays}
      BACKUP_SUFFIX: .sql.gz
    volumes:
      - ${schedule.backupPath}:/backups
    depends_on:
      - postgres`;

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Header & KPI Metrics do Agendador                                  */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Rotina Automática</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${schedule.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <p className="text-sm font-bold text-[#F8F5EC]">
                {schedule.enabled ? 'Ativada' : 'Pausada'}
              </p>
            </div>
            <p className="text-[10px] text-[#DAA017] font-mono">{currentCron}</p>
          </div>
        </div>

        <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3A2E1F]/60 border border-[#DAA017]/40 flex items-center justify-center text-[#DAA017] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Próxima Execução</p>
            <p className="text-sm font-bold text-[#F8F5EC]">Hoje às {schedule.executionTime}</p>
            <p className="text-[10px] text-[#F8F5EC]/60">VPS Horário Oficial (BRT)</p>
          </div>
        </div>

        <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3A2E1F]/60 border border-[#DAA017]/40 flex items-center justify-center text-[#DAA017] shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Retenção de Arquivos</p>
            <p className="text-sm font-bold text-[#F8F5EC]">{schedule.retentionDays} dias</p>
            <p className="text-[10px] text-emerald-400 font-mono">Auto-expurgo ativado</p>
          </div>
        </div>

        <div className="card-gold-glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider font-semibold">Formato & Compressão</p>
            <p className="text-sm font-bold text-[#F8F5EC]">{schedule.compression.toUpperCase()} (Nível 9)</p>
            <p className="text-[10px] text-purple-300 font-mono">.sql.gz seguro</p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Painel de Configuração do Agendamento + Ação de Execução Imediata */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal de Agendamento */}
        <div className="lg:col-span-2 card-gold-glass rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAA017]/20 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F8F5EC] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#DAA017]" /> Configuração de Agendamento Periódico
              </h3>
              <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
                Defina a frequência de snapshots automáticos do PostgreSQL na VPS para proteção contra perdas
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-[#1A140E] px-3 py-1.5 rounded-xl border border-[#DAA017]/30">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                className="rounded border-[#DAA017] bg-[#120E0A] text-[#DAA017] focus:ring-0 w-4 h-4"
              />
              <span className="text-xs font-bold text-[#DAA017]">Rotina Ativa</span>
            </label>
          </div>

          {/* Presets de Frequência */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#F8F5EC]/80 block">
              Frequência de Backup:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'daily', label: 'Diário (Madrugada)', cron: '0 3 * * *', icon: Clock },
                { id: 'hourly', label: 'A cada 6 horas', cron: '0 */6 * * *', icon: RefreshCw },
                { id: 'weekly', label: 'Semanal (Domingo)', cron: '0 2 * * 0', icon: Calendar },
                { id: 'custom', label: 'Personalizado', cron: schedule.customCron, icon: Terminal },
              ].map((freq) => {
                const Icon = freq.icon;
                const isSelected = schedule.frequency === freq.id;
                return (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() =>
                      setSchedule({
                        ...schedule,
                        frequency: freq.id as any,
                        customCron: freq.cron,
                      })
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-[#DAA017] text-[#1A1A1A] border-[#DAA017] font-bold shadow-md shadow-[#DAA017]/20'
                        : 'bg-[#1A140E] text-[#F8F5EC]/75 border-[#DAA017]/20 hover:border-[#DAA017]/40 hover:bg-[#2A2015]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-mono opacity-80">{freq.cron}</span>
                    </div>
                    <span className="text-xs">{freq.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horários e Detalhes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Horário de Execução (HH:MM)"
                type="time"
                value={schedule.executionTime}
                onChange={(e) => setSchedule({ ...schedule, executionTime: e.target.value })}
                disabled={schedule.frequency === 'custom'}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#F8F5EC]/80 block mb-1.5">
                Política de Retenção
              </label>
              <select
                value={schedule.retentionDays}
                onChange={(e) => setSchedule({ ...schedule, retentionDays: Number(e.target.value) })}
                className="w-full bg-[#1A140E] text-[#F8F5EC] text-xs rounded-xl px-3 py-2.5 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
              >
                <option value={7}>7 dias (Manter última semana)</option>
                <option value={15}>15 dias (Manter quinzenal)</option>
                <option value={30}>30 dias (Recomendado)</option>
                <option value={60}>60 dias (Bimestral)</option>
                <option value={90}>90 dias (Trimestral)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#F8F5EC]/80 block mb-1.5">
                Compressão do Dump
              </label>
              <select
                value={schedule.compression}
                onChange={(e) => setSchedule({ ...schedule, compression: e.target.value as any })}
                className="w-full bg-[#1A140E] text-[#F8F5EC] text-xs rounded-xl px-3 py-2.5 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
              >
                <option value="gzip">GZIP (.sql.gz - Alta Compressão)</option>
                <option value="zstd">Zstandard (.sql.zst - Ultra Rápido)</option>
                <option value="none">Sem Compressão (.sql Texto Puro)</option>
              </select>
            </div>
          </div>

          {/* Destino do Backup & Diretório na VPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Diretório de Armazenamento na VPS *"
                value={schedule.backupPath}
                onChange={(e) => setSchedule({ ...schedule, backupPath: e.target.value })}
                placeholder="/var/backups/postgres"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#F8F5EC]/80 block mb-1.5">
                Destino do Backup
              </label>
              <select
                value={schedule.targetDestination}
                onChange={(e) => setSchedule({ ...schedule, targetDestination: e.target.value as any })}
                className="w-full bg-[#1A140E] text-[#F8F5EC] text-xs rounded-xl px-3 py-2.5 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
              >
                <option value="local_vps">Volume Local na VPS (/var/backups)</option>
                <option value="s3_compatible">Nuvem AWS S3 / Cloudflare R2</option>
                <option value="sftp_remote">Servidor SFTP Secundário</option>
              </select>
            </div>
          </div>

          {/* Notificações de Alerta */}
          <div className="p-4 rounded-xl bg-[#120E09] border border-[#DAA017]/25 space-y-3">
            <h4 className="text-xs font-bold text-[#DAA017] uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Alertas & Notificações de Conclusão
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="E-mail do Administrador de TI"
                value={schedule.notifyEmail || ''}
                onChange={(e) => setSchedule({ ...schedule, notifyEmail: e.target.value })}
                placeholder="admin@boasnovas.org.br"
              />
              <Input
                label="Webhook URL (Discord / Slack / Telegram)"
                value={schedule.notifyWebhookUrl || ''}
                onChange={(e) => setSchedule({ ...schedule, notifyWebhookUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-[#F8F5EC]/80 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.notifyOnSuccess}
                  onChange={(e) => setSchedule({ ...schedule, notifyOnSuccess: e.target.checked })}
                  className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017] focus:ring-0"
                />
                <span>Notificar em Sucesso</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.notifyOnFailure}
                  onChange={(e) => setSchedule({ ...schedule, notifyOnFailure: e.target.checked })}
                  className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017] focus:ring-0"
                />
                <span>Alertar em caso de Falha (Crítico)</span>
              </label>
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#F8F5EC]/60 font-mono">
              Sintaxe Cron: <span className="text-[#DAA017] font-bold">{currentCron}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" /> Agendamento salvo!
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleSaveSchedule}
                className="w-full sm:w-auto"
              >
                Salvar Agendamento
              </Button>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Executar Backup Imediato + Resumo de Saúde */}
        <div className="space-y-6">
          <div className="card-gold-glass rounded-2xl p-6 space-y-4">
            <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
              <Play className="w-4 h-4 text-[#DAA017]" /> Execução Manual Imediata
            </h4>
            <p className="text-xs text-[#F8F5EC]/70 leading-relaxed">
              Dispare uma rotina completa de backup agora para validar a integridade dos dados e gerar um snapshot pontual.
            </p>

            <Button
              variant="primary"
              size="md"
              icon={isExecutingManual ? RefreshCw : Play}
              onClick={handleTriggerManualBackup}
              isLoading={isExecutingManual}
              className="w-full justify-center shadow-lg shadow-[#DAA017]/20 py-2.5 font-bold"
            >
              {isExecutingManual ? 'Executando pg_dump na VPS...' : 'Executar Backup Agora'}
            </Button>

            {/* Console de Logs em Tempo Real da Execução */}
            {executionLogs.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-[#120E09] border border-[#DAA017]/25 font-mono text-[10.5px] text-emerald-300 space-y-1.5 max-h-40 overflow-y-auto">
                <div className="text-[#DAA017] font-bold text-[10px] uppercase tracking-wider pb-1 border-b border-[#DAA017]/20 flex items-center justify-between">
                  <span>Terminal de Execução VPS</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                {executionLogs.map((log, i) => (
                  <p key={i} className="leading-tight">{log}</p>
                ))}
              </div>
            )}
          </div>

          <div className="card-gold-glass rounded-2xl p-6 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-[#DAA017]" /> Segurança & Imutabilidade
            </h4>
            <ul className="text-xs text-[#F8F5EC]/70 space-y-2">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Snapshots com verificação de integridade <strong>SHA-256</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Permissões restritas de arquivo <code className="text-[#DAA017]">chmod 600</code> na VPS.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Garantia de conformidade com a LGPD eclesiástica.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. Gerador de Scripts de Automação para Implantação na VPS            */}
      {/* --------------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAA017]/20 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#DAA017]" /> Scripts de Automação Gerados para a VPS
            </h3>
            <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
              Copie ou baixe o script pronto para instalar na sua VPS Linux (Ubuntu, Debian, AlmaLinux ou Docker)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadScript}
            >
              Baixar backup_postgres.sh
            </Button>
          </div>
        </div>

        {/* Abas de Tipos de Script */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'cron', label: '1. Cron Tab (Linux Crontab)', icon: Clock },
            { id: 'bash', label: '2. Script Shell (backup_postgres.sh)', icon: FileCode },
            { id: 'systemd', label: '3. Systemd Timer (Nativo)', icon: Server },
            { id: 'docker', label: '4. Docker Compose', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeScriptTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScriptTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-md'
                    : 'bg-[#1A140E] text-[#F8F5EC]/70 hover:bg-[#2A2015] border border-[#DAA017]/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Aba Selecionada */}
        <div className="relative">
          <div className="absolute right-3 top-3 z-10">
            <button
              onClick={() => {
                let content = '';
                if (activeScriptTab === 'cron') content = crontabSnippet;
                else if (activeScriptTab === 'bash') content = bashScript;
                else if (activeScriptTab === 'systemd') content = `${systemdFiles.service}\n\n# --- postgres-backup.timer ---\n${systemdFiles.timer}`;
                else if (activeScriptTab === 'docker') content = dockerSnippet;

                handleCopy(content, activeScriptTab);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2A2015] hover:bg-[#3A2E1F] text-[#DAA017] text-xs font-semibold border border-[#DAA017]/40 shadow transition-all"
            >
              {copiedId === activeScriptTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar Código
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#120E09] border border-[#DAA017]/25 font-mono text-xs text-[#F8F5EC]/90 overflow-x-auto whitespace-pre leading-relaxed max-h-72">
            {activeScriptTab === 'cron' && crontabSnippet}
            {activeScriptTab === 'bash' && bashScript}
            {activeScriptTab === 'systemd' && `${systemdFiles.service}\n\n# --- postgres-backup.timer ---\n${systemdFiles.timer}`}
            {activeScriptTab === 'docker' && dockerSnippet}
          </pre>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. Histórico de Backups Executados na VPS                             */}
      {/* --------------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-[#DAA017]" /> Histórico de Backups na VPS
            </h3>
            <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
              Logs e snapshots gerados pelo agendador ou execuções manuais
            </p>
          </div>
          <Badge variant="gold" size="sm">
            {history.length} Snapshots
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DAA017]/20 text-[#DAA017] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Data / Hora</th>
                <th className="py-3 px-3">Arquivo Snapshot</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Tamanho</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAA017]/10">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-[#3A2E1F]/20 transition-colors">
                  <td className="py-3 px-3 font-mono text-[#F8F5EC]/90">
                    {new Date(item.executedAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-emerald-300 font-medium truncate block max-w-xs">
                      {item.fileName}
                    </span>
                    <span className="text-[10px] text-[#F8F5EC]/40 truncate block">
                      SHA: {item.checksum.slice(0, 16)}...
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={item.type === 'scheduled' ? 'gold' : 'blue'} size="sm">
                      {item.type === 'scheduled' ? 'Agendado (Cron)' : 'Manual'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#F8F5EC]">
                    {item.sizeFormatted}
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedLogHistory(item)}
                        className="px-2 py-1 rounded bg-[#1A140E] hover:bg-[#2A2015] text-[#DAA017] border border-[#DAA017]/30 text-[11px] font-medium transition-colors"
                      >
                        Ver Logs
                      </button>
                      <button
                        onClick={() => {
                          // Simula download do snapshot
                          const dummyContent = `-- Snapshot PostgreSQL: ${item.fileName}\n-- Data: ${item.executedAt}\n-- Checksum: ${item.checksum}\n`;
                          const blob = new Blob([dummyContent], { type: 'application/gzip' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = item.fileName;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-1.5 rounded bg-[#3A2E1F] hover:bg-[#DAA017] text-[#DAA017] hover:text-black transition-all"
                        title="Baixar Snapshot"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes dos Logs */}
      {selectedLogHistory && (
        <Modal
          isOpen={Boolean(selectedLogHistory)}
          onClose={() => setSelectedLogHistory(null)}
          title={`Log de Execução: ${selectedLogHistory.fileName}`}
          subtitle={`Executado em ${new Date(selectedLogHistory.executedAt).toLocaleString('pt-BR')} (${selectedLogHistory.sizeFormatted})`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#1A140E] p-3 rounded-xl border border-[#DAA017]/20">
              <div>
                <span className="text-[#F8F5EC]/50 block">Destino:</span>
                <span className="text-[#F8F5EC] font-mono">{selectedLogHistory.destination}</span>
              </div>
              <div>
                <span className="text-[#F8F5EC]/50 block">Duração da Execução:</span>
                <span className="text-[#DAA017] font-mono">{selectedLogHistory.durationSeconds} segundos</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#F8F5EC]/50 block">SHA256 Checksum:</span>
                <span className="text-emerald-400 font-mono text-[11px] break-all">{selectedLogHistory.checksum}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-[#DAA017] mb-2 uppercase tracking-wider">Passos Registrados:</h5>
              <div className="p-3.5 rounded-xl bg-[#120E09] border border-[#DAA017]/30 font-mono text-xs text-emerald-300 space-y-1.5">
                {selectedLogHistory.logs.map((step, idx) => (
                  <p key={idx}>{step}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLogHistory(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
