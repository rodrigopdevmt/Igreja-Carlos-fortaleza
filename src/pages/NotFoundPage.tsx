import React from 'react';
import { Link } from 'react-router-dom';
import { GoldLogo } from '@/components/common/GoldLogo';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8F5EC] flex flex-col items-center justify-center p-6 text-center">
      <GoldLogo size="xl" className="mb-6" />
      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gold-gradient mb-2">
        404 - Página Não Encontrada
      </h1>
      <p className="text-sm text-[#F8F5EC]/70 max-w-md mb-8">
        A página solicitada não existe ou você não possui autorização no sistema da Igreja Apostólica Boas Novas.
      </p>

      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="secondary" size="md" icon={Home}>
            Página Inicial
          </Button>
        </Link>
        <Link to="/demo/dashboard">
          <Button variant="primary" size="md" icon={ArrowLeft}>
            Ir para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
