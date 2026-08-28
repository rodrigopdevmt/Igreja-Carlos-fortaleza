import React from 'react';
import { Network, Users, MapPin, Clock, Plus, Sparkles, Building2 } from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const GroupsPage: React.FC = () => {
  const { groups, currentTenant } = useChurch();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Células & Redes Ministeriais
            </h1>
            <Badge variant="gold" size="sm">
              {groups.length} Grupos Ativos
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Supervisão de Pequenos Grupos Multiplicadores (PGMs), redes de jovens, casais e liderança
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus}>
          Nova Célula / Grupo
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="card-gold-glass rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/40 text-[#DAA017]">
                  <Network className="w-5 h-5" />
                </div>
                <Badge variant="gold" size="sm">
                  {group.category.toUpperCase()}
                </Badge>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#F8F5EC] group-hover:text-[#DAA017] transition-colors">
                {group.name}
              </h3>
              <p className="text-xs text-[#F8F5EC]/70 mt-1.5 leading-relaxed">
                {group.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DAA017]/15 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#F8F5EC]/80">
                <span className="text-[#DAA017] font-semibold">Líder Responsável:</span>
                <span>{group.leader_name}</span>
              </div>
              <div className="flex items-center justify-between text-[#F8F5EC]/80">
                <span className="text-[#DAA017] font-semibold">Encontros:</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#DAA017]" /> {group.meeting_day} às {group.meeting_time}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#F8F5EC]/80">
                <span className="text-[#DAA017] font-semibold">Discípulos Frequentes:</span>
                <span className="font-bold text-emerald-400">{group.members_count} membros</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
