import React, { useState } from 'react';
import {
  Book,
  Search,
  Sparkles,
  Copy,
  Check,
  CalendarDays,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { YEAR_THEME, MONTHLY_THEMES_2026 } from '@/data/churchData';

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  theme: string;
}

const apostolicVerses: Verse[] = [
  {
    book: 'Mateus',
    chapter: 28,
    verse: 19,
    text: 'Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo;',
    theme: 'A Grande Comissão • Missões',
  },
  {
    book: 'Atos',
    chapter: 2,
    verse: 42,
    text: 'E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações.',
    theme: 'Os 4 Pilares da Igreja Primitiva',
  },
  {
    book: 'Efésios',
    chapter: 4,
    verse: 11,
    text: 'E ele mesmo deu uns para apóstolos, e outros para profetas, e outros para evangelistas, e outros para pastores e mestres,',
    theme: 'Ministério Quíntuplo',
  },
  {
    book: 'Isaías',
    chapter: 52,
    verse: 7,
    text: 'Quão suaves são sobre os montes os pés do que anuncia as boas novas, que faz ouvir a paz, que anuncia o bem, que faz ouvir a salvação, que diz a Sião: O teu Deus reina!',
    theme: 'Boas Novas para o Mundo',
  },
  {
    book: 'Salmos',
    chapter: 133,
    verse: 1,
    text: 'Oh! Quão bom e quão suave é que os irmãos vivam em união!',
    theme: 'Comunhão & Família',
  },
  {
    book: 'Malaquias',
    chapter: 3,
    verse: 10,
    text: 'Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, e depois fazei prova de mim, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu e não derramar sobre vós uma bênção tal, que dela vos advenha a maior abundância.',
    theme: 'Fidelidade & Dízimos',
  },
];

export const BiblePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredVerses = apostolicVerses.filter(
    (v) =>
      v.text.toLowerCase().includes(search.toLowerCase()) ||
      v.book.toLowerCase().includes(search.toLowerCase()) ||
      v.theme.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Sagrada Escritura & Doutrina Apostólica
            </h1>
            <Badge variant="gold" size="sm">
              Almeida Revista e Corrigida (ARC)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Pesquisa bíblica temática, referências de sermões pastorais e base doutrinária
          </p>
        </div>
      </div>

      {/* Tema Central do Ano */}
      <div className="rounded-3xl bg-gradient-to-r from-[#221B13] via-[#3A2E1F]/50 to-[#221B13] border border-[#DAA017]/30 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DAA017] to-[#B8860B] flex items-center justify-center text-[#1A1A1A]">
            <Crown className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#DAA017]">
            Tema Central do Ano 2026
          </span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC] leading-tight">
          {YEAR_THEME.title}
        </h2>
        <p className="mt-3 text-sm text-[#F8F5EC]/70 italic leading-relaxed max-w-3xl">
          {YEAR_THEME.verse}
        </p>
        <p className="mt-2 text-xs text-[#DAA017] font-bold">{YEAR_THEME.reference}</p>
      </div>

      {/* Temas Mensais 2026 */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#F8F5EC]">Temas Mensais da IABN</h2>
            <p className="text-[11px] text-[#F8F5EC]/50">12 meses de edificação bíblica ao longo de 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MONTHLY_THEMES_2026.map((t, idx) => (
            <div
              key={t.month}
              className="card-gold-glass rounded-2xl p-4 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#DAA017]/70 mb-1">
                {t.month} / 2026
              </p>
              <h3 className="font-serif text-base font-bold text-[#F8F5EC] leading-snug">
                {t.title}
              </h3>
              <p className="mt-2 text-xs text-[#F8F5EC]/50 font-mono">{t.reference}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Search bar */}
      <div className="pt-4">
        <div className="p-4 rounded-xl bg-[#221B13]/90 border border-[#DAA017]/25 shadow-lg">
          <Input
            icon={Search}
            placeholder="Pesquisar por livro, palavra-chave ou tema bíblico (ex: boas novas, apóstolos, dízimos)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Verses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVerses.map((verse, idx) => (
          <div
            key={idx}
            className="card-gold-glass rounded-2xl p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="gold" size="sm">
                  {verse.theme}
                </Badge>
                <button
                  onClick={() =>
                    handleCopy(`${verse.book} ${verse.chapter}:${verse.verse} - "${verse.text}"`, idx)
                  }
                  className="p-2.5 rounded-lg text-[#F8F5EC]/60 hover:text-[#DAA017] transition-colors"
                  title="Copiar Versículo"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <blockquote className="font-serif text-base sm:text-lg text-[#F8F5EC] italic leading-relaxed my-3">
                "{verse.text}"
              </blockquote>
            </div>

            <div className="pt-4 border-t border-[#DAA017]/15 flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[#DAA017]">
                {verse.book} {verse.chapter}:{verse.verse}
              </span>
              <span className="text-[11px] text-[#F8F5EC]/50 font-mono">ARC</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};