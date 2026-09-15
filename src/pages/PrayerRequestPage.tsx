import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Send,
  Sparkles,
  ShieldCheck,
  Globe2,
  Flame,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Quote,
  Lock,
} from 'lucide-react';
import { GoldLogo } from '@/components/common/GoldLogo';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  PrayerRequest,
  PRAYER_CATEGORIES,
  submitPrayerRequestToDb,
  fetchPrayerRequestsFromDb,
} from '@/services/prayerRequestService';
import { useChurch } from '@/context/ChurchContext';

const SEED_REQUESTS: PrayerRequest[] = [
  {
    id: 'prayer-seed-1',
    tenant_id: 'tenant-sede',
    name: 'Anônimo',
    category: 'saude',
    request: 'Peço oração pela cura e restauração da saúde do meu irmão que está internado no hospital.',
    is_anonymous: true,
    status: 'in_intercession',
    prayer_count: 24,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'prayer-seed-2',
    tenant_id: 'tenant-sede',
    name: 'Fernanda',
    category: 'familia',
    request: 'Oração pela restauração do meu casamento e pela união da minha família.',
    is_anonymous: false,
    status: 'in_intercession',
    prayer_count: 18,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'prayer-seed-3',
    tenant_id: 'tenant-sede',
    name: 'Anônimo',
    category: 'financeiro',
    request: 'Peço oração por portas abertas de emprego e provisão financeira para minha casa.',
    is_anonymous: true,
    status: 'pending',
    prayer_count: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const PrayerRequestPage: React.FC = () => {
  const { currentTenant } = useChurch();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<PrayerRequest[]>(SEED_REQUESTS);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<PrayerRequest['category']>('saude');
  const [formRequest, setFormRequest] = useState('');
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [interceding, setInterceding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPrayerRequestsFromDb(currentTenant.id).then((db) => {
      if (db.length > 0) {
        setRequests((prev) => {
          const map = new Map<string, PrayerRequest>();
          [...db, ...prev].forEach((r) => map.set(r.id, r));
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      }
    });
  }, [currentTenant.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRequest.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const newRequest = await submitPrayerRequestToDb({
        tenant_id: currentTenant.id,
        name: formName.trim() || 'Anônimo',
        category: formCategory,
        request: formRequest.trim(),
        is_anonymous: formAnonymous || !formName.trim(),
      });

      setRequests((prev) => [newRequest, ...prev]);
      setFormRequest('');
      setFormName('');
      setFormAnonymous(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Erro ao enviar pedido de oração:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIntercede = (id: string) => {
    if (interceding[id]) return;
    setInterceding((prev) => ({ ...prev, [id]: true }));
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, prayer_count: r.prayer_count + 1 } : r))
    );
  };

  const totalPraying = requests.reduce((acc, r) => acc + r.prayer_count, 0);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] relative overflow-hidden flex flex-col selection:bg-[#DAA017]/30 selection:text-[#F8F5EC]">
      <AuroraBackdrop intensity="high" showGrid={true} />

      {/* Header */}
      <header className="relative z-10 border-b border-[#DAA017]/15 bg-[#16120D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="sm:hidden p-2 rounded-xl bg-[#221B13]/80 border border-[#DAA017]/20 text-[#F8F5EC] hover:text-[#DAA017] hover:border-[#DAA017]/40 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-3">
              <GoldLogo size="lg" showText={true} />
            </Link>
          </div>
          <Link to="/painel/dashboard">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              Console Interno
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DAA017]/10 border border-[#DAA017]/40 text-xs font-bold text-[#DAA017] uppercase tracking-widest mb-5">
            <Flame className="w-4 h-4 text-[#FFE898]" />
            Central de Intercessão
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8F5EC] leading-tight">
            Pedido de <span className="gold-gradient-text">Oração</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#F8F5EC]/60 max-w-xl mx-auto leading-relaxed">
            "Levai as cargas uns dos outros e cumprireis a lei de Cristo." — Gálatas 6:2
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 animate-fade-in-up stagger-1">
          <div className="card-gold-glass rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#F8F5EC]/50 font-bold">Pedidos</p>
            <p className="font-serif text-2xl font-bold text-[#DAA017]">{requests.length}</p>
          </div>
          <div className="card-gold-glass rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#F8F5EC]/50 font-bold">Intercedendo</p>
            <p className="font-serif text-2xl font-bold text-[#DAA017]">{totalPraying}</p>
          </div>
          <div className="card-gold-glass rounded-2xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#F8F5EC]/50 font-bold">Intercessores</p>
            <p className="font-serif text-2xl font-bold text-[#DAA017]">Neire & Danilo</p>
          </div>
        </div>

        {/* Form */}
        <div className="card-gold-glass rounded-3xl p-6 sm:p-8 mb-12 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DAA017] to-[#B8860B] flex items-center justify-center text-[#1A1A1A]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#F8F5EC]">Envie seu Pedido de Oração</h2>
              <p className="text-xs text-[#F8F5EC]/50">Nossa equipe de intercessão orará por você</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={formAnonymous ? 'Nome (opcional)' : 'Seu Nome'}
                placeholder={formAnonymous ? 'Ficará anônimo' : 'Como podemos te chamar?'}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={formAnonymous}
              />
              <div>
                <label className="block text-[11px] font-bold text-[#F8F5EC]/70 mb-1.5 uppercase tracking-widest">
                  Categoria do Pedido
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as PrayerRequest['category'])}
                  className="w-full bg-[#1A1A1A]/80 text-[#F8F5EC] rounded-xl px-4 py-3 text-sm border border-[#DAA017]/15 hover:border-[#DAA017]/35 focus:outline-none focus:ring-2 focus:ring-[#DAA017]/30 focus:border-[#DAA017]/60 transition-all duration-300"
                >
                  {PRAYER_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#1A1A1A]">
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#F8F5EC]/70 mb-1.5 uppercase tracking-widest">
                Seu Pedido *
              </label>
              <textarea
                value={formRequest}
                onChange={(e) => setFormRequest(e.target.value)}
                placeholder="Compartilhe conosco o que você gostaria que nossa equipe colocasse em oração..."
                rows={4}
                maxLength={500}
                required
                className="w-full bg-[#1A1A1A]/80 text-[#F8F5EC] placeholder-[#F8F5EC]/25 rounded-xl px-4 py-3 text-sm border border-[#DAA017]/15 hover:border-[#DAA017]/35 focus:outline-none focus:ring-2 focus:ring-[#DAA017]/30 focus:border-[#DAA017]/60 transition-all duration-300 resize-none"
              />
              <p className="text-[10px] text-[#F8F5EC]/40 mt-1 text-right">{formRequest.length}/500</p>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-[#F8F5EC]/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formAnonymous}
                onChange={(e) => setFormAnonymous(e.target.checked)}
                className="rounded border-[#DAA017] bg-[#120E0A] text-[#DAA017] focus:ring-0 w-4 h-4"
              />
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-[#DAA017]" /> Desejo permanecer anônimo
              </span>
            </label>

            {submitted && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-scale-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Pedido enviado! Nossa equipe de intercessão já está orando por você.
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Send}
              loading={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Pedido de Oração'}
            </Button>
          </form>
        </div>

        {/* Recent Requests */}
        <div className="animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#DAA017]/10 border border-[#DAA017]/30 flex items-center justify-center text-[#DAA017]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#F8F5EC]">Pedidos Recentes</h2>
              <p className="text-[11px] text-[#F8F5EC]/50">Interceda junto conosco por cada necessidade</p>
            </div>
          </div>

          <div className="space-y-3">
            {requests.map((req) => {
              const cat = PRAYER_CATEGORIES.find((c) => c.value === req.category);
              const timeAgo = new Date(req.created_at).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={req.id}
                  className="card-gold-glass rounded-2xl p-5 hover-lift"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{cat?.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#DAA017] truncate">
                          {req.name}
                          {req.is_anonymous && (
                            <span className="ml-2 text-[9px] uppercase tracking-wider text-[#F8F5EC]/40 font-semibold">
                              anônimo
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-[#F8F5EC]/40">{cat?.label} • {timeAgo}</p>
                      </div>
                    </div>
                    <Badge variant={req.status === 'answered' ? 'success' : 'gold'} size="sm">
                      {req.status === 'answered' ? 'Respondido' : req.status === 'in_intercession' ? 'Em oração' : 'Novo'}
                    </Badge>
                  </div>

                  <blockquote className="flex items-start gap-2 text-xs text-[#F8F5EC]/80 leading-relaxed my-2">
                    <Quote className="w-3.5 h-3.5 text-[#DAA017]/50 shrink-0 rotate-180" />
                    <span>"{req.request}"</span>
                  </blockquote>

                  <div className="pt-2 border-t border-[#DAA017]/15 flex items-center justify-between">
                    <button
                      onClick={() => handleIntercede(req.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/30 text-[11px] font-bold text-amber-200 transition-colors"
                    >
                      {interceding[req.id] ? '🙌' : '🙏'} Estou Orando
                    </button>
                    <span className="text-[11px] text-[#DAA017] font-bold">
                      {req.prayer_count} {req.prayer_count === 1 ? 'pessoa' : 'pessoas'} orando
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verse Footer */}
        <div className="mt-12 text-center">
          <div className="divider-gold mb-6" />
          <p className="font-serif text-sm sm:text-base text-[#DAA017] italic">
            "Buscar-me-eis e me achareis quando me buscardes de todo o vosso coração." — Jeremias 29:13
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#DAA017]/15 bg-[#14100C]/90 py-8 text-center text-xs text-[#F8F5EC]/50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} {currentTenant.name}. Uma Igreja, Uma Família, Uma Missão.
          </p>
        </div>
      </footer>
    </div>
  );
};