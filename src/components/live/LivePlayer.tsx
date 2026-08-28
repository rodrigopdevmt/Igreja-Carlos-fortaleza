import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Radio,
  Share2,
  Sparkles,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Users,
  Film,
  Wifi,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useChurch, Person } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LivePlayerProps {
  onOpenAuthModal?: () => void;
  onOpenPermissionsModal?: () => void;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({
  onOpenAuthModal,
  onOpenPermissionsModal,
}) => {
  const {
    liveStream,
    activeViewerMember,
    currentTenant,
    toggleMemberLiveAccess,
    hasRole,
  } = useChurch();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'4K' | '1080p' | '720p' | 'Áudio'>('4K');
  const [showSettings, setShowSettings] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const canManage = hasRole(['owner', 'pastor', 'media', 'manager']);
  const isAuthorized = Boolean(activeViewerMember && activeViewerMember.can_access_lives);

  const handleRequestAccess = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 4000);
  };

  const handleToggleFullscreen = () => {
    const playerEl = document.getElementById('live-video-stage-container');
    if (!playerEl) return;

    if (!document.fullscreenElement) {
      playerEl.requestFullscreen?.().catch((err) => console.log('Fullscreen error:', err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.log('Exit fullscreen error:', err));
      setIsFullscreen(false);
    }
  };

  return (
    <div id="live-player-component" className="space-y-4">
      {/* --------------------------------------------------------------------- */}
      {/* Container Principal do Player com Efeito Glass                        */}
      {/* --------------------------------------------------------------------- */}
      <div
        id="live-video-stage-container"
        className={`relative rounded-2xl overflow-hidden card-gold-glass border border-[#DAA017]/35 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          isTheaterMode ? 'ring-2 ring-[#DAA017]/40' : ''
        }`}
      >
        {isAuthorized ? (
          /* ================================================================= */
          /* 1. PLAYER DE TRANSMISSÃO AUTORIZADO (4K UHD)                       */
          /* ================================================================= */
          <div className="relative aspect-video w-full bg-black group overflow-hidden select-none">
            {/* Background Stream Image / Feed Simulation */}
            <img
              src="https://images.unsplash.com/photo-1510525004068-0dd80b2c8a0b?w=1600&auto=format&fit=crop&q=80"
              alt="Transmissão ao Vivo Igreja Boas Novas"
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isPlaying ? 'opacity-90 scale-100' : 'opacity-50 scale-102'
              }`}
            />

            {/* Top Bar Glass Overlay */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 sm:p-5 flex items-center justify-between z-20 backdrop-blur-[2px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.35)] backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  AO VIVO
                </span>

                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#16120D]/80 border border-[#DAA017]/30 text-[11px] font-mono text-[#DAA017] backdrop-blur-md">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>{selectedQuality} 60FPS • 18.5 Mbps</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Membro:</span>
                  <span className="font-bold text-white truncate max-w-[120px]">
                    {activeViewerMember?.full_name?.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Top Right Quick Actions */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-[#3A2E1F] text-[#F8F5EC] border border-[#DAA017]/30 backdrop-blur-md transition-all text-xs flex items-center gap-1"
                    title="Qualidade da Transmissão"
                  >
                    <Settings className="w-4 h-4 text-[#DAA017]" />
                    <span className="text-[11px] font-bold">{selectedQuality}</span>
                  </button>

                  {/* Quality Dropdown Menu */}
                  {showSettings && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#16120D]/95 border border-[#DAA017]/40 p-2 shadow-2xl backdrop-blur-xl z-50 text-xs space-y-1">
                      <div className="text-[10px] font-bold uppercase text-[#DAA017] px-2 py-1 border-b border-[#DAA017]/20">
                        Resolução de Vídeo
                      </div>
                      {(['4K', '1080p', '720p', 'Áudio'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setSelectedQuality(q);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                            selectedQuality === q
                              ? 'bg-[#DAA017] text-[#1A1A1A]'
                              : 'text-[#F8F5EC]/80 hover:bg-[#3A2E1F] hover:text-[#F8F5EC]'
                          }`}
                        >
                          <span>{q === 'Áudio' ? 'Apenas Áudio' : `${q} UHD HDR`}</span>
                          {selectedQuality === q && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Share2}
                  className="text-xs py-1 px-2.5 bg-black/60 border-[#DAA017]/30 hover:border-[#DAA017]"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: liveStream.title,
                        text: `Assista ao culto ao vivo da ${currentTenant.name}`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href);
                    }
                  }}
                >
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
              </div>
            </div>

            {/* Play/Pause Central Floating Indicator on Click */}
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            >
              {!isPlaying && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#16120D]/90 border-2 border-[#DAA017] text-[#DAA017] flex items-center justify-center shadow-[0_0_40px_rgba(218,160,23,0.5)] backdrop-blur-md animate-pulse">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                </div>
              )}
            </div>

            {/* Bottom Controls Glass Bar Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 sm:p-5 flex flex-col gap-3 z-20 backdrop-blur-[2px]">
              {/* Broadcast Title and Preacher */}
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="gold" size="sm">
                      Culto Oficial
                    </Badge>
                    <span className="text-xs text-[#DAA017] font-serif font-bold truncate">
                      {currentTenant.name}
                    </span>
                  </div>
                  <h2 className="font-serif text-base sm:text-2xl font-bold text-white drop-shadow-md truncate">
                    {liveStream.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#F8F5EC]/80 font-medium">
                    Ministração: <span className="text-[#DAA017] font-semibold">{liveStream.preacher}</span>
                  </p>
                </div>

                <div className="hidden lg:flex items-center gap-3 text-right shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-[#16120D]/80 border border-[#DAA017]/30 text-xs">
                    <span className="text-[10px] uppercase text-[#F8F5EC]/50 block">Espectadores</span>
                    <span className="font-serif font-bold text-white flex items-center gap-1 justify-end">
                      <Users className="w-3.5 h-3.5 text-[#DAA017]" />
                      {liveStream.viewers_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Media Action Buttons */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#DAA017]/20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-[#DAA017] hover:text-white transition-colors p-1"
                    title={isPlaying ? 'Pausar Transmissão' : 'Reproduzir'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-[#F8F5EC]/80 hover:text-[#DAA017] transition-colors p-1"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-16 sm:w-24 h-1.5 bg-[#3A2E1F] rounded-lg appearance-none cursor-pointer accent-[#DAA017]"
                    />
                  </div>

                  <span className="text-[11px] font-mono text-[#F8F5EC]/60 hidden sm:inline">
                    Ao Vivo • Tempo Real
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors hidden md:flex items-center gap-1 ${
                      isTheaterMode
                        ? 'bg-[#DAA017] text-black border-[#DAA017] font-bold'
                        : 'bg-black/60 text-[#F8F5EC]/80 border-[#DAA017]/25 hover:text-white'
                    }`}
                    title="Modo Teatro"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Teatro</span>
                  </button>

                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1.5 rounded-lg bg-black/60 text-[#F8F5EC]/80 hover:text-white border border-[#DAA017]/25 transition-colors"
                    title="Tela Cheia"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* 2. TELA DE BLOQUEIO DE ACESSO (GLASS EFFECT CARD)                  */
          /* ================================================================= */
          <div className="relative aspect-video w-full bg-gradient-to-b from-[#1C1610]/95 via-[#15110C]/98 to-[#0E0B08] p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Ambient Background Glow Effect */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#DAA017]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Lock Emblem in Glass Card */}
            <div className="relative mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#2A1F16]/90 border border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.3)] flex items-center justify-center backdrop-blur-md">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 border-2 border-black" />
              </span>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2.5 backdrop-blur-md">
              <ShieldAlert className="w-3.5 h-3.5" /> Acesso Restrito • Transmissão Fechada
            </div>

            {/* Headline */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F5EC] max-w-lg mb-2 leading-snug">
              Verificação de Membresia Obrigatória
            </h2>

            {/* Explanatory Text */}
            <p className="text-xs sm:text-sm text-[#F8F5EC]/70 max-w-lg mb-6 leading-relaxed">
              O membro <strong className="text-[#DAA017]">{activeViewerMember?.full_name || 'selecionado'}</strong>{' '}
              {activeViewerMember ? (
                <span>
                  está cadastrado como <span className="text-rose-400 font-semibold">Sem Permissão de Live</span> no rol eclesiástico desta congregação.
                </span>
              ) : (
                <span>não foi autenticado no sistema para visualizar o culto em tempo real.</span>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-md w-full">
              <Button
                variant="primary"
                size="sm"
                icon={KeyRound}
                onClick={handleRequestAccess}
                disabled={requestSent}
                className="shadow-lg"
              >
                {requestSent ? 'Solicitação Enviada à Secretaria!' : 'Solicitar Liberação Pastoral'}
              </Button>

              {onOpenAuthModal && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={QrCode}
                  onClick={onOpenAuthModal}
                  className="border-[#DAA017]/40 hover:border-[#DAA017] text-xs"
                >
                  Validar Credencial
                </Button>
              )}

              {/* Admin Instant Override Option */}
              {canManage && activeViewerMember && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => toggleMemberLiveAccess(activeViewerMember.id, true)}
                  className="text-xs"
                >
                  Liberar Acesso Agora (Admin)
                </Button>
              )}
            </div>

            {/* Feedback Message */}
            {requestSent && (
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Solicitação de acesso enviada para o painel de aprovação pastoral.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Texto Bíblico Base & Guia do Sermão (Card Glass)                      */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl card-gold-glass border border-[#DAA017]/25 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#DAA017] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Texto Base da Mensagem
          </div>
          <span className="text-[11px] text-[#F8F5EC]/50 font-mono">
            {currentTenant.city} • Culto Oficial
          </span>
        </div>
        <p className="font-serif text-sm sm:text-base text-[#F8F5EC] italic leading-relaxed">
          "E este evangelho do reino será pregado em todo o mundo, em testemunho a todas as gentes, e então virá o fim."
        </p>
        <div className="flex items-center justify-between text-xs pt-1">
          <p className="text-[#DAA017] font-semibold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Mateus 24:14 (ARC)
          </p>
          <span className="text-[#F8F5EC]/40 text-[11px]">
            Série: Fundamentos do Reino
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivePlayer;
