import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
  highlight = false,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={`relative overflow-hidden rounded-2xl p-5 card-gold-glass group ${
        highlight
          ? 'border-l-[3px] border-l-[#DAA017] border-[#DAA017]/30 shadow-[0_0_30px_rgba(218,160,23,0.2)]'
          : 'hover:border-[#DAA017]/40 hover:shadow-[0_0_25px_rgba(218,160,23,0.15)]'
      } ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer pointer-events-none" />

      <div className="relative flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F8F5EC]/50">
          {title}
        </span>
        <div
          className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
            highlight
              ? 'bg-gradient-to-br from-[#DAA017] to-[#B8860B] text-[#1A1A1A] shadow-lg shadow-[#DAA017]/30'
              : 'bg-[#DAA017]/10 border border-[#DAA017]/20 text-[#DAA017] group-hover:bg-[#DAA017]/20 group-hover:scale-110'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="relative text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F8F5EC] text-shadow-gold">
        {value}
      </div>

      <div className="relative mt-2.5 flex items-center justify-between text-xs">
        {subtitle && <span className="text-[11px] text-[#F8F5EC]/50 font-medium">{subtitle}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
              trend.positive
                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/20'
                : 'text-rose-400 bg-rose-950/60 border border-rose-500/20'
            }`}
          >
            {trend.positive ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
