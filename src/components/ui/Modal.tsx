import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
} as const;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={contentRef}
        className={`relative w-full ${maxWidthMap[maxWidth]} animate-scale-in z-10 my-8`}
      >
        <div className="bg-gradient-to-br from-[#221B13] via-[#1A140E] to-[#16120D] border border-[#DAA017]/25 rounded-2xl shadow-[0_0_60px_rgba(218,160,23,0.12)] overflow-hidden">
          {/* Gold accent line at top */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#DAA017] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DAA017]/15 bg-[#1A1A1A]/50">
            <div>
              <h3
                id="modal-title"
                className="font-serif text-lg font-bold text-[#F8F5EC] tracking-wide"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#DAA017]/80 mt-0.5 font-medium">{subtitle}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-[#F8F5EC]/50 hover:text-[#F8F5EC] rounded-xl hover:bg-[#3A2E1F]/50 transition-all"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
