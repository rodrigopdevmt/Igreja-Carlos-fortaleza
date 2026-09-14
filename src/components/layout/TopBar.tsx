import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Shield,
  Radio,
  QrCode,
  ChevronDown,
  UserCheck,
  Menu,
} from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import type { AppRole } from '@/integrations/supabase/types';

interface TopBarProps {
  onOpenQuickScan?: () => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenQuickScan, onToggleSidebar }) => {
  const {
    currentTenant,
    currentRole,
    switchRole,
    liveStream,
    validateQrCode,
    recordAttendance,
    events,
  } = useChurch();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    valid?: boolean;
    message?: string;
    member?: any;
    credential?: any;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [roleDropdownOpen]);

  const rolesList: { role: AppRole; label: string; desc: string }[] = [
    { role: 'owner', label: 'Apostolo / Owner', desc: 'Acesso total irrestrito a todos os modulos' },
    { role: 'pastor', label: 'Pastor Titular', desc: 'Gestao de cultos, membros e discipulado' },
    { role: 'finance', label: 'Tesoureiro / Financas', desc: 'Acesso a dizimos, ofertas e balancos' },
    { role: 'media', label: 'Midia & Lives', desc: 'Controle de transmissao e chat ao vivo' },
    { role: 'security', label: 'Seguranca & Portaria', desc: 'Monitoramento de cameras e portaria' },
    { role: 'manager', label: 'Secretaria Geral', desc: 'Emissao de credenciais e cadastros' },
  ];

  const handleTestScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const res = validateQrCode(scanInput.trim());
    setScanResult(res);

    if (res.valid && res.member && events.length > 0) {
      recordAttendance(events[0]?.id, res.member.id, 'qr_code');
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-[#16120D]/90 border-b border-[#DAA017]/15 px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
      {/* Left: Hamburger + Church Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#221B13]/80 border border-[#DAA017]/20 text-[#F8F5EC] hover:text-[#DAA017] hover:border-[#DAA017]/40 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#221B13]/80 border border-[#DAA017]/20 text-xs font-medium text-[#F8F5EC]">
          <Building2 className="w-4 h-4 text-[#DAA017] shrink-0" />
          <span className="font-semibold text-[#F8F5EC] max-w-[140px] sm:max-w-[280px] truncate">
            {currentTenant.name}
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#DAA017]/15 text-[#DAA017] font-bold border border-[#DAA017]/30">
            Sede Oficial
          </span>
        </div>

        {/* Live Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/50 border border-rose-500/25 text-[11px] text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-bold">{liveStream.viewers_count} assistindo</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* QR Validator */}
        <Button
          variant="outline"
          size="sm"
          icon={QrCode}
          onClick={() => {
            setScanResult(null);
            setScanInput('');
            setQrModalOpen(true);
          }}
          className="inline-flex text-xs"
        >
          Check-in QR
        </Button>

        {/* RBAC Role Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-[#DAA017]/10 hover:bg-[#DAA017]/20 border border-[#DAA017]/30 text-xs text-[#DAA017] font-bold transition-all duration-300"
            aria-expanded={roleDropdownOpen}
            aria-haspopup="true"
            title="Demonstracao de Politicas RBAC"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="capitalize font-bold hidden sm:inline">{currentRole}</span>
            <ChevronDown className={`w-3 h-3 opacity-70 transition-transform duration-300 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-gradient-to-br from-[#221B13] via-[#1A140E] to-[#16120D] border border-[#DAA017]/30 shadow-2xl p-2 z-50 animate-scale-in">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#DAA017] tracking-wider">
                Simular Papel RBAC
              </div>
              <div className="space-y-1 mt-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                      r.role === currentRole
                        ? 'bg-gradient-to-r from-[#DAA017] to-[#B8860B] text-[#1A1A1A] font-bold shadow-lg shadow-[#DAA017]/20'
                        : 'text-[#F8F5EC]/80 hover:bg-[#3A2E1F]/50 hover:text-[#F8F5EC]'
                    }`}
                  >
                    <p className="font-bold">{r.label}</p>
                    <p className={`text-[10px] mt-0.5 ${r.role === currentRole ? 'text-[#1A1A1A]/70' : 'text-[#F8F5EC]/40'}`}>
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#DAA017]/15">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Ap. Carlos Alberto"
              className="w-9 h-9 rounded-full border-2 border-[#DAA017]/40 object-cover ring-2 ring-[#DAA017]/10"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1A1A1A]" />
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <p className="font-bold text-[#F8F5EC]">Ap. Carlos Alberto</p>
            <p className="text-[10px] text-[#DAA017] font-semibold">Pastor Presidente</p>
          </div>
        </div>
      </div>

      {/* QR Code Modal — portal to body to escape stacking context */}
      {createPortal(
        <Modal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          title="Validador de Credencial & Check-in"
          subtitle="Simulador de Leitura de QR Code / Codigo de Membro"
          maxWidth="md"
        >
        <form onSubmit={handleTestScan} className="space-y-4">
          <Input
            label="Codigo ou Hash do QR Code"
            icon={QrCode}
            placeholder="ex: BN-2024-0001 ou BN:AUTH:0001:..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            helperText="Digite um codigo de membro para simular a leitura do cracha na portaria."
          />

          <Button type="submit" variant="primary" size="sm" className="w-full">
            Validar Credencial
          </Button>
        </form>

        {scanResult && (
          <div
            className={`mt-4 p-4 rounded-2xl border ${
              scanResult.valid
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl ${
                  scanResult.valid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-sm mb-1">{scanResult.message}</p>
                {scanResult.member && (
                  <div className="mt-2 space-y-1 text-[11px] text-[#F8F5EC]/80 bg-[#1A1A1A]/60 p-3 rounded-xl border border-[#DAA017]/15">
                    <p>
                      <strong className="text-[#DAA017]">Nome:</strong> {scanResult.member.full_name}
                    </p>
                    <p>
                      <strong className="text-[#DAA017]">Ministerio:</strong> {scanResult.member.ministry}
                    </p>
                    <p>
                      <strong className="text-[#DAA017]">Documento:</strong> {scanResult.member.document}
                    </p>
                    <p className="text-emerald-400 font-bold mt-1">
                      Presenca registrada com sucesso no Culto Atual!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>,
        document.body
      )}
    </header>
  );
};
