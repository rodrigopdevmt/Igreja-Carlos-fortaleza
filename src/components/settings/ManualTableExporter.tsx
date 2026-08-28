import React, { useState } from 'react';
import {
  Database,
  Download,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Eye,
  Check,
  Copy,
  Terminal,
  Shield,
  Filter,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  Search,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  TableExportItem,
  getAvailableExportTables,
  generateSqlDumpForTables,
  generateCsvForTable,
  generateJsonForTables,
  generatePgDumpCommand,
} from '@/services/vpsBackupService';
import { useChurch } from '@/context/ChurchContext';

interface ManualTableExporterProps {
  vpsConfig: {
    vpsHost: string;
    vpsPort: string;
    vpsDbName: string;
    vpsUser: string;
  };
}

export const ManualTableExporter: React.FC<ManualTableExporterProps> = ({ vpsConfig }) => {
  const {
    currentTenant,
    members,
    credentials,
    donations,
    transactions,
    events,
    cameras,
    liveStream,
    liveChatMessages,
    groups,
    classes,
    auditLogs,
    addAuditLog,
  } = useChurch();

  const allTables = getAvailableExportTables({
    tenant: currentTenant,
    members,
    credentials,
    donations,
    transactions,
    events,
    cameras,
    liveStream,
    liveChatMessages,
    groups,
    classes,
    auditLogs,
  });

  // Filtros e seleção
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([
    'members',
    'transactions',
    'donations',
    'credentials',
  ]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'membros' | 'financeiro' | 'transmissoes' | 'estrutura' | 'seguranca'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Opções de Exportação
  const [exportFormat, setExportFormat] = useState<'sql' | 'csv' | 'json' | 'cli'>('sql');
  const [includeOnConflict, setIncludeOnConflict] = useState(true);
  const [includeDropTable, setIncludeDropTable] = useState(false);
  const [maskSensitive, setMaskSensitive] = useState(false);

  // Estados de UI
  const [previewTable, setPreviewTable] = useState<TableExportItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Filtra as tabelas
  const filteredTables = allTables.filter((t) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sqlTableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle de seleção
  const toggleSelectTable = (id: string) => {
    setSelectedTableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedTableIds(allTables.map((t) => t.id));
  };

  const handleSelectCore = () => {
    setSelectedTableIds(['members', 'credentials', 'transactions', 'donations', 'events']);
  };

  const handleClearSelection = () => {
    setSelectedTableIds([]);
  };

  // Exportação em Lote
  const handleExportSelectedTables = () => {
    const tablesToExport = allTables.filter((t) => selectedTableIds.includes(t.id));
    if (tablesToExport.length === 0) return;

    const dateStr = new Date().toISOString().slice(0, 10);

    if (exportFormat === 'sql') {
      const sqlContent = generateSqlDumpForTables(tablesToExport, {
        includeDropTable,
        includeOnConflict,
        maskSensitive,
        tenantId: currentTenant.id,
      });

      downloadFile(
        sqlContent,
        `boas_novas_export_${tablesToExport.length}_tabelas_${dateStr}.sql`,
        'text/sql'
      );
    } else if (exportFormat === 'json') {
      const jsonContent = generateJsonForTables(tablesToExport, maskSensitive);
      downloadFile(
        jsonContent,
        `boas_novas_export_${tablesToExport.length}_tabelas_${dateStr}.json`,
        'application/json'
      );
    } else if (exportFormat === 'csv') {
      // Exporta a primeira tabela ou combina
      tablesToExport.forEach((table) => {
        const csvContent = generateCsvForTable(table, maskSensitive);
        downloadFile(
          csvContent,
          `tabela_${table.sqlTableName}_${dateStr}.csv`,
          'text/csv'
        );
      });
    }

    addAuditLog(
      'EXPORTACAO_TABELAS_MANUAL',
      'database',
      `Exportadas ${tablesToExport.length} tabelas (${tablesToExport.map((t) => t.sqlTableName).join(', ')}) no formato ${exportFormat.toUpperCase()}`
    );

    setExportSuccessMessage(`Exportação de ${tablesToExport.length} tabelas gerada com sucesso!`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  // Exportação de Tabela Individual
  const handleExportSingleTable = (table: TableExportItem, format: 'sql' | 'csv' | 'json') => {
    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === 'sql') {
      const sql = generateSqlDumpForTables([table], {
        includeDropTable,
        includeOnConflict,
        maskSensitive,
        tenantId: currentTenant.id,
      });
      downloadFile(sql, `tabela_${table.sqlTableName}_${dateStr}.sql`, 'text/sql');
    } else if (format === 'csv') {
      const csv = generateCsvForTable(table, maskSensitive);
      downloadFile(csv, `tabela_${table.sqlTableName}_${dateStr}.csv`, 'text/csv');
    } else if (format === 'json') {
      const json = generateJsonForTables([table], maskSensitive);
      downloadFile(json, `tabela_${table.sqlTableName}_${dateStr}.json`, 'application/json');
    }

    addAuditLog(
      'EXPORTACAO_TABELA_INDIVIDUAL',
      'database',
      `Tabela '${table.sqlTableName}' exportada (${table.recordsCount} registros) em ${format.toUpperCase()}`
    );
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Comando CLI pg_dump
  const cliCommand = generatePgDumpCommand({
    vpsHost: vpsConfig.vpsHost,
    vpsPort: vpsConfig.vpsPort,
    vpsUser: vpsConfig.vpsUser,
    vpsDbName: vpsConfig.vpsDbName,
    tableNames: selectedTableIds.map((id) => {
      const found = allTables.find((t) => t.id === id);
      return found ? found.sqlTableName : id;
    }),
    format: 'plain',
    compressed: false,
  });

  const selectedTablesList = allTables.filter((t) => selectedTableIds.includes(t.id));
  const totalSelectedRecords = selectedTablesList.reduce((acc, t) => acc + t.recordsCount, 0);

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Header & Resumo das Tabelas Disponíveis                            */}
      {/* --------------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAA017]/20 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F8F5EC] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#DAA017]" /> Exportação Manual de Tabelas do PostgreSQL (VPS)
            </h3>
            <p className="text-xs text-[#F8F5EC]/60 mt-0.5">
              Selecione as entidades da igreja para extrair dados em SQL (DML), CSV, JSON ou gerar comandos para pg_dump
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="gold" size="md">
              {selectedTableIds.length} de {allTables.length} Tabelas Selecionadas
            </Badge>
          </div>
        </div>

        {/* Barra de Ações Rápidas & Formato de Exportação */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4 flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-[#DAA017] hover:underline px-2.5 py-1.5 rounded-lg bg-[#1A140E] border border-[#DAA017]/30"
            >
              Selecionar Todas
            </button>
            <button
              onClick={handleSelectCore}
              className="text-xs font-semibold text-[#F8F5EC]/80 hover:text-[#DAA017] px-2.5 py-1.5 rounded-lg bg-[#1A140E] border border-[#DAA017]/20"
            >
              Principais (Rol & Tesouraria)
            </button>
            <button
              onClick={handleClearSelection}
              className="text-xs text-[#F8F5EC]/50 hover:text-rose-400 px-2 py-1.5"
            >
              Limpar
            </button>
          </div>

          {/* Seletor de Formato */}
          <div className="lg:col-span-5 flex items-center gap-1.5 bg-[#1A140E] p-1.5 rounded-xl border border-[#DAA017]/30">
            <span className="text-[11px] text-[#F8F5EC]/60 px-2 font-semibold uppercase">Formato:</span>
            {[
              { id: 'sql', label: 'SQL (.sql)', icon: FileCode },
              { id: 'csv', label: 'CSV (.csv)', icon: FileSpreadsheet },
              { id: 'json', label: 'JSON (.json)', icon: FileJson },
              { id: 'cli', label: 'pg_dump CLI', icon: Terminal },
            ].map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = exportFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-sm'
                      : 'text-[#F8F5EC]/70 hover:bg-[#2A2015]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Botão de Disparo */}
          <div className="lg:col-span-3 flex justify-end">
            <Button
              variant="primary"
              size="md"
              icon={Download}
              onClick={handleExportSelectedTables}
              disabled={selectedTableIds.length === 0}
              className="w-full sm:w-auto font-bold shadow-md shadow-[#DAA017]/20"
            >
              Exportar ({totalSelectedRecords} registros)
            </Button>
          </div>
        </div>

        {/* Opções Avançadas de Formatação */}
        <div className="pt-2 border-t border-[#DAA017]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#F8F5EC]/80">
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOnConflict}
                onChange={(e) => setIncludeOnConflict(e.target.checked)}
                className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017] focus:ring-0"
              />
              <span>Incluir <code className="text-[#DAA017]">ON CONFLICT DO NOTHING</code></span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDropTable}
                onChange={(e) => setIncludeDropTable(e.target.checked)}
                className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017] focus:ring-0"
              />
              <span>Incluir <code className="text-rose-400">DROP TABLE IF EXISTS</code></span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#DAA017]">
              <input
                type="checkbox"
                checked={maskSensitive}
                onChange={(e) => setMaskSensitive(e.target.checked)}
                className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017] focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Mascarar Dados Pessoais / LGPD
              </span>
            </label>
          </div>

          {exportSuccessMessage && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-fadeIn">
              <Check className="w-4 h-4" /> {exportSuccessMessage}
            </span>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Visualizador do Comando CLI pg_dump (se selecionado)               */}
      {/* --------------------------------------------------------------------- */}
      {exportFormat === 'cli' && (
        <div className="card-gold-glass rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#DAA017]" /> Comando Direto para Executar via SSH no Terminal da VPS
            </h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(cliCommand);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 3000);
              }}
              className="flex items-center gap-1 text-xs text-[#DAA017] hover:underline font-mono"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar Comando
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-[#120E09] border border-[#DAA017]/30 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
            {cliCommand}
          </pre>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. Filtro por Categoria & Busca de Tabelas                            */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todas as Tabelas' },
            { id: 'membros', label: 'Membros & Rol' },
            { id: 'financeiro', label: 'Tesouraria & Dízimos' },
            { id: 'transmissoes', label: 'Lives & Chat' },
            { id: 'estrutura', label: 'Células & Agenda' },
            { id: 'seguranca', label: 'Segurança & Auditoria' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/20'
                  : 'bg-[#1A140E] text-[#F8F5EC]/70 hover:bg-[#2A2015] border border-[#DAA017]/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar tabela..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A140E] text-[#F8F5EC] text-xs placeholder-[#F8F5EC]/40 rounded-xl px-3 py-2 pl-8 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
          />
          <Search className="w-3.5 h-3.5 text-[#DAA017] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. Grade de Tabelas Interativa                                        */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map((table) => {
          const isSelected = selectedTableIds.includes(table.id);

          return (
            <div
              key={table.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#221B13]/95 border-[#DAA017] shadow-[0_0_20px_rgba(218,160,23,0.15)]'
                  : 'bg-[#1A140E]/80 border-[#DAA017]/20 hover:border-[#DAA017]/40'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSelectTable(table.id)}
                      className="text-[#DAA017] hover:scale-110 transition-transform"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#DAA017]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#F8F5EC]/40" />
                      )}
                    </button>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-1.5">
                        {table.name}
                      </h4>
                      <code className="text-[10px] text-emerald-400 font-mono">
                        public.{table.sqlTableName}
                      </code>
                    </div>
                  </div>

                  <Badge variant={table.recordsCount > 0 ? 'gold' : 'gray'} size="sm">
                    {table.recordsCount} itens
                  </Badge>
                </div>

                <p className="text-xs text-[#F8F5EC]/70 line-clamp-2 mb-3">
                  {table.description}
                </p>

                {/* Tags de Colunas & Tamanho */}
                <div className="flex items-center justify-between text-[10.5px] text-[#F8F5EC]/50 border-t border-[#DAA017]/10 pt-2 mb-4 font-mono">
                  <span>{table.columns.length} colunas</span>
                  <span className="text-[#DAA017]">{table.sizeFormatted}</span>
                </div>
              </div>

              {/* Ações por Tabela */}
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#DAA017]/15">
                <button
                  onClick={() => setPreviewTable(table)}
                  className="flex items-center gap-1 text-[11px] text-[#DAA017] hover:underline font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" /> Pré-visualizar
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportSingleTable(table, 'sql')}
                    className="p-1.5 rounded-lg bg-[#2A2015] hover:bg-[#DAA017] text-[#DAA017] hover:text-black transition-all"
                    title="Baixar SQL (.sql)"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportSingleTable(table, 'csv')}
                    className="p-1.5 rounded-lg bg-[#2A2015] hover:bg-[#DAA017] text-[#DAA017] hover:text-black transition-all"
                    title="Baixar CSV (.csv)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportSingleTable(table, 'json')}
                    className="p-1.5 rounded-lg bg-[#2A2015] hover:bg-[#DAA017] text-[#DAA017] hover:text-black transition-all"
                    title="Baixar JSON (.json)"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Modal de Pré-visualização de Dados da Tabela                       */}
      {/* --------------------------------------------------------------------- */}
      {previewTable && (
        <Modal
          isOpen={Boolean(previewTable)}
          onClose={() => setPreviewTable(null)}
          title={`Pré-visualização: ${previewTable.name}`}
          subtitle={`Tabela 'public.${previewTable.sqlTableName}' com ${previewTable.recordsCount} registros (${previewTable.sizeFormatted})`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-2">
              <span className="text-xs text-[#F8F5EC]/70">
                Mostrando os primeiros registros formatados para exportação:
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileCode}
                  onClick={() => handleExportSingleTable(previewTable, 'sql')}
                >
                  Baixar .SQL
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={FileSpreadsheet}
                  onClick={() => handleExportSingleTable(previewTable, 'csv')}
                >
                  Baixar .CSV
                </Button>
              </div>
            </div>

            {/* Tabela de Dados */}
            <div className="overflow-x-auto max-h-80 rounded-xl border border-[#DAA017]/20 bg-[#120E09]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A140E] sticky top-0 border-b border-[#DAA017]/25 text-[#DAA017] uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    {previewTable.columns.slice(0, 6).map((col) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DAA017]/10 font-mono text-[11px]">
                  {previewTable.getData().slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#2A2015]/40 transition-colors">
                      {previewTable.columns.slice(0, 6).map((col) => (
                        <td key={col} className="py-2 px-3 text-[#F8F5EC]/85 whitespace-nowrap max-w-xs truncate">
                          {typeof row[col] === 'boolean'
                            ? row[col]
                              ? 'TRUE'
                              : 'FALSE'
                            : typeof row[col] === 'object'
                            ? JSON.stringify(row[col])
                            : String(row[col] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#F8F5EC]/50 font-mono">
                Total no banco: {previewTable.recordsCount} registros
              </span>
              <Button variant="outline" size="sm" onClick={() => setPreviewTable(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
