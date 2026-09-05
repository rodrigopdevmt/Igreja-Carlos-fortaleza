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
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-bold text-[#F8F5EC]/70 mb-1.5 uppercase tracking-widest">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-[#DAA017]/60 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`w-full bg-[#1A1A1A]/80 text-[#F8F5EC] placeholder-[#F8F5EC]/25 rounded-xl px-4 py-3 text-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#DAA017]/30 focus:border-[#DAA017]/60 focus:bg-[#1A1A1A] ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-[#DAA017]/15 hover:border-[#DAA017]/35'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-rose-400 font-medium" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[#F8F5EC]/40">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
