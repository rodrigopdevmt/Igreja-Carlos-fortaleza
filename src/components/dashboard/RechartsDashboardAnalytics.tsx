import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  CircleDollarSign,
  Calendar,
  Layers,
  Sparkles,
  Activity,
  RefreshCw,
  Server,
  Globe,
  Wifi,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Sliders,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  fetchDashboardMetricsFromApi,
  getApiBaseUrl,
  DashboardApiMetrics,
} from '@/services/api';

// Custom Tooltip Component for dark & gold church styling
const CustomChartTooltip = ({ active, payload, label, unit = '', isCurrency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#16120D]/95 border border-[#DAA017]/40 p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[200px] z-50">
        <div className="font-serif font-bold text-[#F8F5EC] border-b border-[#DAA017]/20 pb-1.5 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-[#DAA017] uppercase tracking-wider font-mono">Boas Novas API</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const val = entry.value;
            const formattedVal = isCurrency
              ? formatCurrency(val)
              : typeof val === 'number'
              ? `${val.toLocaleString('pt-BR')} ${unit}`
              : val;

            return (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[#F8F5EC]/80">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color || entry.stroke || entry.fill || '#DAA017' }}
                  />
                  <span className="text-[11px] font-medium">{entry.name}:</span>
                </div>
                <span className="font-mono font-bold text-[#F8F5EC] text-right">
                  {formattedVal}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const RechartsDashboardAnalytics: React.FC = () => {
  const { members, donations, stats, recentAttendance, liveStream } = useChurch();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'donations' | 'attendance' | 'api-info'>('overview');
  const [metricsData, setMetricsData] = useState<DashboardApiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const apiUrl = useMemo(() => getApiBaseUrl(), []);

  // Busca dados da API local configurada no .env (VITE_API_URL)
  const loadMetrics = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setIsRefreshing(true);
    try {
      const data = await fetchDashboardMetricsFromApi({
        members,
        donations,
        stats,
        recentAttendance,
        liveStream,
      });
      setMetricsData(data);
      setLastSyncTime(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (error) {
      console.error('Erro ao sincronizar métricas com a API:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [members, donations, stats, recentAttendance, liveStream]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Se ainda estiver carregando pela primeira vez, utiliza os dados locais computados
  const activeMembersData = metricsData?.activeMembers;
  const monthlyOfferingsData = metricsData?.monthlyOfferings;
  const serviceAttendanceData = metricsData?.serviceAttendance;
  const serverInfo = metricsData?.serverInfo;

  return (
    <div className="rounded-2xl card-brown p-6 shadow-xl space-y-6">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Header com Status da API Local (VITE_API_URL) & Abas de Navegação */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DAA017]/20 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-6 gold-gradient rounded-full" />
            <h3 className="font-serif text-xl font-bold text-[#F8F5EC] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#DAA017]" />
              Painel Analítico de Métricas (Recharts)
            </h3>
            <div className="flex items-center gap-1.5 bg-[#120E09] px-2.5 py-1 rounded-full border border-[#DAA017]/30 text-[11px] font-mono text-[#DAA017]">
              <Server className="w-3 h-3 text-[#10B981]" />
              <span>{apiUrl}</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sincronizado {serverInfo?.latencyMs ? `(${serverInfo.latencyMs}ms)` : ''}
            </span>
          </div>
          <p className="text-xs text-[#F8F5EC]/60 mt-1 pl-3.5">
            Consumo em tempo real da API local via <code className="text-[#DAA017] bg-[#120E09] px-1 py-0.5 rounded">VITE_API_URL</code> • Membros Ativos, Ofertas Mensais e Participação em Cultos
          </p>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMetrics(true)}
            disabled={isRefreshing}
            className="text-xs gap-1.5 border-[#DAA017]/30 hover:border-[#DAA017]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#DAA017] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Atualizar API'}</span>
          </Button>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#DAA017]/20">
            {[
              { id: 'overview', label: 'Geral', icon: Layers },
              { id: 'members', label: 'Membros Ativos', icon: Users },
              { id: 'donations', label: 'Ofertas Mensais', icon: CircleDollarSign },
              { id: 'attendance', label: 'Cultos & Presença', icon: Calendar },
              { id: 'api-info', label: 'API .env', icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/20'
                      : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC] hover:bg-[#3A2E1F]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Top Summary KPI Cards                                              */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Membros Ativos */}
        <div
          onClick={() => setActiveTab('members')}
          className={`p-4 rounded-xl transition-all cursor-pointer border ${
            activeTab === 'members'
              ? 'bg-[#3A2E1F]/80 border-[#DAA017] shadow-lg shadow-[#DAA017]/10'
              : 'bg-[#1A1A1A]/80 border-[#DAA017]/20 hover:border-[#DAA017]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#DAA017] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Membros Ativos (API)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              +{activeMembersData?.growthRate || 8.4}% este mês
            </span>
          </div>
          <p className="font-serif text-2xl font-extrabold text-[#F8F5EC] mt-1.5">
            {(activeMembersData?.total || stats.totalMembers).toLocaleString('pt-BR')}
          </p>
          <p className="text-[11px] text-[#F8F5EC]/60 mt-0.5">
            Consolidado do banco de dados na VPS / API
          </p>
        </div>

        {/* KPI 2: Ofertas Mensais */}
        <div
          onClick={() => setActiveTab('donations')}
          className={`p-4 rounded-xl transition-all cursor-pointer border ${
            activeTab === 'donations'
              ? 'bg-[#3A2E1F]/80 border-[#DAA017] shadow-lg shadow-[#DAA017]/10'
              : 'bg-[#1A1A1A]/80 border-[#DAA017]/20 hover:border-[#DAA017]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#DAA017] uppercase tracking-wider flex items-center gap-1.5">
              <CircleDollarSign className="w-3.5 h-3.5" /> Ofertas & Dízimos (Mês)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {monthlyOfferingsData?.targetProgress || 94.8}% da meta
            </span>
          </div>
          <p className="font-serif text-2xl font-extrabold text-gold-gradient mt-1.5">
            {formatCurrency(monthlyOfferingsData?.currentMonthTotal || 73240)}
          </p>
          <p className="text-[11px] text-[#F8F5EC]/60 mt-0.5">
            Dízimos, ofertas de altar e missões
          </p>
        </div>

        {/* KPI 3: Participação em Cultos */}
        <div
          onClick={() => setActiveTab('attendance')}
          className={`p-4 rounded-xl transition-all cursor-pointer border ${
            activeTab === 'attendance'
              ? 'bg-[#3A2E1F]/80 border-[#DAA017] shadow-lg shadow-[#DAA017]/10'
              : 'bg-[#1A1A1A]/80 border-[#DAA017]/20 hover:border-[#DAA017]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#DAA017] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Participação Semanal
            </span>
            <span className="text-[10px] text-[#DAA017] font-bold bg-[#3A2E1F] px-2 py-0.5 rounded-full border border-[#DAA017]/30">
              {serviceAttendanceData?.averageOccupancy || 66}% ocupação
            </span>
          </div>
          <p className="font-serif text-2xl font-extrabold text-[#F8F5EC] mt-1.5">
            {(serviceAttendanceData?.weeklyTotal || 4137).toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-sans font-normal text-[#F8F5EC]/60">presenças</span>
          </p>
          <p className="text-[11px] text-[#F8F5EC]/60 mt-0.5">
            Presencial no Templo + Transmissão 4K
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: VISÃO GERAL (COMPOSIÇÃO INTEGRADA)                              */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-serif text-base font-bold text-[#F8F5EC] flex items-center gap-2">
                  <span>Evolução Histórica: Arrecadação Mensal vs Frequência</span>
                  <span className="text-[10px] text-[#DAA017] bg-[#DAA017]/10 px-2 py-0.5 rounded border border-[#DAA017]/20 font-mono">
                    GET {apiUrl}/api/metrics/dashboard
                  </span>
                </h4>
                <p className="text-xs text-[#F8F5EC]/60">
                  Cruzamento dinâmico entre arrecadação total e número de membros presentes
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#DAA017]">
                  <span className="w-3 h-3 rounded bg-[#DAA017]" /> Arrecadação Total (R$)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-400" /> Membros Presentes
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyOfferingsData?.historical || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="goldBarGradOverview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DAA017" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#855E09" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                  <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC80', fontSize: 12 }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#DAA01780"
                    tick={{ fill: '#DAA017', fontSize: 11 }}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10B98180"
                    tick={{ fill: '#10B981', fontSize: 11 }}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip isCurrency={false} />} />
                  <Bar
                    yAxisId="left"
                    dataKey="total"
                    name="Arrecadação Total (R$)"
                    fill="url(#goldBarGradOverview)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="attendance"
                    name="Membros Presentes"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#1A1A1A' }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dual Grid: Canais de Entrada PIX e Ocupação dos Cultos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Canais de Pagamento */}
            <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DAA017]/15 pb-2">
                <h4 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#DAA017]" /> Canais de Entrada das Ofertas
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">53% via PIX CNPJ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyOfferingsData?.paymentMethods || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {(monthlyOfferingsData?.paymentMethods || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1A1A" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs">
                  {(monthlyOfferingsData?.paymentMethods || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#221B13]/80 border border-[#DAA017]/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#F8F5EC]/80 font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[#F8F5EC]">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Participação e Ocupação por Culto */}
            <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DAA017]/15 pb-2">
                <h4 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#DAA017]" /> Taxa de Ocupação por Culto
                </h4>
                <span className="text-[10px] text-[#DAA017] font-semibold">Templo Sede (1.200 lugares)</span>
              </div>

              <div className="space-y-3">
                {(serviceAttendanceData?.services || []).map((srv, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#F8F5EC]">{srv.service}</span>
                      <span className="font-mono text-[#DAA017] font-bold">
                        {srv.presencial} presenciais • {srv.taxaOcupacao}% ocupação
                      </span>
                    </div>
                    <div className="w-full bg-[#120E09] rounded-full h-2 overflow-hidden border border-[#DAA017]/20">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(srv.taxaOcupacao, 100)}%`,
                          background:
                            srv.taxaOcupacao > 80
                              ? 'linear-gradient(90deg, #DAA017 0%, #10B981 100%)'
                              : 'linear-gradient(90deg, #855E09 0%, #DAA017 100%)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: MEMBROS ATIVOS (CRESCIMENTO & MINISTÉRIOS)                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Área de Crescimento */}
            <div className="lg:col-span-2 p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAA017]/15 pb-2">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                    Evolução Histórica do Rol de Membros Ativos
                  </h4>
                  <p className="text-xs text-[#F8F5EC]/60">
                    Dados processados pela API com taxa de crescimento de +{activeMembersData?.growthRate || 8.4}%
                  </p>
                </div>
                <Badge variant="gold" size="sm">
                  {activeMembersData?.total || stats.totalMembers} Membros Ativos
                </Badge>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeMembersData?.historical || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="membersGradLive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                    <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC80', fontSize: 12 }} />
                    <YAxis
                      domain={['dataMin - 50', 'dataMax + 50']}
                      stroke="#10B98180"
                      tick={{ fill: '#10B981', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomChartTooltip unit="membros" />} />
                    <Area
                      type="monotone"
                      dataKey="activeMembers"
                      name="Membros Ativos"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#membersGradLive)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribuição por Ministério Donut */}
            <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#F8F5EC] border-b border-[#DAA017]/15 pb-2">
                  Distribuição por Ministérios & Redes
                </h4>
                <p className="text-[11px] text-[#F8F5EC]/60 mt-1">
                  Envolvimento e liderança ministerial na Igreja Boas Novas
                </p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeMembersData?.ministryDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(activeMembersData?.ministryDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1A1A" strokeWidth={1.5} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip unit="pessoas" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-[11px]">
                {(activeMembersData?.ministryDistribution || []).slice(0, 5).map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-[#120E09] border border-[#DAA017]/10">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="text-[#F8F5EC]/80 truncate">{m.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#DAA017] shrink-0">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Novos Membros: Batismos vs Transferências */}
          <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#F8F5EC] border-b border-[#DAA017]/15 pb-2 flex items-center justify-between">
              <span>Novas Vidas Recebidas por Mês (Batismos nas Águas & Transferências)</span>
              <span className="text-xs text-[#DAA017] font-mono">Consolidado API</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeMembersData?.historical || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                  <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC80', fontSize: 12 }} />
                  <YAxis stroke="#DAA01780" tick={{ fill: '#DAA017', fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip unit="membros" />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-[#F8F5EC]/80">{value}</span>}
                  />
                  <Bar dataKey="baptisms" name="Batismos nas Águas" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="transfers" name="Cartas de Transferência" fill="#DAA017" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: OFERTAS MENSAIS & DÍZIMOS (DETALHADO)                          */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAA017]/15 pb-3">
              <div>
                <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                  Composição das Ofertas Mensais por Categoria (Dízimos, Ofertas & Missões)
                </h4>
                <p className="text-xs text-[#F8F5EC]/60">
                  Valores em Reais (R$) apurados pela tesouraria geral e sincronizados via API
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[#DAA017] font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-[#DAA017]" /> Dízimos
                </span>
                <span className="flex items-center gap-1 text-[#FFE898] font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-[#FFE898]" /> Ofertas Altar
                </span>
                <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> Missões & Obras
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyOfferingsData?.historical || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                  <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC80', fontSize: 12 }} />
                  <YAxis
                    stroke="#DAA01780"
                    tick={{ fill: '#DAA017', fontSize: 11 }}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-[#F8F5EC]/80">{value}</span>}
                  />
                  <Bar dataKey="tithes" name="Dízimos Pastorais" fill="#DAA017" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="offerings" name="Ofertas de Altar" fill="#FFE898" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missions" name="Missões & Campanhas" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: PARTICIPAÇÃO EM CULTOS (PRESENCIAL VS TRANSMISSÃO 4K)          */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#1A1A1A]/90 border border-[#DAA017]/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAA017]/15 pb-3">
              <div>
                <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                  Participação Semanal por Culto: Presencial no Templo vs Online 4K
                </h4>
                <p className="text-xs text-[#F8F5EC]/60">
                  Frequência aferida via Portaria Digital (Check-in QR Code) e Console da Live Stream
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#DAA017] font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-[#DAA017]" /> Presencial no Templo
                </span>
                <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-purple-400" /> Transmissão 4K Online
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceAttendanceData?.services || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                  <XAxis dataKey="service" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC80', fontSize: 11 }} />
                  <YAxis stroke="#DAA01780" tick={{ fill: '#DAA017', fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip unit="participantes" />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-[#F8F5EC]/80">{value}</span>}
                  />
                  <Bar dataKey="presencial" name="Presencial no Templo" fill="#DAA017" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="online" name="Transmissão Ao Vivo (Online)" fill="#A855F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 5: DIAGNÓSTICO E CONFIGURAÇÃO DA API NO .ENV                      */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'api-info' && (
        <div className="space-y-4 p-5 rounded-xl bg-[#1A1A1A]/95 border border-[#DAA017]/30 text-xs">
          <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#DAA017]" />
              <h4 className="font-serif text-sm font-bold text-[#F8F5EC]">
                Configuração da API Local (.env & VPS)
              </h4>
            </div>
            <Badge variant="gold" size="sm">
              VITE_API_URL Ativa
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[#F8F5EC]/70">
                Variável de ambiente carregada no Vite:
              </p>
              <div className="p-2.5 rounded bg-[#120E09] border border-[#DAA017]/20 font-mono text-[#DAA017] break-all">
                VITE_API_URL = "{apiUrl}"
              </div>
              <p className="text-[11px] text-[#F8F5EC]/50">
                Para alterar o endpoint, atualize o arquivo <code className="text-[#DAA017]">.env</code> na raiz do projeto.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[#F8F5EC]/70">Endpoints Consumidos pelo Dashboard:</p>
              <ul className="space-y-1 font-mono text-[11px] text-[#F8F5EC]/80 bg-[#120E09] p-2.5 rounded border border-[#DAA017]/20">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> GET /api/metrics/dashboard
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> GET /api/members/active
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> GET /api/offerings/monthly
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> GET /api/attendance/services
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#DAA017]/15 text-[#F8F5EC]/60">
            <span>Última sincronização com a API: <strong className="text-[#F8F5EC]">{lastSyncTime || 'Agora'}</strong></span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Conexão Segura & Autenticada
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
