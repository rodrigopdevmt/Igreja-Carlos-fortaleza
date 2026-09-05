import React from 'react';
import { ClipboardList, Users, Crown, HandHeart, DoorOpen, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SERVICE_SCALE_AGOSTO } from '@/data/churchData';

export const ServiceScalePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Escala de Serviço Religioso
            </h1>
            <Badge variant="gold" size="sm">
              Agosto / 2026
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Escala oficial dos cultos da IABN — dirigentes, preletores, recepção e portaria
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#F8F5EC]/50">
          <Calendar className="w-4 h-4 text-[#DAA017]" />
          <span>{SERVICE_SCALE_AGOSTO.length} cultos programados</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#221B13]/80 border border-[#DAA017]/20 text-xs">
        <span className="flex items-center gap-1.5 text-[#DAA017] font-semibold">
          <Crown className="w-3.5 h-3.5" /> Dirigente
        </span>
        <span className="flex items-center gap-1.5 text-[#F8F5EC]/70">
          <Users className="w-3.5 h-3.5 text-emerald-400" /> Preletor
        </span>
        <span className="flex items-center gap-1.5 text-[#F8F5EC]/70">
          <HandHeart className="w-3.5 h-3.5 text-sky-400" /> Recepção
        </span>
        <span className="flex items-center gap-1.5 text-[#F8F5EC]/70">
          <DoorOpen className="w-3.5 h-3.5 text-amber-400" /> Portaria
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block card-gold-glass rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#3A2E1F] to-[#2A2116] text-[#DAA017] uppercase tracking-wider text-[11px] font-bold border-b border-[#DAA017]/30">
              <th className="py-4 px-5">Data</th>
              <th className="py-4 px-5">Culto</th>
              <th className="py-4 px-5">Dirigente</th>
              <th className="py-4 px-5">Preletor</th>
              <th className="py-4 px-5">Recepção</th>
              <th className="py-4 px-5">Portaria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DAA017]/10">
            {SERVICE_SCALE_AGOSTO.map((row) => (
              <tr key={row.date} className="hover:bg-[#DAA017]/5 transition-colors">
                <td className="py-3.5 px-5 font-mono text-[#DAA017] font-bold">{row.date}</td>
                <td className="py-3.5 px-5 text-[#F8F5EC] font-medium">{row.service}</td>
                <td className="py-3.5 px-5 flex items-center gap-2 text-[#F8F5EC]">
                  <Crown className="w-4 h-4 text-[#DAA017]" /> {row.leader}
                </td>
                <td className="py-3.5 px-5 text-emerald-300 flex items-center gap-2">
                  <Users className="w-4 h-4" /> {row.preacher}
                </td>
                <td className="py-3.5 px-5 text-sky-300 flex items-center gap-2">
                  <HandHeart className="w-4 h-4" /> {row.reception}
                </td>
                <td className="py-3.5 px-5 text-amber-300 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4" /> {row.doorman}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {SERVICE_SCALE_AGOSTO.map((row) => (
          <div key={row.date} className="card-gold-glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[#DAA017] font-bold">{row.date}</span>
              <Badge variant="gold" size="sm">{row.service}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#F8F5EC]/80">
                <Crown className="w-3.5 h-3.5 text-[#DAA017] shrink-0" />
                <span><span className="text-[#F8F5EC]/40 block text-[10px]">Dirigente</span>{row.leader}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span><span className="text-[#F8F5EC]/40 block text-[10px]">Preletor</span>{row.preacher}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300">
                <HandHeart className="w-3.5 h-3.5 shrink-0" />
                <span><span className="text-[#F8F5EC]/40 block text-[10px]">Recepção</span>{row.reception}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <DoorOpen className="w-3.5 h-3.5 shrink-0" />
                <span><span className="text-[#F8F5EC]/40 block text-[10px]">Portaria</span>{row.doorman}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Observation */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
        <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Observação:</strong> Caso alguém escalado não possa vir no dia, por favor avisar com antecedência
          para substituição, ligando para a nossa secretaria.
        </span>
      </div>
    </div>
  );
};