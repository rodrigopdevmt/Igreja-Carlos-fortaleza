import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Search,
  Bell,
  Radio,
  Plus,
  QrCode,
  Sparkles,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import type { AppRole } from '@/integrations/supabase/types';

interface TopBarProps {
  onOpenQuickScan?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenQuickScan }) => {
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

  const rolesList: { role: AppRole; label: string; desc: string }[] = [
    { role: 'owner', label: 'Apóstolo / Owner', desc: 'Acesso total irrestrito a todos os módulos' },
    { role: 'pastor', label: 'Pastor Titular', desc: 'Gestão de cultos, membros e discipulado' },
    { role: 'finance', label: 'Tesoureiro / Finanças', desc: 'Acesso a dízimos, ofertas e balanços' },
    { role: 'media', label: 'Mídia & Lives', desc: 'Controle de transmissão e chat ao vivo' },
    { role: 'security', label: 'Segurança & Portaria', desc: 'Monitoramento de câmeras e portaria' },
    { role: 'manager', label: 'Secretaria Geral', desc: 'Emissão de credenciais e cadastros' },
  ];

  const handleTestScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const res = validateQrCode(scanInput.trim());
    setScanResult(res);

    if (res.valid && res.member && events.length > 0) {
      recordAttendance(events[0].id, res.member.id, 'qr_code');
    }
  };

  return (
    <header className="h-16 bg-[#16120D]/95 border-b border-[#DAA017]/20 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Church Official Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3A2E1F]/50 border border-[#DAA017]/30 text-xs font-medium text-[#F8F5EC]">
          <Building2 className="w-4 h-4 text-[#DAA017] shrink-0" />
          <span className="font-semibold text-[#F8F5EC] max-w-[180px] sm:max-w-[280px] truncate">
            {currentTenant.name}
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#DAA017]/20 text-[#DAA017] font-bold border border-[#DAA017]/40">
            Sede Oficial
          </span>
        </div>

        {/* Live Broadcast Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-[11px] text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-semibold">{liveStream.viewers_count} assistindo</span>
        </div>
      </div>

      {/* Right: RBAC Selector, QR Check-in Quick Scan & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick QR Validator Button */}
        <Button
          variant="outline"
          size="sm"
          icon={QrCode}
          onClick={() => {
            setScanResult(null);
            setScanInput('BN-2024-0001');
            setQrModalOpen(true);
          }}
          className="hidden sm:inline-flex text-xs"
        >
          Check-in QR
        </Button>

        {/* RBAC Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#DAA017]/10 hover:bg-[#DAA017]/20 border border-[#DAA017]/35 text-xs text-[#DAA017] font-medium transition-all"
            title="Demonstração de Políticas RBAC"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="capitalize font-semibold">{currentRole}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#221B13] border border-[#DAA017]/40 shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#DAA017] tracking-wider">
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      r.role === currentRole
                        ? 'bg-[#DAA017] text-[#1A1A1A] font-bold'
                        : 'text-[#F8F5EC]/80 hover:bg-[#3A2E1F]/60'
                    }`}
                  >
                    <p className="font-semibold">{r.label}</p>
                    <p className={`text-[10px] ${r.role === currentRole ? 'text-[#1A1A1A]/80' : 'text-[#F8F5EC]/50'}`}>
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#DAA017]/20">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Ap. Carlos Alberto"
              className="w-8 h-8 rounded-full border border-[#DAA017] object-cover ring-2 ring-[#DAA017]/20"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1A1A1A]" />
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <p className="font-bold text-[#F8F5EC]">Ap. Carlos Alberto</p>
            <p className="text-[10px] text-[#DAA017]">Pastor Presidente</p>
          </div>
        </div>
      </div>

      {/* QR Code Validation Simulator Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Validador de Credencial & Check-in"
        subtitle="Simulador de Leitura Óptica de QR Code / Código de Membro"
        maxWidth="md"
      >
        <form onSubmit={handleTestScan} className="space-y-4">
          <Input
            label="Código ou Hash do QR Code"
            icon={QrCode}
            placeholder="ex: BN-2024-0001 ou BN:AUTH:0001:..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            helperText="Digite um código de membro para simular a leitura do crachá na portaria."
          />

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" size="sm" className="w-full">
              Validar Credencial
            </Button>
          </div>
        </form>

        {scanResult && (
          <div
            className={`mt-4 p-4 rounded-xl border ${
              scanResult.valid
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  scanResult.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-sm mb-1">{scanResult.message}</p>
                {scanResult.member && (
                  <div className="mt-2 space-y-1 text-[11px] text-[#F8F5EC]/80 bg-[#1A1A1A]/80 p-2.5 rounded-lg border border-[#DAA017]/20">
                    <p>
                      <strong className="text-[#DAA017]">Nome:</strong> {scanResult.member.full_name}
                    </p>
                    <p>
                      <strong className="text-[#DAA017]">Ministério:</strong> {scanResult.member.ministry}
                    </p>
                    <p>
                      <strong className="text-[#DAA017]">Documento:</strong> {scanResult.member.document}
                    </p>
                    <p className="text-emerald-400 font-semibold mt-1">
                      ✓ Presença registrada com sucesso no Culto Atual!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
};
