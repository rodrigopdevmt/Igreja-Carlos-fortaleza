import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { GoldLogo } from '@/components/common/GoldLogo';
import { AuroraBackdrop } from '@/components/common/AuroraBackdrop';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const POSTGREST_URL = import.meta.env.VITE_API_URL || '/rest';

export const MemberLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanId = identifier.trim().toLowerCase();

      const res = await fetch(
        `${POSTGREST_URL}/people?or=(full_name.ilike.*${cleanId}*,email.ilike.*${cleanId}*,document.ilike.*${cleanId}*)&limit=1`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (res.ok) {
        const text = await res.text();
        const people = text ? JSON.parse(text) : [];

        if (people.length > 0) {
          const person = people[0];

          const credRes = await fetch(
            `${POSTGREST_URL}/credentials?person_id=eq.${person.id}&status=eq.active&limit=1`,
            { headers: { 'Accept': 'application/json' } }
          );

          let credential = null;
          if (credRes.ok) {
            const credText = await credRes.text();
            const creds = credText ? JSON.parse(credText) : [];
            credential = creds[0] || null;
          }

          const session = {
            personId: person.id,
            fullName: person.full_name,
            email: person.email,
            phone: person.phone,
            document: person.document,
            birthDate: person.birth_date,
            baptismDate: person.baptism_date,
            ministry: person.ministry,
            photoUrl: person.photo_url,
            credentialCode: credential?.code || null,
            credentialRole: credential?.person_role || null,
          };

          sessionStorage.setItem('iabn_member_session', JSON.stringify(session));
          navigate('/area-membro');
          return;
        }
      }

      setError('Membro não encontrado. Verifique seu nome, e-mail ou CPF.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#DAA017]/30 selection:text-[#F8F5EC]">
      <AuroraBackdrop intensity="medium" showGrid={true} />

      <header className="relative z-10 w-full border-b border-[#DAA017]/15 bg-[#16120D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#F8F5EC]/60 hover:text-[#DAA017] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium">Voltar ao Site</span>
          </Link>
          <GoldLogo size="sm" showText={true} />
        </div>
      </header>

      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DAA017]/10 border border-[#DAA017]/30 text-xs font-bold text-[#DAA017] uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE898]" />
            Área do Membro
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#F8F5EC]">
            Acessar Minha <span className="gold-gradient-text">Conta</span>
          </h1>
          <p className="text-sm text-[#F8F5EC]/50 mt-3">
            Entre com seu nome, e-mail ou CPF para acessar sua carteirinha digital e certificados.
          </p>
        </div>

        <div className="card-gold-glass rounded-2xl p-8 border border-[#DAA017]/20">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#DAA017] uppercase tracking-wider mb-2">
                Nome, E-mail ou CPF
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DAA017]/50" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Digite seu nome completo ou CPF"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#2A2218] border border-[#DAA017]/25 text-[#F8F5EC] placeholder:text-[#F8F5EC]/30 focus:outline-none focus:border-[#DAA017]/60 focus:ring-1 focus:ring-[#DAA017]/30 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#DAA017] uppercase tracking-wider mb-2">
                Senha (opcional)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DAA017]/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Para acesso futuro"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#2A2218] border border-[#DAA017]/25 text-[#F8F5EC] placeholder:text-[#F8F5EC]/30 focus:outline-none focus:border-[#DAA017]/60 focus:ring-1 focus:ring-[#DAA017]/30 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DAA017]/50 hover:text-[#DAA017] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ShieldCheck}
              className="w-full justify-center glow-gold-lg"
              disabled={loading || !identifier.trim()}
            >
              {loading ? 'Verificando...' : 'Entrar na Área do Membro'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#F8F5EC]/40">
            Problemas para acessar? Entre em contato com a secretaria da igreja.
          </p>
        </div>
      </main>
    </div>
  );
};
