import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantStyles = {
    gold: 'bg-gradient-to-r from-[#DAA017]/15 to-[#B8860B]/10 text-[#DAA017] border border-[#DAA017]/30 shadow-[0_0_10px_rgba(218,160,23,0.1)]',
    success: 'bg-gradient-to-r from-emerald-950/80 to-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    warning: 'bg-gradient-to-r from-amber-950/80 to-amber-950/60 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    danger: 'bg-gradient-to-r from-rose-950/80 to-rose-950/60 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    info: 'bg-gradient-to-r from-sky-950/80 to-sky-950/60 text-sky-300 border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]',
    neutral: 'bg-[#1A1A1A]/80 text-[#F8F5EC]/60 border border-[#3A2E1F]/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full tracking-wide uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
