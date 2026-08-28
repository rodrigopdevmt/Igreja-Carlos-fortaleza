import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Calendar,
  Filter,
  Layers,
  Sparkles,
  TrendingUp,
  CircleDollarSign,
  Heart,
  Building,
  Lock,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useChurch } from '@/context/ChurchContext';
import {
  fetchFinancialTransactionsFromApi,
  FinancialReportApiData,
  getApiBaseUrl,
} from '@/services/api';
import {
  exportFinancialReportToPdf,
  exportFinancialReportToCsv,
} from '@/services/financialExport';

interface FinancialExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialExportModal: React.FC<FinancialExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { donations, transactions, currentTenant } = useChurch();

  const [reportData, setReportData] = useState<FinancialReportApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingType, setExportingType] = useState<'pdf' | 'csv' | 'print' | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'tithe' | 'offering' | 'missions' | 'building_campaign'>('all');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const apiUrl = getApiBaseUrl();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFinancialTransactionsFromApi({
        donations,
        transactions,
        currentTenant,
      });
      setReportData(data);
    } catch (err) {
      console.error('Erro ao buscar dados da API financeira:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSuccessMessage('');
    }
  }, [isOpen, donations, transactions, currentTenant]);

  if (!isOpen) return null;

  // Filtra transações se o usuário escolheu uma categoria específica
  const filteredReportData: FinancialReportApiData | null = reportData
    ? {
        ...reportData,
        transactions:
          filterCategory === 'all'
            ? reportData.transactions
            : reportData.transactions.filter((t) => t.type === filterCategory),
      }
    : null;

  const handleExportPdf = () => {
    if (!filteredReportData) return;
    setExportingType('pdf');
    try {
      exportFinancialReportToPdf(filteredReportData);
      setSuccessMessage('Relatório PDF oficial gerado e baixado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportCsv = () => {
    if (!filteredReportData) return;
    setExportingType('csv');
    try {
      exportFinancialReportToCsv(filteredReportData);
      setSuccessMessage('Planilha CSV (Excel/Sheets) exportada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Erro ao gerar CSV:', err);
    } finally {
      setExportingType(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportação de Relatório Financeiro"
      subtitle="Balancete Analítico de Dízimos, Ofertas e Missões (PDF / CSV)"
      maxWidth="2xl"
    >
      <div id="financial-export-modal-content" className="space-y-5">
        {/* API Status Banner */}
        <div className="p-3.5 rounded-xl bg-[#120E0A] border border-[#DAA017]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[#F8F5EC] font-semibold">Fonte dos Dados: </span>
              <span className="font-mono text-[#DAA017]">{apiUrl}/api/finance/transactions</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {reportData?.serverInfo.latencyMs ? `${reportData.serverInfo.latencyMs}ms` : 'Sincronizado'}
            </Badge>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1 rounded text-[#DAA017] hover:bg-[#DAA017]/20 transition-colors"
              title="Recarregar da API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Resumo Consolidado do Relatório */}
        {filteredReportData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/20">
              <span className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider block">Dízimos</span>
              <span className="font-serif font-bold text-sm text-[#DAA017]">
                {formatCurrency(filteredReportData.summary.totalTithes)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/20">
              <span className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider block">Ofertas & Missões</span>
              <span className="font-serif font-bold text-sm text-[#FFE898]">
                {formatCurrency(
                  filteredReportData.summary.totalOfferings + filteredReportData.summary.totalMissions
                )}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/20">
              <span className="text-[10px] text-[#F8F5EC]/60 uppercase tracking-wider block">Campanhas</span>
              <span className="font-serif font-bold text-sm text-emerald-400">
                {formatCurrency(filteredReportData.summary.totalBuildingCampaign)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Receita Total</span>
              <span className="font-serif font-bold text-sm text-emerald-300">
                {formatCurrency(filteredReportData.summary.totalIncome)}
              </span>
            </div>
          </div>
        )}

        {/* Filtros de Escopo do Relatório */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#DAA017] uppercase tracking-wider">
            Escopo da Exportação:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'all', label: 'Todos os Lançamentos' },
              { id: 'tithe', label: 'Apenas Dízimos' },
              { id: 'offering', label: 'Ofertas de Altar' },
              { id: 'missions', label: 'Missões Sociais' },
              { id: 'building_campaign', label: 'Campanha Templo' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterCategory(opt.id as any)}
                className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-center border ${
                  filterCategory === opt.id
                    ? 'bg-[#DAA017] text-[#1A1A1A] border-[#DAA017] font-bold shadow-md'
                    : 'bg-[#1A1A1A] text-[#F8F5EC]/70 border-[#DAA017]/20 hover:border-[#DAA017]/50 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Pré-visualização Rápida dos Registros */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#F8F5EC]/70">
            <span>Pré-visualização do Relatório ({filteredReportData?.transactions.length || 0} lançamentos selecionados)</span>
            <span className="font-mono text-[#DAA017]">
              Total: {formatCurrency(
                (filteredReportData?.transactions || []).reduce((acc, t) => acc + (t.type === 'expense' ? 0 : t.amount), 0)
              )}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl bg-[#120E0A] border border-[#DAA017]/20 divide-y divide-[#DAA017]/10 text-xs">
            {(filteredReportData?.transactions || []).slice(0, 8).map((tx) => (
              <div key={tx.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-[#1A1A1A]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#DAA017]">{tx.receiptNumber}</span>
                    <span className="font-bold text-[#F8F5EC] truncate">{tx.donorOrBeneficiary}</span>
                  </div>
                  <div className="text-[11px] text-[#F8F5EC]/50 flex items-center gap-2">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span>{tx.typeName}</span>
                    <span>•</span>
                    <span className="text-[#DAA017]">{tx.paymentMethodLabel}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono font-bold">
                  <span className={tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}>
                    {tx.type === 'expense' ? '-' : '+'} {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
            {(filteredReportData?.transactions || []).length > 8 && (
              <div className="p-2 text-center text-[11px] text-[#F8F5EC]/50 bg-[#16120D]">
                + {(filteredReportData?.transactions.length || 0) - 8} outros lançamentos incluídos no documento exportado
              </div>
            )}
          </div>
        </div>

        {/* Feedback de Sucesso */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botões de Ação de Exportação (PDF / CSV / Imprimir) */}
        <div className="pt-3 border-t border-[#DAA017]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </Button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={FileSpreadsheet}
              onClick={handleExportCsv}
              disabled={loading || exportingType !== null || !filteredReportData}
              className="text-xs border-[#DAA017]/40 hover:border-[#DAA017] text-[#DAA017]"
            >
              {exportingType === 'csv' ? 'Gerando CSV...' : 'Exportar CSV (Excel)'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={FileText}
              onClick={handleExportPdf}
              disabled={loading || exportingType !== null || !filteredReportData}
              className="text-xs shadow-lg"
            >
              {exportingType === 'pdf' ? 'Gerando PDF Oficial...' : 'Exportar Relatório PDF'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FinancialExportModal;
