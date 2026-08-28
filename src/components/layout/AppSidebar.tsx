import React from 'react';
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
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { GoldLogo } from '../common/GoldLogo';
import { useChurch } from '@/context/ChurchContext';

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = () => {
  const { currentTenant, currentRole, stats } = useChurch();
  const location = useLocation();

  const navigationItems = [
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
      label: 'Gestão Financeira',
      path: '/demo/finance',
      icon: CircleDollarSign,
      badge: null,
    },
    {
      label: 'Câmeras & Segurança',
      path: '/demo/cameras',
      icon: Cctv,
      badge: '6 CAM',
    },
    {
      label: 'Lives & Transmissão',
      path: '/demo/lives',
      icon: Radio,
      badge: 'AO VIVO',
      live: true,
    },
    {
      label: 'Células & Redes',
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
      label: 'Escola Dominical',
      path: '/demo/sunday-school',
      icon: GraduationCap,
      badge: null,
    },
    {
      label: 'Bíblia Digital',
      path: '/demo/bible',
      icon: BookOpen,
      badge: null,
    },
    {
      label: 'Configurações & Banco VPS',
      path: '/demo/settings',
      icon: Settings,
      badge: 'VPS',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#3A2E1F] border-r border-[#DAA017]/20 flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#DAA017]/20 flex flex-col items-center">
        <NavLink to="/" className="flex flex-col items-center group text-center">
          <div className="w-14 h-14 gold-gradient rounded-full flex items-center justify-center mb-3 shadow-lg shadow-[#DAA017]/20 transition-transform group-hover:scale-105">
            <GoldLogo size="sm" showText={false} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-[#F8F5EC] leading-tight">
            Boas Novas
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#DAA017] font-semibold mt-0.5">
            Igreja Apostólica
          </p>
        </NavLink>
        
        {/* Church Official Tag */}
        <div className="mt-4 w-full px-2.5 py-1.5 rounded-lg bg-[#1A1A1A]/40 border border-[#DAA017]/25 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="w-3.5 h-3.5 text-[#DAA017] shrink-0" />
            <span className="text-[11px] font-medium text-[#F8F5EC]/90 truncate">
              Igreja Sede Oficial
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
            ONLINE
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <div className="px-4 pb-2 text-[10px] font-bold tracking-widest text-[#DAA017]/80 uppercase">
          Módulos
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-item px-4 py-2.5 rounded-r-md cursor-pointer flex items-center justify-between text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'sidebar-active text-[#DAA017] font-semibold shadow-sm'
                  : 'text-[#F8F5EC]/75 hover:text-[#DAA017]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#DAA017]' : 'text-[#F8F5EC]/60 group-hover:text-[#DAA017]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.live && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  LIVE
                </span>
              )}

              {item.badge && !item.live && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-[#DAA017] text-[#1A1A1A]'
                      : 'bg-[#1A1A1A]/60 text-[#DAA017] border border-[#DAA017]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Slogan, Status & RBAC Identity Footer */}
      <div className="p-4 border-t border-[#DAA017]/20 bg-[#2A2116]/80 space-y-2">
        <div className="text-[10px] text-[#F8F5EC]/50 uppercase tracking-widest">Status do Sistema</div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-[#F8F5EC]/80 font-medium">Online 24/7 (v2.4)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> {currentRole.toUpperCase()}
          </span>
        </div>
      </div>
    </aside>
  );
};
