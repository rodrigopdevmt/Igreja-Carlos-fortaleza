import React from 'react';
import { Calendar, Clock, Sparkles, Flame, Users, School, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MONTHLY_PROGRAM_AGOSTO, MonthlyEvent } from '@/data/churchData';

const typeConfig: Record<MonthlyEvent['type'], { label: string; className: string; icon?: React.ComponentType<{ className?: string }> }> = {
  culto: { label: 'Culto', className: 'bg-[#DAA017] text-[#1A1A1A] border-[#DAA017]', icon: Heart },
  reuniao: { label: 'Reunião', className: 'bg-[#DAA017]/15 text-[#DAA017] border-[#DAA017]/40', icon: Users },
  oracao: { label: 'Oração & Bíblia', className: 'bg-amber-950/60 text-amber-300 border-amber-500/40', icon: Flame },
  ensino: { label: 'Ensino', className: 'bg-sky-950/60 text-sky-300 border-sky-500/40', icon: School },
  livre: { label: 'Livre', className: 'bg-[#1A1A1A] text-[#F8F5EC]/40 border-[#3A2E1F]' },
  especial: { label: 'Especial', className: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40', icon: Sparkles },
};

export const MonthlyProgramPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Programação Mensal
            </h1>
            <Badge variant="gold" size="sm">
              Agosto / 2026
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Onde o solitário mora em família! — "Coroas o ano com a tua bondade, e por onde passas emana fartura" (Salmo 65:11)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#F8F5EC]/50">
          <Calendar className="w-4 h-4 text-[#DAA017]" />
          <span>31 dias de programação</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.className}`}
          >
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {MONTHLY_PROGRAM_AGOSTO.map((event, idx) => {
          const cfg = typeConfig[event.type];
          const Icon = cfg.icon;

          return (
            <div
              key={event.day}
              className="card-gold-glass rounded-2xl p-4 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${Math.min(idx * 0.03, 0.6)}s` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAA017] to-[#B8860B] flex items-center justify-center text-[#1A1A1A] font-serif font-bold">
                    {event.day}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#F8F5EC]/40 font-bold">
                      {event.dayLabel}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase uppercase border ${cfg.className}`}
                >
                  {Icon && <Icon className="w-2.5 h-2.5" />}
                  {cfg.label}
                </span>
              </div>

              <p className="text-sm font-medium text-[#F8F5EC] leading-snug whitespace-pre-line">
                {event.event}
              </p>

              {event.time && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#DAA017] font-bold">
                  <Clock className="w-3 h-3" /> {event.time}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer verse */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#221B13] via-[#3A2E1F]/40 to-[#221B13] border border-[#DAA017]/25 text-center">
        <p className="font-serif text-sm sm:text-base text-[#F8F5EC] italic">
          "Portanto, como vocês receberam Cristo Jesus, o Senhor, continuem a viver nele, enraizados e
          edificados nele, firmados na fé, como foram ensinados, transbordando de gratidão."
        </p>
        <p className="mt-2 text-xs text-[#DAA017] font-bold">Colossenses 2:6,7</p>
      </div>
    </div>
  );
};