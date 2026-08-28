import React from 'react';

interface AuroraBackdropProps {
  intensity?: 'low' | 'medium' | 'high';
  showGrid?: boolean;
}

export const AuroraBackdrop: React.FC<AuroraBackdropProps> = ({
  intensity = 'medium',
  showGrid = true,
}) => {
  const opacityMap = {
    low: { primary: 'opacity-15', secondary: 'opacity-10' },
    medium: { primary: 'opacity-25', secondary: 'opacity-20' },
    high: { primary: 'opacity-40', secondary: 'opacity-30' },
  };

  const currentOpacity = opacityMap[intensity];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#1A1A1A]">
      {/* Top Gold Radial Glow */}
      <div 
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-b from-[#DAA017]/30 via-[#B8860B]/15 to-transparent blur-[120px] ${currentOpacity.primary} animate-gold-pulse`} 
      />

      {/* Warm Brown / Amber Ambient Side Orbs */}
      <div 
        className={`absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-[#3A2E1F]/50 blur-[130px] ${currentOpacity.secondary}`} 
      />
      <div 
        className={`absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-[#DAA017]/15 blur-[140px] ${currentOpacity.secondary}`} 
      />
      
      {/* Bottom Subtle Ambient Glow */}
      <div 
        className="absolute -bottom-40 left-1/3 w-[700px] h-[400px] rounded-full bg-[#B8860B]/10 blur-[150px] opacity-20" 
      />

      {/* Subtle Architectural Grid Pattern */}
      {showGrid && (
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#3A2E1F12_1px,transparent_1px),linear-gradient(to_bottom,#3A2E1F12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" 
        />
      )}
    </div>
  );
};
