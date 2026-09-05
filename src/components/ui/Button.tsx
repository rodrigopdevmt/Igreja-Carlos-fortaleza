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
    sm: 'px-3.5 py-2 text-xs gap-1.5 rounded-xl',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-7 py-3.5 text-base gap-2.5 rounded-2xl font-medium',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#DAA017] via-[#DAA017] to-[#B8860B] hover:from-[#B8860B] hover:via-[#DAA017] hover:to-[#DAA017] text-[#1A1A1A] font-bold shadow-[0_4px_20px_rgba(218,160,23,0.3)] hover:shadow-[0_6px_30px_rgba(218,160,23,0.5)] border border-[#FFE898]/30 hover:border-[#FFE898]/60 active:scale-[0.97] transition-all duration-300',
    secondary:
      'bg-gradient-to-r from-[#3A2E1F] to-[#2A2116] hover:from-[#4D3D29] hover:to-[#3A2E1F] text-[#F8F5EC] border border-[#DAA017]/25 hover:border-[#DAA017]/50 active:scale-[0.97] transition-all duration-300',
    outline:
      'bg-transparent hover:bg-[#DAA017]/10 text-[#DAA017] border border-[#DAA017]/40 hover:border-[#DAA017] hover:shadow-[0_0_20px_rgba(218,160,23,0.15)] active:scale-[0.97] transition-all duration-300',
    ghost:
      'bg-transparent hover:bg-[#3A2E1F]/40 text-[#F8F5EC]/70 hover:text-[#F8F5EC] border border-transparent hover:border-[#DAA017]/20 transition-all duration-300',
    danger:
      'bg-gradient-to-r from-rose-900/80 to-rose-950/80 hover:from-rose-900 hover:to-rose-900/80 text-rose-200 border border-rose-500/30 hover:border-rose-500/50 active:scale-[0.97] transition-all duration-300',
  };

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
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
