import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  FileText,
  CircleDollarSign,
  Cctv,
  Radio,
  Network,
  Calendar,
  GraduationCap,
  BookOpen,
  Settings,
  ShieldCheck,
  Building2,
  Crown,
  ClipboardList,
  Heart,
  CalendarDays,
  X,
} from 'lucide-react';
import { GoldLogo } from '../common/GoldLogo';
import { useChurch } from '@/context/ChurchContext';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const { currentTenant, currentRole, stats } = useChurch();
  const location = useLocation();

  const navigationItems = useMemo(() => [
    {
      label: 'Mission Control',
      path: '/demo/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Membros & Pessoas',
      path: '/demo/members',
      icon: Users,
      badge: stats.totalMembers.toString(),
    },
    {
      label: 'Credenciais & QR',
      path: '/demo/credentials',
      icon: QrCode,
      badge: `${stats.activeCredentials}`,
    },
    {
      label: 'Documentos & Certificados',
      path: '/demo/documents',
      icon: FileText,
      badge: 'OFICIAL',
    },
    {
      label: 'Gestao Financeira',
      path: '/demo/finance',
      icon: CircleDollarSign,
      badge: null,
    },
    {
      label: 'Cameras & Seguranca',
      path: '/demo/cameras',
      icon: Cctv,
      badge: '6 CAM',
    },
    {
      label: 'Lives & Transmissao',
      path: '/demo/lives',
      icon: Radio,
      badge: 'AO VIVO',
      live: true,
    },
    {
      label: 'Celulas & Redes',
      path: '/demo/groups',
      icon: Network,
      badge: null,
    },
    {
      label: 'Agenda & Cultos',
      path: '/demo/agenda',
      icon: Calendar,
      badge: '24',
    },
    {
      label: 'Programacao Mensal',
      path: '/demo/monthly-program',
      icon: CalendarDays,
      badge: 'AGO',
    },
    {
      label: 'Escala de Servicos',
      path: '/demo/service-scale',
      icon: ClipboardList,
      badge: null,
    },
    {
      label: 'Pedido de Oracao',
      path: '/oracao',
      icon: Heart,
      badge: 'PUBLICO',
    },
    {
      label: 'Escola Dominical',
      path: '/demo/sunday-school',
      icon: GraduationCap,
      badge: null,
    },
    {
      label: 'Diretoria & Liderancas',
      path: '/demo/leadership',
      icon: Crown,
      badge: '26/28',
    },
    {
      label: 'Biblia Digital',
      path: '/demo/bible',
      icon: BookOpen,
      badge: null,
    },
    {
      label: 'Configuracoes & Banco VPS',
      path: '/demo/settings',
      icon: Settings,
      badge: 'VPS',
    },
  ], [stats]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-gradient-to-b from-[#221B13] via-[#1A140E] to-[#16120D] border-r border-[#DAA017]/15 flex-col h-full overflow-y-auto z-30 transition-all duration-300">
        <SidebarContent currentTenant={currentTenant} currentRole={currentRole} navigationItems={navigationItems} location={location} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-[280px] bg-gradient-to-b from-[#221B13] via-[#1A140E] to-[#16120D] border-r border-[#DAA017]/15 flex flex-col h-full overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#1A1A1A]/60 text-[#F8F5EC]/70 hover:text-[#F8F5EC] hover:bg-[#3A2E1F]/50 z-50 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent currentTenant={currentTenant} currentRole={currentRole} navigationItems={navigationItems} location={location} onNavClick={onClose} />
      </aside>
    </>
  );
};

interface SidebarContentProps {
  currentTenant: any;
  currentRole: string;
  navigationItems: any[];
  location: any;
  onNavClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ currentTenant, currentRole, navigationItems, location, onNavClick }) => (
  <>
    {/* Brand Header */}
    <div className="p-5 border-b border-[#DAA017]/15 flex flex-col items-center">
      <NavLink to="/" className="flex flex-col items-center group text-center" onClick={onNavClick}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DAA017] to-[#B8860B] flex items-center justify-center mb-3 shadow-lg shadow-[#DAA017]/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#DAA017]/40">
          <GoldLogo size="sm" showText={false} />
        </div>
        <h1 className="font-serif text-xl font-bold tracking-tight text-[#F8F5EC] leading-tight">
          Boas Novas
        </h1>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#DAA017] font-bold mt-0.5">
          Igreja Apostolica
        </p>
      </NavLink>

      {/* Church Official Tag */}
      <div className="mt-4 w-full px-3 py-2 rounded-xl bg-[#1A1A1A]/50 border border-[#DAA017]/20 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Building2 className="w-3.5 h-3.5 text-[#DAA017] shrink-0" />
          <span className="text-[11px] font-medium text-[#F8F5EC]/80 truncate">
            Igreja Sede Oficial
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
          ONLINE
        </span>
      </div>
    </div>

    {/* Navigation List */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Menu principal">
      <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-[#DAA017]/60 uppercase">
        Modulos
      </div>

      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavClick}
            className={`sidebar-item px-3 py-3 rounded-xl cursor-pointer flex items-center justify-between text-[13px] font-medium transition-all duration-200 ${
              isActive
                ? 'sidebar-active text-[#DAA017] font-bold'
                : 'text-[#F8F5EC]/60 hover:text-[#DAA017]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#DAA017]' : 'text-[#F8F5EC]/40'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.live && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                LIVE
              </span>
            )}

            {item.badge && !item.live && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-[#DAA017] text-[#1A1A1A]'
                    : 'bg-[#1A1A1A]/60 text-[#DAA017]/80 border border-[#DAA017]/25'
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="p-4 border-t border-[#DAA017]/15 bg-[#14100C]/80 space-y-2">
      <div className="text-[10px] text-[#F8F5EC]/40 uppercase tracking-widest font-bold">Status do Sistema</div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-[#F8F5EC]/70 font-medium">Online 24/7 (v2.4)</span>
        </div>
        <span className="text-[10px] text-[#DAA017] font-bold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> {currentRole.toUpperCase()}
        </span>
      </div>
    </div>
  </>
);
