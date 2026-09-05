import React, { useState } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Download,
  Receipt,
  Heart,
  Building,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle,
  FileText,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useChurch, Donation, Transaction } from '@/context/ChurchContext';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FinancialExportModal } from '@/components/finance/FinancialExportModal';
import {
  fetchFinancialTransactionsFromApi,
  getApiBaseUrl,
} from '@/services/api';
import {
  exportFinancialReportToPdf,
  exportFinancialReportToCsv,
} from '@/services/financialExport';

const monthlyFinanceFlow = [
  { month: 'Jan', income: 42000, expense: 12000 },
  { month: 'Fev', income: 45000, expense: 14500 },
  { month: 'Mar', income: 43800, expense: 13200 },
  { month: 'Abr', income: 47200, expense: 15000 },
  { month: 'Mai', income: 46100, expense: 12800 },
  { month: 'Jun', income: 49000, expense: 16200 },
  { month: 'Jul', income: 48500, expense: 14100 },
  { month: 'Ago', income: 52390, expense: 12850 },
];

const categoryPieData = [
  { name: 'Dízimos Pastorais & Membros', value: 45890, color: '#DAA017' },
  { name: 'Ofertas Gerais de Altar', value: 14850, color: '#FFE898' },
  { name: 'Campanha de Expansão', value: 12500, color: '#B8860B' },
  { name: 'Missões & Ação Social', value: 8350, color: '#855E09' },
];

export const FinancePage: React.FC = () => {
  const {
    donations,
    transactions,
    addDonation,
    addTransaction,
    currentTenant,
    financialMetrics,
    stats,
  } = useChurch();

  const [modalOpen, setModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [directExportLoading, setDirectExportLoading] = useState<'pdf' | 'csv' | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);
  const [filterType, setFilterType] = useState('all');

  // Form State
  const [amount, setAmount] = useState('');
  const [personName, setPersonName] = useState('');
  const [type, setType] = useState<'tithe' | 'offering' | 'missions' | 'building_campaign'>('tithe');
  const [method, setMethod] = useState<'pix' | 'credit_card' | 'cash' | 'transfer'>('pix');
  const [notes, setNotes] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'income') return t.type === 'income';
    if (filterType === 'expense') return t.type === 'expense';
    return true;
  });

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    addDonation({
      person_id: null,
      person_name: personName.trim() || 'Ofertante Anônimo',
      amount: val,
      type: type as any,
      payment_method: method as any,
      date: new Date().toISOString(),
      notes: notes || 'Lançamento registrado na tesouraria',
    });

    setAmount('');
    setPersonName('');
    setNotes('');
    setModalOpen(false);
  };

  const handleDirectPdfExport = async () => {
    setDirectExportLoading('pdf');
    try {
      const data = await fetchFinancialTransactionsFromApi({
        donations,
        transactions,
        currentTenant,
      });
      exportFinancialReportToPdf(data);
    } catch (err) {
      console.error('Falha ao exportar PDF direto:', err);
    } finally {
      setDirectExportLoading(null);
    }
  };

  const handleDirectCsvExport = async () => {
    setDirectExportLoading('csv');
    try {
      const data = await fetchFinancialTransactionsFromApi({
        donations,
        transactions,
        currentTenant,
      });
      exportFinancialReportToCsv(data);
    } catch (err) {
      console.error('Falha ao exportar CSV direto:', err);
    } finally {
      setDirectExportLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Gestão Financeira & Tesouraria
            </h1>
            <Badge variant="gold" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" /> Auditoria RLS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Controle transparente de dízimos, ofertas, missões internacionais e despesas operacionais
          </p>
        </div>

        {/* Action Button Group with Export Menu & New Entry */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Export Button that opens the Full Export Studio */}
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => setExportModalOpen(true)}
            className="border-[#DAA017]/40 hover:border-[#DAA017] shadow-sm text-xs font-semibold"
          >
            <span className="hidden sm:inline">Exportar</span> Relatório (PDF/CSV)
          </Button>

          {/* Quick 1-click Download Actions */}
          <div className="hidden lg:flex items-center bg-[#1A1A1A] p-0.5 rounded-xl border border-[#DAA017]/25 text-xs">
            <button
              onClick={handleDirectPdfExport}
              disabled={directExportLoading !== null}
              className="px-2.5 py-1.5 rounded-lg text-[#DAA017] hover:bg-[#3A2E1F] transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
              title="Download Direto do PDF Oficial de Dízimos e Ofertas"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{directExportLoading === 'pdf' ? 'PDF...' : 'PDF'}</span>
            </button>
            <span className="text-[#DAA017]/30">|</span>
            <button
              onClick={handleDirectCsvExport}
              disabled={directExportLoading !== null}
              className="px-2.5 py-1.5 rounded-lg text-[#FFE898] hover:bg-[#3A2E1F] transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
              title="Download Direto do CSV para Excel e Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{directExportLoading === 'csv' ? 'CSV...' : 'CSV'}</span>
            </button>
          </div>

          <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          id="fin-tithes"
          title="Dízimos Arrecadados"
          value={formatCurrency(stats.monthlyTithes)}
          subtitle="Entradas consolidadas no mês"
          icon={CircleDollarSign}
          trend={{ value: '14.2% vs mês ant.', positive: true }}
          highlight={true}
        />
        <MetricCard
          id="fin-offerings"
          title="Ofertas & Missões"
          value={formatCurrency(financialMetrics.totalOfferings + financialMetrics.totalMissions + 14850)}
          subtitle="Ação social e bases no exterior"
          icon={Heart}
          trend={{ value: 'Meta de Missões 100%', positive: true }}
        />
        <MetricCard
          id="fin-expenses"
          title="Despesas Operacionais"
          value={formatCurrency(financialMetrics.totalExpenses)}
          subtitle="Manutenção, som, mídia e água/luz"
          icon={TrendingDown}
          trend={{ value: '-5.1% sob orçamento', positive: true }}
        />
        <MetricCard
          id="fin-balance"
          title="Saldo Líquido em Caixa"
          value={formatCurrency(52390 - 12850)}
          subtitle="Disponível em conta bancária"
          icon={TrendingUp}
          trend={{ value: 'Superávit Saudável', positive: true }}
        />
      </div>

      {/* Active Campaign Progress Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#3A2E1F]/90 via-[#261E14] to-[#1A1A1A] border border-[#DAA017]/35 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#DAA017]/20 border border-[#DAA017] text-[#DAA017]">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
                Campanha Apostólica: Aquisição do Painel de LED & Reforma da Nave
              </h3>
              <p className="text-xs text-[#F8F5EC]/60">
                Meta do projeto: {formatCurrency(150000)} • Encerramento em Dezembro de 2026
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-serif text-2xl font-bold text-gold-gradient">
              {formatCurrency(98500)}
            </span>
            <p className="text-[11px] text-emerald-400 font-semibold">65.6% Arrecadado</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-[#1A1A1A] overflow-hidden border border-[#DAA017]/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#DAA017] to-[#FFE898] transition-all duration-500 shadow-[0_0_15px_rgba(218,160,23,0.5)]"
            style={{ width: '65.6%' }}
          />
        </div>
      </div>

      {/* Charts Section: Inflow vs Outflow & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#221B13]/90 border border-[#DAA017]/25 p-6 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-[#F8F5EC] mb-1">
            Fluxo de Caixa Mensal (Entradas vs Saídas)
          </h3>
          <p className="text-xs text-[#F8F5EC]/60 mb-6">
            Histórico financeiro consolidado dos últimos 8 meses
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinanceFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC70', fontSize: 12 }} />
                <YAxis stroke="#F8F5EC40" tick={{ fill: '#F8F5EC70', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    borderColor: '#DAA017',
                    borderRadius: '0.75rem',
                    color: '#F8F5EC',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatCurrency(val), '']}
                />
                <Bar dataKey="income" name="Entradas" fill="#DAA017" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Saídas" fill="#991B1B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-[#221B13]/90 border border-[#DAA017]/25 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F8F5EC] mb-1">
              Origem das Entradas
            </h3>
            <p className="text-xs text-[#F8F5EC]/60 mb-4">
              Distribuição por categoria
            </p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    borderColor: '#DAA017',
                    borderRadius: '0.75rem',
                    color: '#F8F5EC',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatCurrency(val), 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#DAA017]/20 text-xs">
            {categoryPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#F8F5EC]/80 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono text-[#DAA017] font-semibold">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions & Donations Table */}
      <div className="rounded-2xl bg-[#221B13]/90 border border-[#DAA017]/25 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
              Extrato de Movimentações
            </h3>
            <p className="text-xs text-[#F8F5EC]/60">
              Registros com recibo digital e trilha de auditoria
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#DAA017]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3 py-1.5 text-xs border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
            >
              <option value="all">Todas as Movimentações</option>
              <option value="income">Apenas Entradas</option>
              <option value="expense">Apenas Despesas</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DAA017]/20 text-[#DAA017] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Tipo / Categoria</th>
                <th className="py-3 px-3">Descrição / Origem</th>
                <th className="py-3 px-3">Forma</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAA017]/10">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-[#3A2E1F]/30 transition-colors">
                    <td className="py-3 px-3 text-[#F8F5EC]/70">{formatDate(tx.date)}</td>
                    <td className="py-3 px-3">
                      <Badge variant={isIncome ? 'gold' : 'danger'} size="sm">
                        {tx.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-medium text-[#F8F5EC] max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 text-[#F8F5EC]/60 uppercase text-[11px]">
                      {tx.payment_method}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-bold text-right ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          const don = donations.find((d) => d.amount === tx.amount) || donations[0];
                          setSelectedReceipt(don);
                        }}
                        className="p-2.5 rounded-lg text-[#DAA017] hover:bg-[#DAA017]/20 transition-colors"
                        title="Ver Recibo Eclesiástico"
                      >
                        <Receipt className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div key={tx.id} className="card-gold-glass rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F8F5EC]/60">{formatDate(tx.date)}</span>
                  <Badge variant={isIncome ? 'gold' : 'danger'} size="sm">{tx.category}</Badge>
                </div>
                <p className="text-sm font-medium text-[#F8F5EC] truncate">{tx.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F8F5EC]/60 uppercase">{tx.payment_method}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => {
                        const don = donations.find((d) => d.amount === tx.amount) || donations[0];
                        setSelectedReceipt(don);
                      }}
                      className="p-2.5 rounded-lg text-[#DAA017] hover:bg-[#DAA017]/20 transition-colors"
                      title="Ver Recibo"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar Lançamento Financeiro"
        subtitle="Entrada de Dízimo, Oferta ou Despesa Operacional"
      >
        <form onSubmit={handleCreateDonation} className="space-y-4">
          <Input
            label="Valor em Reais (R$) *"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Nome do Dizimista / Ofertante / Fornecedor"
            placeholder="Nome ou 'Anônimo'"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
                Categoria *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              >
                <option value="tithe">Dízimo Bíblico</option>
                <option value="offering">Oferta Voluntária de Altar</option>
                <option value="missions">Missões & Ação Social</option>
                <option value="building_campaign">Campanha do Templo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
                Meio de Pagamento *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              >
                <option value="pix">PIX Chave CNPJ</option>
                <option value="credit_card">Cartão Débito / Crédito</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="transfer">TED / Transferência Bancária</option>
              </select>
            </div>
          </div>

          <Input
            label="Observações / Justificativa"
            placeholder="ex: Referente ao mês de Agosto / Culto da Família"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAA017]/20">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirmar Lançamento & Gerar Recibo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Visualizador de Recibo Eclesiástico */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title="Recibo Eclesiástico Digital"
          subtitle={selectedReceipt.receipt_number}
          maxWidth="md"
        >
          <div className="space-y-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/40">
            <div className="text-center pb-3 border-b border-[#DAA017]/20">
              <h4 className="font-serif text-base font-bold text-gold-gradient">
                IGREJA APOSTÓLICA BOAS NOVAS
              </h4>
              <p className="text-[10px] text-[#F8F5EC]/60">{currentTenant.name}</p>
              <p className="font-mono text-xs text-[#DAA017] mt-1 font-bold">
                {selectedReceipt.receipt_number}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#3A2E1F]">
                <span className="text-[#F8F5EC]/60">Dizimista / Ofertante:</span>
                <span className="font-bold text-[#F8F5EC]">{selectedReceipt.person_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#3A2E1F]">
                <span className="text-[#F8F5EC]/60">Finalidade:</span>
                <span className="font-bold text-[#DAA017] uppercase">{selectedReceipt.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#3A2E1F]">
                <span className="text-[#F8F5EC]/60">Forma de Pagamento:</span>
                <span className="font-bold text-[#F8F5EC] uppercase">{selectedReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#3A2E1F]">
                <span className="text-[#F8F5EC]/60">Data / Horário:</span>
                <span className="font-bold text-[#F8F5EC]">{formatDate(selectedReceipt.date)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-[#DAA017] font-bold">Valor Total:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center text-[#F8F5EC]/50 italic pt-2">
              "Trazei todos os dízimos à casa do tesouro... e provai-me nisto, diz o Senhor dos Exércitos." (Ml 3:10)
            </p>

            <div className="pt-2 flex justify-between">
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => window.print()}
              >
                Imprimir Recibo
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Exportação Completa de Dízimos e Ofertas (PDF / CSV) */}
      <FinancialExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
};
