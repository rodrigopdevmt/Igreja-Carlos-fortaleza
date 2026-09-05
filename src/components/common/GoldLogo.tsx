import React from 'react';

interface GoldLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const GoldLogo: React.FC<GoldLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-base' },
    '2xl': { icon: 'w-28 h-28', text: 'text-4xl', sub: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.icon} shrink-0`}>
        {/* Subtle glow behind logo */}
        <div className={`absolute inset-0 rounded-full bg-[#DAA017]/25 blur-md ${animate ? 'animate-pulse' : ''}`} />
        
        {/* Metallic Gold Icon - Globe + Fish (Ichthys) + Apostolic Ray Crown */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_2px_10px_rgba(218,160,23,0.5)]"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" />
              <stop offset="35%" stopColor="#DAA017" />
              <stop offset="70%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#7A5805" />
            </linearGradient>
            <linearGradient id="innerGlobeGradient" x1="20%" y1="20%" x2="80%" y2="80%">
              <stop offset="0%" stopColor="#3A2E1F" />
              <stop offset="100%" stopColor="#1A1A1A" />
            </linearGradient>
            <radialGradient id="goldShine" cx="30%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#DAA017" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Apostolic Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
            strokeDasharray="2 1"
            className="opacity-90"
          />

          {/* Solid Base Ring with Dark Core */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="url(#innerGlobeGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
          />

          {/* Subtle Globe Meridians / Latitudes */}
          <ellipse
            cx="50"
            cy="50"
            rx="38"
            ry="18"
            stroke="url(#goldGradient)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-40"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="18"
            ry="38"
            stroke="url(#goldGradient)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            className="opacity-40"
          />
          <line
            x1="12"
            y1="50"
            x2="88"
            y2="50"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            className="opacity-30"
          />

          {/* Central Stylized Ichthys (Christian Fish Symbol) overlapping with Apostolic Cross */}
          <path
            d="M 24 50 C 35 28, 68 28, 82 58 L 88 52 M 82 58 L 86 66"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 24 50 C 35 72, 68 72, 82 42 L 88 48 M 82 42 L 86 34"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Apostolic Cross in Center of Fish */}
          <path
            d="M 50 32 L 50 68"
            stroke="url(#goldGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 40 44 L 60 44"
            stroke="url(#goldGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Fish Eye / Holy Spirit Star */}
          <circle cx="34" cy="50" r="2.8" fill="url(#goldGradient)" />
          <path
            d="M 34 44 L 34 56 M 28 50 L 40 50"
            stroke="#FFF4D0"
            strokeWidth="0.8"
            className="opacity-80"
          />

          {/* Light Shine Highlight */}
          <circle cx="30" cy="30" r="25" fill="url(#goldShine)" pointerEvents="none" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-serif font-bold tracking-wider text-[#F8F5EC] ${currentSize.text}`}>
              BOAS NOVAS
            </span>
          </div>
          <span className={`font-sans tracking-widest uppercase font-semibold text-[#DAA017] ${currentSize.sub}`}>
            Igreja Apostolica
          </span>
        </div>
      )}
    </div>
  );
};