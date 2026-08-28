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
      className={`relative overflow-hidden rounded-xl p-5 card-brown transition-all duration-300 ${
        highlight
          ? 'border-l-4 border-l-[#DAA017] border-[#DAA017]/40 shadow-[0_0_25px_rgba(218,160,23,0.25)]'
          : 'hover:border-[#DAA017]/50 hover:shadow-[0_0_20px_rgba(218,160,23,0.18)]'
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F8F5EC]/60">
          {title}
        </span>
        <div
          className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
            highlight
              ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/30'
              : 'bg-[#DAA017]/10 border border-[#DAA017]/20 text-[#DAA017]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F8F5EC]">
        {value}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {subtitle && <span className="text-[11px] text-[#F8F5EC]/60">{subtitle}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-medium text-[10px] ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
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
