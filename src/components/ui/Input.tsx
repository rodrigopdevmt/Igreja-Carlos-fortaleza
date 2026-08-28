import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-[#DAA017]/70 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#1A1A1A] text-[#F8F5EC] placeholder-[#F8F5EC]/30 rounded-lg px-3.5 py-2.5 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] ${
              Icon ? 'pl-9' : ''
            } ${
              error ? 'border-rose-500/80 focus:border-rose-500' : 'border-[#DAA017]/25 hover:border-[#DAA017]/45'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#F8F5EC]/50">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
