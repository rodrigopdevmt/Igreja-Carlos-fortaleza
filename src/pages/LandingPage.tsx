import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  QrCode,
  CircleDollarSign,
  Cctv,
  Radio,
  Network,
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Flame,
  Globe2,
} from 'lucide-react';
import { GoldLogo } from '@/components/common/GoldLogo';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  const modules = [
    {
      icon: Users,
      title: 'Membros & Famílias',
      description: 'Cadastro unificado, árvore genealógica de membros, histórico de batismos e ministérios.',
      tag: 'Gestão 360°',
    },
    {
      icon: QrCode,
      title: 'Credenciais & QR Code',
      description: 'Emissão instantânea de carteirinhas digitais com QR Code criptografado para check-in seguro.',
      tag: 'Portaria & Acessos',
    },
    {
      icon: CircleDollarSign,
      title: 'Financeiro & Dízimos',
      description: 'Controle de dízimos via PIX, ofertas, campanhas de construção e prestação de contas com RLS.',
      tag: 'Auditoria & PIX',
    },
    {
      icon: Cctv,
      title: 'Câmeras & Segurança',
      description: 'Monitoramento em tempo real do templo, nave, estacionamento e berçário com visão noturna.',
      tag: 'CFTV & IA',
    },
    {
      icon: Radio,
      title: 'Lives & Transmissão',
      description: 'Console de streaming integrado, chat ao vivo moderado e central de pedidos de oração.',
      tag: 'Mídia & Culto Online',
    },
    {
      icon: Network,
      title: 'Células & Discipulado',
      description: 'Gestão de pequenos grupos multiplicadores, relatórios de reuniões e Escola Bíblica Dominical.',
      tag: 'Crescimento',
    },
  ];

  const pillars = [
    { name: 'Adoração', desc: 'Excelência no altar e louvor que exalta a Deus' },
    { name: 'Comunhão', desc: 'Uma família unida pelo amor fraternal' },
    { name: 'Discipulado', desc: 'Edificação bíblica contínua de vidas' },
    { name: 'Missão', desc: 'Boas novas levadas a todas as nações' },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] relative overflow-hidden flex flex-col justify-between selection:bg-[#DAA017]/30 selection:text-[#F8F5EC]">
      {/* Background Aurora */}
      <AuroraBackdrop intensity="high" showGrid={true} />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-[#DAA017]/20 bg-[#16120D]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GoldLogo size="lg" showText={true} />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold tracking-wider text-[#DAA017] uppercase bg-[#3A2E1F]/50 px-3 py-1.5 rounded-full border border-[#DAA017]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Igreja Boas Novas Oficial
            </div>
            <Link to="/demo/dashboard">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Acessar Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex-1 flex flex-col items-center text-center">
        {/* Top Apostolic Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3A2E1F]/70 border border-[#DAA017]/50 shadow-[0_0_20px_rgba(218,160,23,0.2)] text-xs font-semibold text-[#DAA017] uppercase tracking-widest mb-8">
          <Sparkles className="w-4 h-4 text-[#FFE898]" />
          Igreja Apostólica Boas Novas
        </div>

        {/* Hero Title with Institutional Typography */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F8F5EC] max-w-5xl leading-[1.15]">
          Mission Control para sua <span className="text-gold-gradient">Igreja</span>
        </h1>

        {/* Slogan & Institutional Phrase */}
        <p className="mt-5 text-xl sm:text-2xl font-serif text-[#DAA017] font-medium tracking-wide">
          "Uma Igreja, Uma Família, Uma Missão"
        </p>
        <p className="mt-3 text-sm sm:text-base text-[#F8F5EC]/70 max-w-2xl font-light">
          Mais que uma igreja, somos boas novas para o mundo. Sistema eclesiástico completo com banco de dados PostgreSQL em servidor VPS próprio, emissão de credenciais com QR Code, gestão financeira e monitoramento.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link to="/demo/dashboard">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="text-base px-8 py-4 glow-gold-lg"
            >
              Abrir Console Operacional
            </Button>
          </Link>
          <Link to="/demo/credentials">
            <Button variant="outline" size="lg" icon={QrCode} className="text-base px-6 py-4">
              Ver Carteirinhas Digitais
            </Button>
          </Link>
        </div>

        {/* 4 Pillars Section */}
        <div className="mt-14 w-full grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
          {pillars.map((pillar) => (
            <div
              key={pillar.name}
              className="p-3.5 rounded-xl bg-[#3A2E1F]/30 border border-[#DAA017]/20 backdrop-blur-sm text-center"
            >
              <h4 className="font-serif text-sm font-bold text-[#DAA017] tracking-wider uppercase">
                {pillar.name}
              </h4>
              <p className="text-[11px] text-[#F8F5EC]/60 mt-1">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* 6 Essential Modules Grid */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Módulos Integrados da Plataforma
            </h2>
            <p className="text-xs sm:text-sm text-[#DAA017]/80 mt-1">
              Desenvolvido sob medida para a liderança pastoral, secretaria, finanças e membros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="card-gold-glass rounded-2xl p-6 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/40 text-[#DAA017] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#DAA017]/15 text-[#DAA017] border border-[#DAA017]/30">
                      {mod.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#F8F5EC] group-hover:text-[#DAA017] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[#F8F5EC]/70 mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enterprise Architecture Stats Bar */}
        <div className="mt-16 w-full rounded-2xl bg-gradient-to-r from-[#221B13] via-[#3A2E1F]/60 to-[#221B13] border border-[#DAA017]/30 p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                12+
              </p>
              <p className="text-xs text-[#F8F5EC]/60 uppercase tracking-wider mt-1">
                Módulos Eclesiásticos
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                RBAC
              </p>
              <p className="text-xs text-[#F8F5EC]/60 uppercase tracking-wider mt-1">
                Hierarquia Pastoral & Obreiros
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                100%
              </p>
              <p className="text-xs text-[#F8F5EC]/60 uppercase tracking-wider mt-1">
                Segurança & Proteção de Dados
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                24/7
              </p>
              <p className="text-xs text-[#F8F5EC]/60 uppercase tracking-wider mt-1">
                Alta Disponibilidade Cloud
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 border-t border-[#DAA017]/20 bg-[#14100C] py-8 text-center text-xs text-[#F8F5EC]/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GoldLogo size="sm" />
            <span className="font-serif text-sm font-bold text-[#F8F5EC]">
              Igreja Apostólica Boas Novas
            </span>
          </div>
          <p>© {new Date().getFullYear()} Todos os direitos reservados. Uma Igreja, Uma Família, Uma Missão.</p>
        </div>
      </footer>
    </div>
  );
};
