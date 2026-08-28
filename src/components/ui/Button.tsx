import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-lg',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl font-medium',
  };

  const variantStyles = {
    primary:
      'bg-[#DAA017] hover:bg-[#B8860B] text-[#1A1A1A] font-semibold shadow-[0_0_20px_rgba(218,160,23,0.3)] hover:shadow-[0_0_30px_rgba(218,160,23,0.45)] border border-[#FFE898]/40 active:scale-[0.98]',
    secondary:
      'bg-[#3A2E1F] hover:bg-[#4D3D29] text-[#F8F5EC] border border-[#DAA017]/30 hover:border-[#DAA017]/60 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#DAA017]/10 text-[#DAA017] border border-[#DAA017]/50 hover:border-[#DAA017] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[#3A2E1F]/50 text-[#F8F5EC]/80 hover:text-[#F8F5EC] border border-transparent',
    danger:
      'bg-rose-900/50 hover:bg-rose-900/80 text-rose-200 border border-rose-600/40 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
