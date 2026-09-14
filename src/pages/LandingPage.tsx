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
  ArrowRight,
  Globe2,
  Cross,
  Heart,
  BookOpen,
} from 'lucide-react';
import { GoldLogo } from '@/components/common/GoldLogo';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  const modules = [
    {
      icon: Users,
      title: 'Membros & Familias',
      description: 'Cadastro unificado, arvore genealogica de membros, historico de batismos e ministerios.',
      tag: 'Gestao 360',
    },
    {
      icon: QrCode,
      title: 'Credenciais & QR Code',
      description: 'Emissao instantanea de carteirinhas digitais com QR Code criptografado para check-in seguro.',
      tag: 'Portaria & Acessos',
    },
    {
      icon: CircleDollarSign,
      title: 'Financeiro & Dizimos',
      description: 'Controle de dizimos via PIX, ofertas, campanhas de construcao e prestacao de contas com RLS.',
      tag: 'Auditoria & PIX',
    },
    {
      icon: Cctv,
      title: 'Cameras & Seguranca',
      description: 'Monitoramento em tempo real do templo, nave, estacionamento e bercario com visao noturna.',
      tag: 'CFTV & IA',
    },
    {
      icon: Radio,
      title: 'Lives & Transmissao',
      description: 'Console de streaming integrado, chat ao vivo moderado e central de pedidos de oracao.',
      tag: 'Midia & Culto Online',
    },
    {
      icon: Network,
      title: 'Celulas & Discipulado',
      description: 'Gestao de pequenos grupos multiplicadores, relatorios de reunioes e Escola Biblica Dominical.',
      tag: 'Crescimento',
    },
  ];

  const pillars = [
    { icon: Cross, name: 'Adoracao', desc: 'Excelencia no altar e louvor que exalta a Deus' },
    { icon: Heart, name: 'Comunhao', desc: 'Uma familia unida pelo amor fraternal' },
    { icon: BookOpen, name: 'Discipulado', desc: 'Edificacao biblica continua de vidas' },
    { icon: Globe2, name: 'Missao', desc: 'Boas novas levadas a todas as nacoes' },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] relative overflow-hidden flex flex-col justify-between selection:bg-[#DAA017]/30 selection:text-[#F8F5EC]">
      <AuroraBackdrop intensity="high" showGrid={true} />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-[#DAA017]/15 bg-[#16120D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GoldLogo size="lg" showText={true} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold tracking-wider text-[#DAA017] uppercase bg-[#DAA017]/10 px-4 py-2 rounded-full border border-[#DAA017]/25">
              <ShieldCheck className="w-3.5 h-3.5" /> Igreja Boas Novas Oficial
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex-1 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#DAA017]/10 border border-[#DAA017]/40 shadow-[0_0_30px_rgba(218,160,23,0.15)] text-xs font-bold text-[#DAA017] uppercase tracking-widest mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-[#FFE898]" />
          Igreja Apostolica Boas Novas
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F8F5EC] max-w-5xl leading-[1.1] animate-fade-in-up stagger-1">
          Mission Control para sua{' '}
          <span className="gold-gradient-text">Igreja</span>
        </h1>

        {/* Slogan */}
        <p className="mt-6 text-xl sm:text-2xl font-serif text-[#DAA017] font-medium tracking-wide text-shadow-gold animate-fade-in-up stagger-2">
          "Uma Igreja, Uma Familia, Uma Missao"
        </p>
        <p className="mt-4 text-sm sm:text-base text-[#F8F5EC]/60 max-w-2xl font-light leading-relaxed animate-fade-in-up stagger-3">
          Mais que uma igreja, somos boas novas para o mundo. Sistema eclesiastico completo com banco de dados PostgreSQL em servidor VPS proprio, emissao de credenciais com QR Code, gestao financeira e monitoramento.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-in-up stagger-4">
          <Link to="/oracao" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              icon={Heart}
              className="text-sm sm:text-base px-6 sm:px-10 py-3.5 sm:py-4 glow-gold-lg w-full sm:w-auto justify-center"
            >
              Pedido de Oração
            </Button>
          </Link>
          <Link to="/demo/credentials" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" icon={QrCode} className="text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto justify-center">
              Ver Carteirinhas
            </Button>
          </Link>
        </div>

        {/* 4 Pillars */}
        <div className="mt-16 w-full grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.name}
                className={`p-5 rounded-2xl card-gold-glass text-center hover-lift animate-fade-in-up stagger-${idx + 1}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#DAA017]" />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#DAA017] tracking-wider uppercase">
                  {pillar.name}
                </h4>
                <p className="text-[11px] text-[#F8F5EC]/50 mt-1.5 leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Modules Grid */}
        <div className="mt-24 w-full text-left">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Modulos Integrados da Plataforma
            </h2>
            <p className="text-xs sm:text-sm text-[#DAA017]/70 mt-2">
              Desenvolvido sob medida para a lideranca pastoral, secretaria, financas e membros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className={`card-gold-glass rounded-2xl p-6 hover-lift animate-fade-in-up stagger-${(idx % 6) + 1}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 text-[#DAA017] transition-transform duration-300 hover:scale-110">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-[#DAA017]/10 text-[#DAA017] border border-[#DAA017]/25">
                      {mod.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#F8F5EC] group-hover:text-[#DAA017] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[#F8F5EC]/60 mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 w-full rounded-3xl bg-gradient-to-r from-[#221B13] via-[#3A2E1F]/40 to-[#221B13] border border-[#DAA017]/25 p-8 sm:p-10 backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12+', label: 'Modulos Eclesiasticos' },
              { value: 'RBAC', label: 'Hierarquia Pastoral & Obreiros' },
              { value: '100%', label: 'Seguranca & Protecao de Dados' },
              { value: '24/7', label: 'Alta Disponibilidade Cloud' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl sm:text-4xl font-bold gold-gradient-text">
                  {stat.value}
                </p>
                <p className="text-xs text-[#F8F5EC]/50 uppercase tracking-wider mt-2 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#DAA017]/15 bg-[#14100C]/90 backdrop-blur-sm py-10 text-center text-xs text-[#F8F5EC]/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <GoldLogo size="sm" />
            <span className="font-serif text-sm font-bold text-[#F8F5EC]">
              Igreja Apostolica Boas Novas
            </span>
          </div>
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Todos os direitos reservados. Uma Igreja, Uma Familia, Uma Missao.
          </p>
        </div>
      </footer>
    </div>
  );
};
