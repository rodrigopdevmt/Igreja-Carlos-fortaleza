import React from 'react';
import { GraduationCap, BookOpen, Users, Award, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const classes = [
  {
    id: 'ebd-1',
    title: 'Fundamentos da Fé & Doutrina Apostólica',
    teacher: 'Pr. Marcos Silva',
    target: 'Novos Membros e Batizandos',
    studentsCount: 38,
    progress: 75,
    lessonToday: 'Lição 06: A Trindade e a Obra do Espírito Santo',
    time: 'Domingo às 09:00',
  },
  {
    id: 'ebd-2',
    title: 'Discipulado Bíblico Avançado & Hermenêutica',
    teacher: 'Ap. Carlos de Oliveira',
    target: 'Liderança e Obreiros',
    studentsCount: 52,
    progress: 60,
    lessonToday: 'Lição 08: As Cartas Paulinas e o Governo Eclesiástico',
    time: 'Domingo às 09:00',
  },
  {
    id: 'ebd-3',
    title: 'Geração Futuro (Boas Novas Kids)',
    teacher: 'Pra. Débora Santos',
    target: 'Crianças de 05 a 11 anos',
    studentsCount: 64,
    progress: 90,
    lessonToday: 'Lição 10: O Fruto do Espírito - Amor e Bondade',
    time: 'Domingo às 09:00',
  },
  {
    id: 'ebd-4',
    title: 'Conexão Jovem & Reino de Deus',
    teacher: 'Ev. Felipe Amorim',
    target: 'Adolescentes e Universitários',
    studentsCount: 45,
    progress: 50,
    lessonToday: 'Lição 05: Vivendo em Santidade na Sociedade Moderna',
    time: 'Sábado às 17:00',
  },
];

export const SundaySchoolPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Escola Bíblica Dominical & Discipulado
            </h1>
            <Badge variant="gold" size="sm">
              EBD 2026
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Formação teológica, ensino apostólico, controle de frequência e materiais didáticos
          </p>
        </div>

        <Button variant="primary" size="sm" icon={BookOpen}>
          Baixar Revista EBD Digital
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="card-gold-glass rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/40 text-[#DAA017]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <Badge variant="gold" size="sm">
                  {cls.target}
                </Badge>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#F8F5EC] group-hover:text-[#DAA017] transition-colors">
                {cls.title}
              </h3>
              <p className="text-xs text-[#DAA017] font-semibold mt-1">
                Professor: {cls.teacher}
              </p>

              <div className="p-3 rounded-xl bg-[#1A1A1A]/80 border border-[#DAA017]/20 mt-4 space-y-1">
                <p className="text-[10px] text-[#DAA017] font-bold uppercase tracking-wider">
                  Lição da Semana
                </p>
                <p className="text-xs font-medium text-[#F8F5EC]">{cls.lessonToday}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DAA017]/15 space-y-3">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-[#F8F5EC]/70 mb-1">
                  <span>Progresso do Módulo:</span>
                  <span className="font-mono text-[#DAA017] font-bold">{cls.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1A1A1A] overflow-hidden border border-[#DAA017]/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#DAA017] to-[#FFE898]"
                    style={{ width: `${cls.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#F8F5EC]/60 pt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#DAA017]" /> {cls.studentsCount} matriculados
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#DAA017]" /> {cls.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
