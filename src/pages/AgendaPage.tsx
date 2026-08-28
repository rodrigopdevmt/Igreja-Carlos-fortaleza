import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Filter, Users, Sparkles } from 'lucide-react';
import { useChurch, Event } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export const AgendaPage: React.FC = () => {
  const { events, currentTenant } = useChurch();
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    return e.event_type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Agenda & Calendário de Cultos
            </h1>
            <Badge variant="gold" size="sm">
              24 Eventos Programados
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Programação litúrgica oficial, celebrações, conferências, vigílias e batismos
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus}>
          Agendar Culto / Evento
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['all', 'culto', 'vigilia', 'batismo', 'conferencia'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all uppercase text-[11px] ${
              filter === f
                ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-md'
                : 'bg-[#221B13] text-[#F8F5EC]/70 hover:bg-[#3A2E1F] border border-[#DAA017]/20'
            }`}
          >
            {f === 'all' ? 'Todos os Eventos' : f}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const startDate = new Date(event.start_time);
          const endDate = new Date(event.end_time);

          return (
            <div
              key={event.id}
              className="card-gold-glass rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                {/* Date Box */}
                <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#3A2E1F] to-[#1A1A1A] border border-[#DAA017]/40 text-center min-w-[75px] shrink-0 shadow-md">
                  <p className="text-[10px] font-bold text-[#DAA017] uppercase tracking-wider">
                    {startDate.toLocaleDateString('pt-BR', { month: 'short' })}
                  </p>
                  <p className="font-serif text-2xl font-extrabold text-[#F8F5EC] leading-tight">
                    {startDate.getDate()}
                  </p>
                  <p className="text-[9px] text-[#F8F5EC]/50 uppercase">
                    {startDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                </div>

                {/* Event Details */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="gold" size="sm">
                      {event.event_type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-[#DAA017] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às{' '}
                      {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#F8F5EC] group-hover:text-[#DAA017] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-[#F8F5EC]/70 mt-1 leading-relaxed max-w-2xl">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#F8F5EC]/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#DAA017]" /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#DAA017]" /> Expectativa:{' '}
                      {event.expected_attendance} fiéis
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <Button variant="outline" size="sm">
                  Check-in / Detalhes
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
