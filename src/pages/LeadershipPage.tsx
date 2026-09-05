import React from 'react';
import {
  Crown,
  Users,
  Baby,
  Heart,
  Home,
  Music,
  BookOpen,
  HandHeart,
  Flame,
  Users2,
  Share2,
  PartyPopper,
  Wrench,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface LeadershipMember {
  role: string;
  name: string;
}

interface Ministry {
  id: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  leaders: string[];
  support: string[];
  accent?: string;
}

const board: LeadershipMember[] = [
  { role: 'Presidente', name: 'Carlos Demontieux' },
  { role: 'Vice-presidente', name: 'Mônica Sousa' },
  { role: '1ª Secretaria', name: 'Lorena Sousa' },
  { role: '2ª Secretaria', name: 'Priscila Bárbara' },
  { role: '1º Tesouraria', name: 'Daniel Alecrim' },
  { role: '2º Tesouraria', name: 'Fernanda Borges' },
];

const fiscalCouncil: string[] = ['Matheus Eduardo', 'Neire Costa', 'Priscila Bárbara'];

const ministries: Ministry[] = [
  {
    id: 1,
    name: 'Infantil',
    icon: Baby,
    leaders: ['Fernanda', 'Maria'],
    support: [],
  },
  {
    id: 2,
    name: 'Adolescentes',
    icon: Users2,
    leaders: ['Priscila', 'Lorena'],
    support: ['Darliany', 'Marquinhos'],
  },
  {
    id: 3,
    name: 'Homens',
    icon: Users,
    leaders: ['Demontieux', 'Ednei'],
    support: ['Júnior'],
  },
  {
    id: 4,
    name: 'Mulheres',
    icon: Heart,
    leaders: ['Mônica', 'Neire'],
    support: ['Maria', 'Fernanda'],
  },
  {
    id: 5,
    name: 'Casais',
    icon: Home,
    leaders: ['Demontieux & Mônica', 'Ednei & Mércia'],
    support: [],
  },
  {
    id: 6,
    name: 'Louvor',
    icon: Music,
    leaders: ['Matheus', 'Lorena'],
    support: [],
  },
  {
    id: 7,
    name: 'Ensino',
    icon: BookOpen,
    leaders: ['Regys', 'Ednei'],
    support: [],
  },
  {
    id: 8,
    name: 'Integração',
    icon: HandHeart,
    leaders: ['Danilo', 'Neire'],
    support: ['Neide'],
  },
  {
    id: 9,
    name: 'Intercessão',
    icon: Flame,
    leaders: ['Neire', 'Danilo'],
    support: ['Mércia', 'Priscila'],
  },
  {
    id: 10,
    name: 'Pequenos Grupos',
    icon: Users2,
    leaders: ['Demontieux', 'Marquinhos'],
    support: [],
  },
  {
    id: 11,
    name: 'Mídias',
    icon: Share2,
    leaders: ['Priscila', 'Matheus', 'Fernanda'],
    support: [],
  },
  {
    id: 12,
    name: 'Eventos',
    icon: PartyPopper,
    leaders: ['Fernanda', 'Gleyce'],
    support: ['Carla'],
  },
  {
    id: 13,
    name: 'Manutenção',
    icon: Wrench,
    leaders: ['Marquinhos', 'Daniel'],
    support: ['Júnior'],
  },
];

export const LeadershipPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Diretoria & Lideranças
            </h1>
            <Badge variant="gold" size="sm">
              Biênio 2026/2028
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Membros eleitos na Assembleia Geral Ordinária e liderança dos ministérios da IABN
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#DAA017] font-bold uppercase tracking-wider bg-[#DAA017]/10 px-4 py-2 rounded-full border border-[#DAA017]/25">
          <ShieldCheck className="w-4 h-4" /> Gestão 2026/2028
        </div>
      </div>

      {/* Nova Diretoria */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAA017] to-[#B8860B] flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[#DAA017]/25">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#F8F5EC]">Nova Diretoria da IABN</h2>
            <p className="text-[11px] text-[#F8F5EC]/50">
              Eleita na Assembleia Geral Ordinária para o Biênio 2026/2028
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {board.map((member, idx) => (
            <div
              key={member.role}
              className="card-gold-glass rounded-2xl p-5 flex items-center gap-4 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="w-12 h-12 shrink-0 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017] font-serif font-bold text-lg">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#DAA017]/80">
                  {member.role}
                </p>
                <p className="font-serif font-bold text-[#F8F5EC] text-base truncate">
                  {member.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conselho Fiscal */}
      <section className="card-gold-glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">Conselho Fiscal</h3>
            <p className="text-[11px] text-[#F8F5EC]/50">Fiscalização e transparência da gestão financeira</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {fiscalCouncil.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 text-sm font-semibold text-[#F8F5EC]"
            >
              <Sparkles className="w-4 h-4 text-[#DAA017]" />
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Liderança de Ministérios */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#F8F5EC]">
              Liderança de Ministérios da IABN
            </h2>
            <p className="text-[11px] text-[#F8F5EC]/50">
              {ministries.length} ministérios ativos com seus líderes e equipes de apoio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ministries.map((ministry, idx) => {
            const Icon = ministry.icon;
            return (
              <div
                key={ministry.id}
                className="card-gold-glass rounded-2xl p-5 flex flex-col hover-lift animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-[#F8F5EC] text-base">
                      {ministry.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DAA017]/70">
                      Ministério {String(ministry.id).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-[#DAA017]/15 pt-3.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#DAA017] mb-1.5">
                      {ministry.leaders.length > 1 ? 'Liderança' : 'Líder'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ministry.leaders.map((leader) => (
                        <span
                          key={leader}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#DAA017] text-[#1A1A1A] text-xs font-bold"
                        >
                          <Crown className="w-3 h-3" />
                          {leader}
                        </span>
                      ))}
                    </div>
                  </div>

                  {ministry.support.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#F8F5EC]/50 mb-1.5">
                        Apoio
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ministry.support.map((person) => (
                          <span
                            key={person}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#1A1A1A]/60 border border-[#DAA017]/20 text-[11px] text-[#F8F5EC]/80 font-medium"
                          >
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-[#221B13] via-[#3A2E1F]/40 to-[#221B13] border border-[#DAA017]/25 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#F8F5EC]">
            Equipe completa em comunhão para servir
          </h3>
          <p className="text-xs text-[#F8F5EC]/60 mt-1">
            Uma Igreja, Uma Família, Uma Missão — juntos para edificar o Reino.
          </p>
        </div>
        <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
          Ver Membros Completos
        </Button>
      </div>
    </div>
  );
};