import React, { useState, useEffect } from 'react';
import {
  Cctv,
  Video,
  Eye,
  AlertTriangle,
  Radio,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  Disc,
  Compass,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useChurch, Camera } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const CamerasPage: React.FC = () => {
  const { cameras, toggleCameraRecording, triggerCameraAlert, currentTenant } = useChurch();

  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [timecode, setTimecode] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimecode(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePan = (dx: number, dy: number) => {
    setPanOffset((prev) => ({
      x: Math.max(-50, Math.min(50, prev.x + dx)),
      y: Math.max(-50, Math.min(50, prev.y + dy)),
    }));
  };

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.max(1, Math.min(3, +(prev + factor).toFixed(1))));
  };

  const handleResetPTZ = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Monitoramento CFTV & Segurança
            </h1>
            <Badge variant="gold" size="sm">
              6 Câmeras 4K
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#F8F5EC]/60 mt-1">
            Vigilância inteligente do templo, altar, portaria, berçário e estacionamento com IA de detecção
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            <ShieldCheck className="w-4 h-4 mr-1" /> Sistema Operacional 24/7
          </Badge>
        </div>
      </div>

      {/* Main Single Camera Focus Mode or 6-Grid Mode */}
      {selectedCamera ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setSelectedCamera(null);
                handleResetPTZ();
              }}
            >
              Voltar ao Mosaico de Câmeras
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={selectedCamera.status === 'recording' ? 'danger' : 'outline'}
                size="sm"
                icon={Disc}
                onClick={() => toggleCameraRecording(selectedCamera.id)}
              >
                {selectedCamera.status === 'recording' ? 'Gravando 4K' : 'Iniciar Gravação'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={AlertTriangle}
                onClick={() => triggerCameraAlert(selectedCamera.id)}
                className="text-amber-400 border-amber-500/40"
              >
                Disparar Alerta IA
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Camera Viewport Canvas */}
            <div className="lg:col-span-9 relative rounded-2xl overflow-hidden bg-black border-2 border-[#DAA017]/50 shadow-[0_0_40px_rgba(218,160,23,0.3)] aspect-video">
              {/* Image stream */}
              <div className="w-full h-full overflow-hidden relative">
                <img
                  src={selectedCamera.snapshot_url}
                  alt={selectedCamera.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  }}
                />

                {/* Grid Overlay / Reticle */}
                <div className="absolute inset-0 border border-[#DAA017]/30 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-[#DAA017]/40 rounded-full pointer-events-none flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#DAA017] rounded-full" />
                </div>
              </div>

              {/* Top Camera Status Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-none">
                <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-lg border border-[#DAA017]/30 backdrop-blur-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">{selectedCamera.name}</span>
                  <span className="text-[#DAA017]">[{selectedCamera.resolution}]</span>
                </div>
                <div className="flex items-center gap-3 bg-black/70 px-3 py-1.5 rounded-lg border border-[#DAA017]/30 backdrop-blur-sm font-mono">
                  <span>{timecode}</span>
                  <span className="text-emerald-400 font-bold">{selectedCamera.fps} FPS</span>
                </div>
              </div>

              {/* Bottom Motion Detection Badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-lg border border-[#DAA017]/30 text-xs backdrop-blur-sm pointer-events-none">
                <Sparkles className="w-3.5 h-3.5 text-[#DAA017]" />
                <span className="text-[#F8F5EC]/90">
                  Localização: {selectedCamera.location}
                </span>
              </div>
            </div>

            {/* PTZ Joystick & Lens Controls */}
            <div className="lg:col-span-3 rounded-2xl bg-[#221B13]/95 border border-[#DAA017]/30 p-5 shadow-xl space-y-5">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#F8F5EC] uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#DAA017]" /> Controle PTZ / Domo
                </h3>
                <p className="text-[11px] text-[#F8F5EC]/60 mt-0.5">
                  Pan, Tilt e Zoom digital motorizado
                </p>
              </div>

              {/* Directional Pad */}
              <div className="flex flex-col items-center gap-1.5 py-2">
                <button
                  onClick={() => handlePan(0, 15)}
                  className="p-2.5 rounded-xl bg-[#3A2E1F] hover:bg-[#DAA017] text-[#F8F5EC] hover:text-[#1A1A1A] transition-all"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePan(15, 0)}
                    className="p-2.5 rounded-xl bg-[#3A2E1F] hover:bg-[#DAA017] text-[#F8F5EC] hover:text-[#1A1A1A] transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleResetPTZ}
                    className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#DAA017]/40 text-[#DAA017] text-xs font-bold"
                  >
                    CENTRO
                  </button>
                  <button
                    onClick={() => handlePan(-15, 0)}
                    className="p-2.5 rounded-xl bg-[#3A2E1F] hover:bg-[#DAA017] text-[#F8F5EC] hover:text-[#1A1A1A] transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => handlePan(0, -15)}
                  className="p-2.5 rounded-xl bg-[#3A2E1F] hover:bg-[#DAA017] text-[#F8F5EC] hover:text-[#1A1A1A] transition-all"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="pt-3 border-t border-[#DAA017]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F8F5EC]/70">Zoom Digital:</span>
                  <span className="font-mono text-[#DAA017] font-bold">{zoomLevel}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ZoomOut}
                    onClick={() => handleZoom(-0.2)}
                    className="flex-1"
                  >
                    -
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ZoomIn}
                    onClick={() => handleZoom(0.2)}
                    className="flex-1"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 6 Camera Mosaic Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cameras.map((cam) => {
            const isRecording = cam.status === 'recording';
            const isAlert = cam.status === 'alert';

            return (
              <div
                key={cam.id}
                className="group relative rounded-2xl overflow-hidden bg-[#221B13] border border-[#DAA017]/25 hover:border-[#DAA017]/60 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Snapshot stream frame */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={cam.snapshot_url}
                    alt={cam.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />

                  {/* Status Banner in camera frame */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] pointer-events-none">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-md ${
                        isAlert
                          ? 'bg-rose-900/90 text-rose-200 border border-rose-500 animate-pulse'
                          : isRecording
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : 'bg-black/70 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAlert ? 'bg-rose-400' : isRecording ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                      />
                      {isAlert ? 'ALERTA IA' : isRecording ? 'REC 4K' : 'AO VIVO'}
                    </span>
                    <span className="bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white/80">
                      {cam.resolution.split(' ')[0]}
                    </span>
                  </div>

                  {/* Quick Expand Button */}
                  <button
                    onClick={() => setSelectedCamera(cam)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#F8F5EC]"
                  >
                    <div className="p-3 rounded-full bg-[#DAA017] text-[#1A1A1A] shadow-lg flex items-center gap-2 text-xs font-bold">
                      <Maximize2 className="w-4 h-4" /> Expandir Câmera
                    </div>
                  </button>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-[#1A1A1A]/90 border-t border-[#DAA017]/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#F8F5EC] truncate">
                      {cam.name}
                    </h4>
                    <p className="text-[11px] text-[#DAA017] mt-0.5 truncate">
                      {cam.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCameraRecording(cam.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isRecording
                          ? 'text-rose-400 bg-rose-950/50'
                          : 'text-[#F8F5EC]/60 hover:text-[#DAA017]'
                      }`}
                      title="Gravar Feed"
                    >
                      <Disc className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedCamera(cam)}
                      className="p-1.5 rounded-lg text-[#F8F5EC]/60 hover:text-[#DAA017] transition-colors"
                      title="Controles PTZ"
                    >
                      <Compass className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
