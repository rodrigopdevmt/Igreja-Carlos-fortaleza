import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  LogOut,
  CreditCard,
  GraduationCap,
  Droplets,
  User,
  Calendar,
  Building2,
  ShieldCheck,
  Download,
  Sparkles,
  Phone,
  Mail,
  Hash,
} from 'lucide-react';
import { GoldLogo } from '@/components/common/GoldLogo';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface MemberSession {
  personId: string;
  fullName: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
  baptismDate: string;
  ministry: string;
  photoUrl: string | null;
  credentialCode: string | null;
  credentialRole: string | null;
}

type ActiveTab = 'carteirinha' | 'certificados' | 'batismo';

export const MemberAreaPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<MemberSession | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('carteirinha');
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('iabn_member_session');
    if (!stored) {
      navigate('/carteirinha');
      return;
    }
    setSession(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('iabn_member_session');
    navigate('/carteirinha');
  };

  if (!session) return null;

  const initials = session.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const tabs = [
    { id: 'carteirinha' as ActiveTab, label: 'Carteirinha', icon: CreditCard },
    { id: 'certificados' as ActiveTab, label: 'Certificados', icon: GraduationCap },
    { id: 'batismo' as ActiveTab, label: 'Batismo', icon: Droplets },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] relative overflow-hidden selection:bg-[#DAA017]/30 selection:text-[#F8F5EC]">
      <AuroraBackdrop intensity="low" showGrid={true} />

      {/* Header */}
      <header className="relative z-10 border-b border-[#DAA017]/15 bg-[#16120D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#F8F5EC]/60 hover:text-[#DAA017] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Voltar ao Site</span>
          </Link>
          <GoldLogo size="sm" showText={true} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-[#F8F5EC]/50 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DAA017]/10 border border-[#DAA017]/30 text-xs font-bold text-[#DAA017] uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE898]" />
            Área do Membro
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
            Olá, <span className="gold-gradient-text">{session.fullName.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-[#F8F5EC]/50 mt-1">{session.ministry || 'Membro Ativo'}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#DAA017]/20 text-[#DAA017] border border-[#DAA017]/40 shadow-[0_0_20px_rgba(218,160,23,0.15)]'
                    : 'bg-[#2A2218]/50 text-[#F8F5EC]/50 border border-[#DAA017]/10 hover:text-[#DAA017]/70 hover:border-[#DAA017]/25'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'carteirinha' && (
          <div className="flex flex-col items-center gap-8">
            {/* Card */}
            <div
              className="w-full max-w-md cursor-pointer perspective-1000"
              onClick={() => setCardFlipped(!cardFlipped)}
            >
              <div
                className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
                  cardFlipped ? 'rotate-y-180' : ''
                }`}
                style={{ minHeight: '260px' }}
              >
                {/* Front */}
                <div className={`absolute inset-0 backface-hidden ${cardFlipped ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="w-full rounded-2xl overflow-hidden border-2 border-[#DAA017]/40 shadow-[0_0_40px_rgba(218,160,23,0.2)]">
                    <div className="bg-gradient-to-br from-[#2A2218] via-[#1E1812] to-[#16120D] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <GoldLogo size="sm" />
                        <span className="text-[10px] font-bold text-[#DAA017] uppercase tracking-widest bg-[#DAA017]/10 px-3 py-1 rounded-full border border-[#DAA017]/25">
                          {session.credentialCode || 'BN-2026-0000'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#DAA017] to-[#855E09] flex items-center justify-center text-[#1A1A1A] font-serif font-bold text-xl border-2 border-[#DAA017]/50 flex-shrink-0">
                          {session.photoUrl ? (
                            <img src={session.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-bold text-[#F8F5EC] truncate">{session.fullName}</h3>
                          <p className="text-xs text-[#DAA017] font-medium">{session.credentialRole || session.ministry || 'Membro Ativo'}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <ShieldCheck className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] text-green-400 font-bold uppercase">Credencial Ativa</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#DAA017]/15 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-[#DAA017]/50" />
                          <span className="text-[10px] text-[#F8F5EC]/50">Igreja Boas Novas - Fortaleza/CE</span>
                        </div>
                        <span className="text-[10px] text-[#DAA017]/60">Tap para ver QR Code</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 ${cardFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-full rounded-2xl overflow-hidden border-2 border-[#DAA017]/40 shadow-[0_0_40px_rgba(218,160,23,0.2)]">
                    <div className="bg-gradient-to-br from-[#2A2218] via-[#1E1812] to-[#16120D] p-6 flex flex-col items-center justify-center" style={{ minHeight: '260px' }}>
                      <QRCodeSVG
                        value={`BN:AUTH:${session.credentialCode || '0000'}:${session.fullName.toUpperCase().replace(/\s+/g, '-')}`}
                        size={140}
                        bgColor="#1E1812"
                        fgColor="#DAA017"
                        level="H"
                        includeMargin={false}
                      />
                      <p className="text-xs text-[#DAA017] font-bold mt-4 uppercase tracking-wider">
                        {session.credentialCode || 'BN-2026-0000'}
                      </p>
                      <p className="text-[10px] text-[#F8F5EC]/40 mt-1">Apresente este QR Code na entrada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="w-full max-w-md card-gold-glass rounded-2xl p-6 border border-[#DAA017]/15">
              <h3 className="font-serif text-sm font-bold text-[#DAA017] uppercase tracking-wider mb-4">Dados Pessoais</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-[#DAA017]/50" />
                  <span className="text-[#F8F5EC]/70">{session.fullName}</span>
                </div>
                {session.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[#DAA017]/50" />
                    <span className="text-[#F8F5EC]/70">{session.email}</span>
                  </div>
                )}
                {session.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[#DAA017]/50" />
                    <span className="text-[#F8F5EC]/70">{session.phone}</span>
                  </div>
                )}
                {session.document && (
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="w-4 h-4 text-[#DAA017]/50" />
                    <span className="text-[#F8F5EC]/70">{session.document}</span>
                  </div>
                )}
                {session.birthDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[#DAA017]/50" />
                    <span className="text-[#F8F5EC]/70">{formatDate(session.birthDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certificados' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md card-gold-glass rounded-2xl p-8 border border-[#DAA017]/15 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-[#DAA017]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F8F5EC] mb-2">Certificados de Cursos</h3>
              <p className="text-sm text-[#F8F5EC]/50 mb-6">
                Aqui estarão disponíveis seus certificados de conclusão de cursos e treinamentos da igreja.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2A2218]/60 border border-[#DAA017]/10">
                  <div className="w-10 h-10 rounded-lg bg-[#DAA017]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#DAA017]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-[#F8F5EC]">Escola Bíblica Dominical</p>
                    <p className="text-xs text-[#F8F5EC]/40">Módulo 1 - Fundamentos da Fé</p>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">Pendente</span>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2A2218]/60 border border-[#DAA017]/10">
                  <div className="w-10 h-10 rounded-lg bg-[#DAA017]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#DAA017]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-[#F8F5EC]">Formação de Líderes</p>
                    <p className="text-xs text-[#F8F5EC]/40">Ministério de Pequenos Grupos</p>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">Pendente</span>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2A2218]/60 border border-[#DAA017]/10">
                  <div className="w-10 h-10 rounded-lg bg-[#DAA017]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#DAA017]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-[#F8F5EC]">Teologia Básica</p>
                    <p className="text-xs text-[#F8F5EC]/40">Doutrinas Fundamentais</p>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">Pendente</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batismo' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md card-gold-glass rounded-2xl overflow-hidden border border-[#DAA017]/15">
              {/* Header do certificado */}
              <div className="bg-gradient-to-r from-[#2A2218] via-[#3A2E1F]/40 to-[#2A2218] p-6 text-center border-b border-[#DAA017]/15">
                <GoldLogo size="sm" />
                <h2 className="font-serif text-lg font-bold text-[#DAA017] mt-3 uppercase tracking-wider">
                  Certificado de Batismo
                </h2>
                <p className="text-xs text-[#F8F5EC]/40 mt-1">Igreja Apostólica Boas Novas</p>
              </div>

              {/* Corpo do certificado */}
              <div className="p-8 text-center">
                {session.baptismDate ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                      <Droplets className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-xs text-[#F8F5EC]/50 uppercase tracking-wider mb-2">Certificamos que</p>
                    <h3 className="font-serif text-2xl font-bold text-[#F8F5EC] mb-2">{session.fullName}</h3>
                    <p className="text-xs text-[#F8F5EC]/50 mb-4">recebeu o Sacramento do Batismo em águas</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/25 mb-4">
                      <Calendar className="w-4 h-4 text-[#DAA017]" />
                      <span className="font-serif text-sm font-bold text-[#DAA017]">{formatDate(session.baptismDate)}</span>
                    </div>
                    <p className="text-xs text-[#F8F5EC]/40 mb-6">
                      Fortaleza - CE
                    </p>
                    <div className="pt-4 border-t border-[#DAA017]/15">
                      <p className="text-xs text-[#DAA017] font-bold">Pr. Carlos Demontieux</p>
                      <p className="text-[10px] text-[#F8F5EC]/40">Pastor Presidente</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center mx-auto mb-4">
                      <Droplets className="w-8 h-8 text-[#DAA017]" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#F8F5EC] mb-2">Certificado de Batismo</h3>
                    <p className="text-sm text-[#F8F5EC]/50">
                      Seu certificado de batismo será disponibilizado aqui após a confirmação pela secretaria da igreja.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
