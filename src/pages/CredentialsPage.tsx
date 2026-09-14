import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Sparkles,
  Printer,
  RotateCw,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Crown,
  Calendar,
  Building2,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChurch, Credential } from '@/context/ChurchContext';
import { GoldLogo } from '@/components/common/GoldLogo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export const CredentialsPage: React.FC = () => {
  const { credentials, members, issueCredential, revokeCredential, validateQrCode, currentTenant } = useChurch();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'scanner'>('cards');
  const [selectedCard, setSelectedCard] = useState<Credential | null>(credentials[0] || null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Scanner Simulator state
  const [scannerCode, setScannerCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    valid?: boolean;
    message?: string;
    member?: any;
    credential?: any;
  } | null>(null);

  const filteredCredentials = credentials.filter(
    (c) =>
      c.person_name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.person_role.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssueNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const newCred = issueCredential(selectedMemberId);
    setSelectedCard(newCred);
    setIssueModalOpen(false);
    setSelectedMemberId('');
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerCode.trim()) return;
    const res = validateQrCode(scannerCode.trim());
    setScanResult(res);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="sm:hidden p-2 rounded-xl bg-[#221B13]/80 border border-[#DAA017]/20 text-[#F8F5EC] hover:text-[#DAA017] hover:border-[#DAA017]/40 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Carteirinhas & Credenciais Digitais
            </h1>
            <Badge variant="gold" size="sm">
              QR Criptografado
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1 ml-0 sm:ml-0">
            Emissão de credenciais eclesiásticas com QR Code para controle de acesso e identificação
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex bg-[#221B13] p-1 rounded-xl border border-[#DAA017]/30 text-xs">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-2.5 sm:px-3 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'cards'
                  ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-md'
                  : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC]'
              }`}
            >
              Carteirinhas
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-2.5 sm:px-3 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-md'
                  : 'text-[#F8F5EC]/70 hover:text-[#F8F5EC]'
              }`}
            >
              Scanner
            </button>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIssueModalOpen(true)}
          >
            Emitir Nova
          </Button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Realistic Gold Metallic Card Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {selectedCard ? (
              <div className="w-full max-w-sm flex flex-col items-center">
                {/* Physical Card Container with Gold Luxury Foil Border */}
                <div
                  className="relative w-full aspect-[1.586/1] rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[#DAA017] transition-all duration-500 overflow-hidden"
                  style={{
                    background:
                      'radial-gradient(ellipse at 80% 20%, #4D3D29 0%, #2A2116 50%, #15120D 100%)',
                    boxShadow: '0 0 35px rgba(218, 160, 23, 0.25)',
                  }}
                >
                  {/* Gold holographic accent stripes */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#FFE898]/15 via-[#DAA017]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#DAA017]/10 rounded-full blur-xl pointer-events-none" />

                  {!isFlipped ? (
                    /* Front of the Card */
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-[#DAA017]/30 pb-2.5">
                        <div className="flex items-center gap-2">
                          <GoldLogo size="sm" />
                          <div>
                            <p className="font-serif text-[11px] font-extrabold tracking-wider text-[#F8F5EC] leading-tight">
                              BOAS NOVAS
                            </p>
                            <p className="text-[8px] tracking-widest text-[#DAA017] uppercase font-semibold">
                              Igreja Apostólica
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1A1A1A]/80 border border-[#DAA017]/40 text-[#DAA017]">
                          {selectedCard.code}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="flex items-center gap-3.5 my-auto">
                        <img
                          src={
                            selectedCard.photo_url ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
                          }
                          alt={selectedCard.person_name}
                          className="w-16 h-16 rounded-xl object-cover border border-[#DAA017] ring-2 ring-[#DAA017]/20 shadow-md"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif text-sm font-bold text-[#F8F5EC] truncate leading-tight">
                            {selectedCard.person_name}
                          </h4>
                          <p className="text-xs text-[#DAA017] font-semibold truncate mt-0.5">
                            {selectedCard.person_role}
                          </p>
                          <p className="text-[9px] text-[#F8F5EC]/60 mt-1 truncate">
                            {currentTenant.name}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer with QR Code & Hologram */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#DAA017]/20 text-[8px] text-[#F8F5EC]/70">
                        <div>
                          <p>
                            <strong className="text-[#DAA017]">EMISSÃO:</strong>{' '}
                            {formatDate(selectedCard.issued_at)}
                          </p>
                          <p>
                            <strong className="text-[#DAA017]">VALIDADE:</strong>{' '}
                            {formatDate(selectedCard.expires_at)}
                          </p>
                        </div>
                        <div className="bg-white p-1 rounded-md shadow-sm">
                          <QRCodeSVG
                            value={selectedCard.qr_hash}
                            size={44}
                            level="M"
                            fgColor="#1A1A1A"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Back of the Card */
                    <div className="relative z-10 h-full flex flex-col justify-between text-[9px] text-[#F8F5EC]/80">
                      <div>
                        <div className="h-6 w-full bg-[#1A1A1A] border-y border-[#DAA017]/40 -mx-5 px-5 flex items-center mb-3">
                          <span className="font-mono text-[8px] text-[#DAA017] tracking-widest">
                            ||||| | ||||| || |||||| | |||| ||||||
                          </span>
                        </div>
                        <p className="font-serif font-bold text-[#DAA017] text-center text-xs mb-1">
                          IGREJA APOSTÓLICA BOAS NOVAS
                        </p>
                        <p className="text-center italic text-[#F8F5EC]/70 leading-relaxed text-[8px]">
                          "Uma Igreja, Uma Família, Uma Missão. Mais que uma igreja, somos boas novas para o mundo."
                        </p>
                      </div>

                      <div className="p-2 rounded bg-[#1A1A1A]/80 border border-[#DAA017]/20 text-[8px] leading-tight space-y-0.5">
                        <p>• Este documento é de uso pessoal e intransferível.</p>
                        <p>• Válido mediante apresentação no portal ou app oficial.</p>
                        <p>• Sede Internacional: Av. Paulista, 1500 - São Paulo/SP.</p>
                      </div>

                      <div className="text-center text-[7px] text-[#DAA017] font-mono">
                        HASH: {selectedCard.qr_hash}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Flip & Print Controls */}
                <div className="flex items-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RotateCw}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    Girar Carteirinha ({isFlipped ? 'Frente' : 'Verso'})
                  </Button>
                  <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
                    Imprimir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#F8F5EC]/50 text-xs">
                Selecione uma credencial na lista ao lado.
              </div>
            )}
          </div>

          {/* Right Column: List of All Credentials */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-[#221B13]/90 border border-[#DAA017]/25 shadow-lg">
              <Input
                icon={Search}
                placeholder="Buscar por nome, código (BN-2024-...) ou cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredCredentials.map((cred) => {
                const isSelected = selectedCard?.id === cred.id;

                return (
                  <div
                    key={cred.id}
                    onClick={() => {
                      setSelectedCard(cred);
                      setIsFlipped(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#3A2E1F]/90 border-[#DAA017] shadow-[0_0_20px_rgba(218,160,23,0.25)]'
                        : 'bg-[#1A1A1A]/80 hover:bg-[#3A2E1F]/40 border-[#DAA017]/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          cred.photo_url ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={cred.person_name}
                        className="w-11 h-11 rounded-lg object-cover border border-[#DAA017]/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-sm font-bold text-[#F8F5EC] truncate">
                            {cred.person_name}
                          </h4>
                          {cred.person_role.includes('Apóstolo') || cred.person_role.includes('Pastor') ? (
                            <Crown className="w-3.5 h-3.5 text-[#DAA017] shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-xs text-[#DAA017] truncate">{cred.person_role}</p>
                        <span className="font-mono text-[10px] text-[#F8F5EC]/50">
                          {cred.code}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge
                        variant={cred.status === 'active' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {cred.status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-[#F8F5EC]/50">
                        Val: {formatDate(cred.expires_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Portaria / Access Control Scanner Simulation View */
        <div className="max-w-2xl mx-auto rounded-2xl bg-[#221B13]/95 border border-[#DAA017]/30 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#DAA017]/20 border border-[#DAA017] text-[#DAA017] flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#F8F5EC]">
              Simulador Óptico de Portaria & Acesso
            </h3>
            <p className="text-xs text-[#F8F5EC]/60 mt-1">
              Validação de crachá de membro, obreiro ou visitante em tempo real com auditoria
            </p>
          </div>

          <form onSubmit={handleScanSubmit} className="space-y-4">
            <Input
              label="Código da Credencial ou Leitura de Hash"
              icon={QrCode}
              placeholder="ex: BN-2024-0001 ou digite o código de qualquer membro..."
              value={scannerCode}
              onChange={(e) => setScannerCode(e.target.value)}
              helperText="Dica: Clique em qualquer botão abaixo para testar instantaneamente."
            />

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-[11px] text-[#DAA017] font-semibold self-center">Testar com:</span>
              <button
                type="button"
                onClick={() => setScannerCode('BN-2024-0001')}
                className="px-3 py-2 rounded-md bg-[#1A1A1A] border border-[#DAA017]/30 text-[11px] text-[#F8F5EC] hover:bg-[#DAA017]/20"
              >
                Ap. Carlos (0001)
              </button>
              <button
                type="button"
                onClick={() => setScannerCode('BN-2024-0142')}
                className="px-3 py-2 rounded-md bg-[#1A1A1A] border border-[#DAA017]/30 text-[11px] text-[#F8F5EC] hover:bg-[#DAA017]/20"
              >
                Débora Santos (0142)
              </button>
              <button
                type="button"
                onClick={() => setScannerCode('BN-INVALID-9999')}
                className="px-3 py-2 rounded-md bg-[#1A1A1A] border border-rose-500/40 text-[11px] text-rose-300 hover:bg-rose-950/40"
              >
                Código Inválido
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Processar Leitura de Acesso
            </Button>
          </form>

          {scanResult && (
            <div
              className={`p-5 rounded-xl border ${
                scanResult.valid
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-100'
                  : 'bg-rose-950/50 border-rose-500/50 text-rose-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    scanResult.valid
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {scanResult.valid ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">
                      {scanResult.valid ? 'ACESSO AUTORIZADO' : 'ACESSO NEGADO'}
                    </h4>
                    <span className="font-mono text-[10px] uppercase opacity-80">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-sm font-medium">{scanResult.message}</p>

                  {scanResult.member && (
                    <div className="p-3 rounded-lg bg-[#1A1A1A]/90 border border-[#DAA017]/30 space-y-1 text-xs">
                      <p>
                        <strong className="text-[#DAA017]">Membro:</strong> {scanResult.member.full_name}
                      </p>
                      <p>
                        <strong className="text-[#DAA017]">Cargo:</strong> {scanResult.member.ministry}
                      </p>
                      <p>
                        <strong className="text-[#DAA017]">Congregação:</strong> {currentTenant.name}
                      </p>
                      <p className="text-emerald-400 font-bold mt-1">
                        ✓ Presença e pontualidade gravadas no banco Supabase!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Emitir Nova Credencial */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Emitir Nova Credencial Digital"
        subtitle="Igreja Apostólica Boas Novas"
      >
        <form onSubmit={handleIssueNew} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#F8F5EC]/80 mb-1.5 uppercase tracking-wider">
              Selecione o Membro Cadastrado *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-[#1A1A1A] text-[#F8F5EC] rounded-lg px-3.5 py-2.5 text-sm border border-[#DAA017]/25 focus:ring-2 focus:ring-[#DAA017]/40 focus:border-[#DAA017] focus:outline-none"
              required
            >
              <option value="">Selecione um membro...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.ministry || 'Membro'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-[#1A1A1A]/80 border border-[#DAA017]/20 text-xs text-[#F8F5EC]/70">
            A emissão gerará automaticamente um código sequencial com chave hash criptografada e QR Code legível na portaria.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIssueModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Gerar & Ativar Credencial
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
