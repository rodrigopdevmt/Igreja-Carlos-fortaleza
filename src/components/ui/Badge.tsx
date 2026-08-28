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
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    gold: 'bg-[#DAA017]/15 text-[#DAA017] border border-[#DAA017]/40',
    success: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-500/30',
    info: 'bg-sky-950/80 text-sky-300 border border-sky-500/30',
    neutral: 'bg-[#1A1A1A] text-[#F8F5EC]/70 border border-[#3A2E1F]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full tracking-wide uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
