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
  Activity,
  RefreshCw,
  Server,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Sparkles,
  ArrowUpRight,
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

// Custom Tooltip estilizado para o padrão visual escuro e dourado da Igreja Boas Novas
const CustomChartTooltip = ({ active, payload, label, unit = '', isCurrency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#16120D]/95 border border-[#DAA017]/40 p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[200px] z-50">
        <div className="font-serif font-bold text-[#F8F5EC] border-b border-[#DAA017]/20 pb-1.5 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-[#DAA017] uppercase tracking-wider font-mono">API Boas Novas</span>
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

export const DashboardMetrics: React.FC = () => {
  const { members, donations, stats, recentAttendance, liveStream } = useChurch();

  const [metricsData, setMetricsData] = useState<DashboardApiMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'all' | 'members' | 'donations' | 'attendance'>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const apiUrl = useMemo(() => getApiBaseUrl(), []);

  // Busca dados da API configurada no .env (VITE_API_URL)
  const loadApiData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const data = await fetchDashboardMetricsFromApi({
        members,
        donations,
        stats,
        recentAttendance,
        liveStream,
      });
      setMetricsData(data);
      setLastUpdated(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      console.error('Falha ao consumir métricas da API local:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [members, donations, stats, recentAttendance, liveStream]);

  useEffect(() => {
    loadApiData();
  }, [loadApiData]);

  const activeMembersData = metricsData?.activeMembers;
  const monthlyOfferingsData = metricsData?.monthlyOfferings;
  const serviceAttendanceData = metricsData?.serviceAttendance;
  const serverInfo = metricsData?.serverInfo;

  return (
    <div id="dashboard-metrics-container" className="space-y-6">
      {/* --------------------------------------------------------------------- */}
      {/* Cabeçalho de Controle e Status da API                                  */}
      {/* --------------------------------------------------------------------- */}
      <div className="rounded-2xl card-brown p-5 shadow-xl border border-[#DAA017]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-6 gold-gradient rounded-full" />
            <h3 className="font-serif text-lg md:text-xl font-bold text-[#F8F5EC] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#DAA017]" />
              Métricas Consolidadas da API (Recharts)
            </h3>
            <div className="flex items-center gap-1.5 bg-[#120E09] px-2.5 py-1 rounded-full border border-[#DAA017]/30 text-[11px] font-mono text-[#DAA017]">
              <Server className="w-3 h-3 text-[#10B981]" />
              <span>{apiUrl}</span>
            </div>
            <Badge variant="gold" size="sm">
              {serverInfo?.latencyMs ? `${serverInfo.latencyMs}ms` : 'Sincronizado'}
            </Badge>
          </div>
          <p className="text-xs text-[#F8F5EC]/60 mt-1 pl-3.5">
            Renderização em tempo real de Membros Ativos, Ofertas Mensais e Participação em Cultos consumindo a API local
          </p>
        </div>

        {/* Controles de Atualização & Filtro de Visualização */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center bg-[#1A1A1A] p-1 rounded-xl border border-[#DAA017]/20 text-xs">
            <button
              onClick={() => setSelectedView('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedView === 'all'
                  ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow'
                  : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC]'
              }`}
            >
              Todos os 3 Gráficos
            </button>
            <button
              onClick={() => setSelectedView('members')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedView === 'members'
                  ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow'
                  : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC]'
              }`}
            >
              Membros
            </button>
            <button
              onClick={() => setSelectedView('donations')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedView === 'donations'
                  ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow'
                  : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC]'
              }`}
            >
              Ofertas
            </button>
            <button
              onClick={() => setSelectedView('attendance')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedView === 'attendance'
                  ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow'
                  : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC]'
              }`}
            >
              Participação
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadApiData(true)}
            disabled={refreshing}
            className="text-xs gap-1.5 border-[#DAA017]/30 hover:border-[#DAA017]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#DAA017] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </Button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* OS TRÊS GRÁFICOS PRINCIPAIS (Recharts)                                 */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =================================================================== */}
        {/* GRÁFICO 1: MEMBROS ATIVOS (Evolução Histórica & Novos Ingressos)     */}
        {/* =================================================================== */}
        {(selectedView === 'all' || selectedView === 'members') && (
          <div
            id="chart-card-members"
            className={`rounded-2xl card-brown p-5 shadow-xl border border-[#DAA017]/25 flex flex-col justify-between ${
              selectedView === 'members' ? 'lg:col-span-3' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#DAA017]/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                      1. Membros Ativos
                    </h4>
                    <p className="text-[11px] text-[#F8F5EC]/60">
                      Evolução histórica do rol eclesiástico
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-extrabold text-[#F8F5EC]">
                    {(activeMembersData?.total || stats.totalMembers).toLocaleString('pt-BR')}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-bold">
                    +{activeMembersData?.growthRate || 8.4}% este ano
                  </span>
                </div>
              </div>

              {/* Gráfico Recharts: AreaChart de Membros */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeMembersData?.historical || []}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="membersAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                    <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC70', fontSize: 11 }} />
                    <YAxis
                      domain={['dataMin - 30', 'dataMax + 20']}
                      stroke="#10B98180"
                      tick={{ fill: '#10B981', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomChartTooltip unit="membros" />} />
                    <Area
                      type="monotone"
                      dataKey="activeMembers"
                      name="Membros Ativos"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#membersAreaGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rodapé informativo do card */}
            <div className="mt-4 pt-3 border-t border-[#DAA017]/15 flex items-center justify-between text-xs text-[#F8F5EC]/60">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Rol Atualizado
              </span>
              <span className="font-mono text-[11px] text-[#DAA017]">
                API /api/members/active
              </span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* GRÁFICO 2: OFERTAS MENSAIS (Dízimos, Ofertas & Missões em R$)         */}
        {/* =================================================================== */}
        {(selectedView === 'all' || selectedView === 'donations') && (
          <div
            id="chart-card-donations"
            className={`rounded-2xl card-brown p-5 shadow-xl border border-[#DAA017]/25 flex flex-col justify-between ${
              selectedView === 'donations' ? 'lg:col-span-3' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#DAA017]/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017]">
                    <CircleDollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                      2. Ofertas Mensais
                    </h4>
                    <p className="text-[11px] text-[#F8F5EC]/60">
                      Dízimos, ofertas de altar e missões
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-extrabold text-gold-gradient">
                    {formatCurrency(monthlyOfferingsData?.currentMonthTotal || 73240)}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-bold">
                    {monthlyOfferingsData?.targetProgress || 94.8}% da meta
                  </span>
                </div>
              </div>

              {/* Gráfico Recharts: BarChart de Ofertas e Dízimos */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyOfferingsData?.historical || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                    <XAxis dataKey="month" stroke="#F8F5EC40" tick={{ fill: '#F8F5EC70', fontSize: 11 }} />
                    <YAxis
                      stroke="#DAA01780"
                      tick={{ fill: '#DAA017', fontSize: 10 }}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomChartTooltip isCurrency={true} />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                      formatter={(value) => <span className="text-[#F8F5EC]/80">{value}</span>}
                    />
                    <Bar dataKey="tithes" name="Dízimos" fill="#DAA017" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="offerings" name="Ofertas" fill="#FFE898" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="missions" name="Missões" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rodapé informativo do card */}
            <div className="mt-4 pt-3 border-t border-[#DAA017]/15 flex items-center justify-between text-xs text-[#F8F5EC]/60">
              <span className="text-[11px] text-[#DAA017]">
                53% arrecadado via PIX CNPJ
              </span>
              <span className="font-mono text-[11px] text-[#DAA017]">
                API /api/offerings/monthly
              </span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* GRÁFICO 3: PARTICIPAÇÃO EM CULTOS (Presencial vs Online 4K)          */}
        {/* =================================================================== */}
        {(selectedView === 'all' || selectedView === 'attendance') && (
          <div
            id="chart-card-attendance"
            className={`rounded-2xl card-brown p-5 shadow-xl border border-[#DAA017]/25 flex flex-col justify-between ${
              selectedView === 'attendance' ? 'lg:col-span-3' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#DAA017]/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                      3. Participação em Cultos
                    </h4>
                    <p className="text-[11px] text-[#F8F5EC]/60">
                      Presencial no Templo Sede vs Live 4K
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-extrabold text-[#F8F5EC]">
                    {(serviceAttendanceData?.weeklyTotal || 4137).toLocaleString('pt-BR')}
                  </span>
                  <span className="block text-[10px] text-[#DAA017] font-semibold">
                    {serviceAttendanceData?.averageOccupancy || 66}% ocupação
                  </span>
                </div>
              </div>

              {/* Gráfico Recharts: BarChart de Cultos */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceAttendanceData?.services || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#DAA01715" vertical={false} />
                    <XAxis
                      dataKey="service"
                      stroke="#F8F5EC40"
                      tick={{ fill: '#F8F5EC70', fontSize: 9 }}
                      tickFormatter={(s) => s.split(' ')[0]}
                    />
                    <YAxis stroke="#DAA01780" tick={{ fill: '#DAA017', fontSize: 10 }} />
                    <Tooltip content={<CustomChartTooltip unit="participantes" />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                      formatter={(value) => <span className="text-[#F8F5EC]/80">{value}</span>}
                    />
                    <Bar dataKey="presencial" name="Presencial" fill="#DAA017" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="online" name="Live 4K" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rodapé informativo do card */}
            <div className="mt-4 pt-3 border-t border-[#DAA017]/15 flex items-center justify-between text-xs text-[#F8F5EC]/60">
              <span className="text-[11px] text-purple-400">
                Transmissão UHD ativa ({liveStream.viewers_count} espectadores)
              </span>
              <span className="font-mono text-[11px] text-[#DAA017]">
                API /api/attendance/services
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMetrics;
