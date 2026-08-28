import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Pin,
  Heart,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Search,
  Filter,
  Trash2,
  Download,
  Volume2,
  VolumeX,
  Flame,
  HelpCircle,
  Clock,
  UserCheck,
  RefreshCw,
  QrCode,
  ChevronDown,
  CheckCircle2,
  Radio,
  Share2,
} from 'lucide-react';
import { useChurch, Person } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  LiveChatMessage,
  fetchLiveChatMessagesFromDb,
  subscribeToLiveChatMessages,
} from '@/services/liveChatService';
import { formatDate } from '@/lib/utils';

interface LiveChatProps {
  onOpenAuthModal?: () => void;
  className?: string;
  maxHeight?: string;
}

const QUICK_REACTIONS = [
  { label: '🙏 Amém!', text: 'Amém! Glória a Deus! 🙏' },
  { label: '🔥 Glória a Deus!', text: 'Glória a Deus nas alturas! 🔥' },
  { label: '❤️ Aleluia!', text: 'Aleluia! Louvado seja o Senhor! ❤️' },
  { label: '🕊️ Paz do Senhor', text: 'A Paz do Senhor a todos os irmãos! 🕊️' },
  { label: '📖 Santo é o Senhor', text: 'Santo, Santo é o Senhor dos Exércitos! 📖' },
];

export const LiveChat: React.FC<LiveChatProps> = ({
  onOpenAuthModal,
  className = '',
  maxHeight = 'h-[620px]',
}) => {
  const {
    liveStream,
    liveChatMessages,
    sendLiveChatMessage,
    togglePinMessage,
    deleteLiveChatMessage,
    activeViewerMember,
    currentTenant,
    hasRole,
  } = useChurch();

  const [messages, setMessages] = useState<LiveChatMessage[]>(liveChatMessages);
  const [inputText, setInputText] = useState('');
  const [isPrayerRequest, setIsPrayerRequest] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'prayer' | 'pinned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [prayerSupports, setPrayerSupports] = useState<Record<string, number>>({
    'msg-2': 18,
    'msg-4': 12,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const canModerate = hasRole(['owner', 'pastor', 'media', 'manager']);
  const isViewerAuthorized = Boolean(
    activeViewerMember && activeViewerMember.can_access_lives
  );

  // Sincroniza estado inicial com o context
  useEffect(() => {
    setMessages(liveChatMessages);
  }, [liveChatMessages]);

  // Consulta inicial e inscrição em tempo real na tabela `live_chat_messages`
  useEffect(() => {
    let isMounted = true;

    async function loadDbMessages() {
      try {
        const { messages: dbMessages } = await fetchLiveChatMessagesFromDb(
          liveStream.id,
          currentTenant.id
        );
        if (isMounted && dbMessages.length > 0) {
          setMessages((prev) => {
            const map = new Map<string, LiveChatMessage>();
            prev.forEach((m) => map.set(m.id, m));
            dbMessages.forEach((m) => map.set(m.id, m));
            return Array.from(map.values()).sort(
              (a, b) =>
                new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
            );
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar mensagens do banco:', err);
      }
    }

    loadDbMessages();

    // Inscreve no Supabase Realtime & BroadcastChannel
    const unsubscribe = subscribeToLiveChatMessages(liveStream.id, {
      onInsert: (newMsg) => {
        if (!isMounted) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Som de notificação se ativado
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        // Incrementa contador se não estiver no fundo
        if (!isAtBottom) {
          setUnreadCount((c) => c + 1);
        }
      },
      onUpdatePin: (messageId, isPinned) => {
        if (!isMounted) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned } : m))
        );
      },
      onDelete: (messageId) => {
        if (!isMounted) return;
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [liveStream.id, currentTenant.id, soundEnabled, isAtBottom]);

  // Auto-scroll para a última mensagem
  const scrollToBottom = (smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setUnreadCount(0);
      setIsAtBottom(true);
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadCount(0);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !isViewerAuthorized || isSubmitting) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSubmitting(true);

    try {
      await sendLiveChatMessage(
        textToSend,
        isPrayerRequest,
        activeViewerMember?.full_name
      );
      setIsPrayerRequest(false);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error('Erro ao enviar mensagem no live_chat_messages:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReaction = async (reactionText: string) => {
    if (!isViewerAuthorized) return;
    try {
      await sendLiveChatMessage(
        reactionText,
        false,
        activeViewerMember?.full_name
      );
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error('Erro ao enviar reação:', err);
    }
  };

  const handleIntercessorySupport = (msgId: string) => {
    setPrayerSupports((prev) => ({
      ...prev,
      [msgId]: (prev[msgId] || 0) + 1,
    }));
  };

  const handleExportChat = () => {
    const lines = [
      `=== TRANSCRIÇÃO DO CHAT AO VIVO - ${currentTenant.name.toUpperCase()} ===`,
      `Evento: ${liveStream.title}`,
      `Data/Hora: ${new Date().toLocaleString('pt-BR')}`,
      `Total de Mensagens: ${messages.length}`,
      `========================================================================\n`,
    ];

    messages.forEach((m) => {
      const time = new Date(m.sent_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const tag = m.is_prayer_request ? ' [PEDIDO DE ORAÇÃO]' : '';
      const pin = m.is_pinned ? ' [FIXADO]' : '';
      lines.push(`[${time}] ${m.sender_name}${tag}${pin}: ${m.message}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chat_Live_${liveStream.id}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtragem de Mensagens
  const filteredMessages = messages.filter((m) => {
    if (chatFilter === 'prayer' && !m.is_prayer_request) return false;
    if (chatFilter === 'pinned' && !m.is_pinned) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.sender_name.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pinnedMessage = messages.find((m) => m.is_pinned);
  const prayerRequestsCount = messages.filter((m) => m.is_prayer_request).length;

  return (
    <div
      id="live-chat-component"
      className={`rounded-2xl bg-[#221B13]/95 border border-[#DAA017]/30 shadow-2xl flex flex-col relative overflow-hidden backdrop-blur-md ${maxHeight} ${className}`}
    >
      {/* --------------------------------------------------------------------- */}
      {/* 1. Header do Chat com Indicador de Conexão Realtime                  */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-3.5 border-b border-[#DAA017]/20 bg-[#1A140E] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3A2E1F] border border-[#DAA017]/40 flex items-center justify-center text-[#DAA017] shadow-inner">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-1.5">
                Chat da Transmissão
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-[10px] text-[#F8F5EC]/55 font-mono">
                live_chat_messages • {messages.length} mensagens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showSearch
                  ? 'bg-[#DAA017] text-[#1A1A1A]'
                  : 'text-[#F8F5EC]/60 hover:text-[#DAA017] hover:bg-[#3A2E1F]'
              }`}
              title="Buscar Mensagens"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                soundEnabled
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-[#F8F5EC]/40 hover:text-[#F8F5EC]/70'
              }`}
              title={soundEnabled ? 'Silenciar avisos sonoros' : 'Ativar aviso sonoro'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleExportChat}
              className="p-1.5 rounded-lg text-xs text-[#F8F5EC]/60 hover:text-[#DAA017] hover:bg-[#3A2E1F] transition-colors"
              title="Baixar histórico do chat (TXT)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Campo de Busca Rápida (Expansível) */}
        {showSearch && (
          <div className="relative animate-fadeIn">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome ou palavra..."
              className="w-full bg-[#120E0A] text-[#F8F5EC] placeholder-[#F8F5EC]/40 text-xs rounded-lg px-2.5 py-1.5 pl-7 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
            />
            <Search className="w-3 h-3 text-[#DAA017] absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-[10px] text-[#F8F5EC]/60 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Abas de Filtro do Chat */}
        <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold bg-[#120E0A] p-1 rounded-xl border border-[#DAA017]/15">
          <button
            onClick={() => setChatFilter('all')}
            className={`py-1 rounded-lg transition-all text-center ${
              chatFilter === 'all'
                ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-sm'
                : 'text-[#F8F5EC]/70 hover:text-white'
            }`}
          >
            Todas ({messages.length})
          </button>
          <button
            onClick={() => setChatFilter('prayer')}
            className={`py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
              chatFilter === 'prayer'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-[#F8F5EC]/70 hover:text-amber-300'
            }`}
          >
            <span>Oração</span>
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-950/80 text-amber-200 border border-amber-500/30">
              {prayerRequestsCount}
            </span>
          </button>
          <button
            onClick={() => setChatFilter('pinned')}
            className={`py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
              chatFilter === 'pinned'
                ? 'bg-[#DAA017] text-[#1A1A1A] font-bold shadow-sm'
                : 'text-[#F8F5EC]/70 hover:text-[#DAA017]'
            }`}
          >
            <Pin className="w-2.5 h-2.5" />
            <span>Fixadas</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Banner de Mensagem Fixada no Topo                                  */}
      {/* --------------------------------------------------------------------- */}
      {pinnedMessage && chatFilter !== 'pinned' && (
        <div className="bg-gradient-to-r from-[#3A2E1F] via-[#2A2015] to-[#3A2E1F] border-b border-[#DAA017]/40 px-3.5 py-2 flex items-start justify-between gap-2 text-xs shrink-0 shadow-md">
          <div className="flex items-start gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-[#DAA017] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#DAA017] text-[11px] truncate">
                  {pinnedMessage.sender_name}
                </span>
                <span className="text-[9px] text-[#F8F5EC]/50 font-mono">
                  {formatDate(pinnedMessage.sent_at)}
                </span>
              </div>
              <p className="text-[#F8F5EC] text-xs font-medium truncate">
                {pinnedMessage.message}
              </p>
            </div>
          </div>
          {canModerate && (
            <button
              onClick={() => togglePinMessage(pinnedMessage.id)}
              className="text-[#DAA017]/70 hover:text-[#DAA017] text-[10px] underline shrink-0"
              title="Desafixar mensagem"
            >
              Desafixar
            </button>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. Feed de Mensagens com Scroll                                       */}
      {/* --------------------------------------------------------------------- */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3.5 space-y-2.5 divide-y divide-transparent text-xs"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#F8F5EC]/40 space-y-2">
            <MessageSquare className="w-8 h-8 text-[#DAA017]/40 stroke-[1.5]" />
            <p className="text-xs font-medium text-[#F8F5EC]/70">
              Nenhuma mensagem encontrada neste filtro.
            </p>
            <p className="text-[10px] text-[#F8F5EC]/40">
              Seja o primeiro a enviar uma saudação ou pedido de oração!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isPrayer = msg.is_prayer_request;
            const isPinned = msg.is_pinned;
            const isPastorOrLeader =
              msg.sender_name.toLowerCase().includes('apóstolo') ||
              msg.sender_name.toLowerCase().includes('pastor') ||
              msg.sender_name.toLowerCase().includes('bispo') ||
              msg.sender_name.toLowerCase().includes('secretaria');

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl transition-all border group relative ${
                  isPinned
                    ? 'bg-[#DAA017]/15 border-[#DAA017] shadow-[0_0_15px_rgba(218,160,23,0.15)]'
                    : isPrayer
                    ? 'bg-gradient-to-r from-amber-950/40 to-[#221B13] border-amber-500/40 shadow-sm'
                    : 'bg-[#18130E]/80 border-[#DAA017]/15 hover:border-[#DAA017]/30'
                }`}
              >
                {/* Linha de Identificação do Remetente */}
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Avatar Initials Badge */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        isPastorOrLeader
                          ? 'bg-[#DAA017] text-black font-extrabold'
                          : isPrayer
                          ? 'bg-amber-600 text-white'
                          : 'bg-[#3A2E1F] text-[#DAA017]'
                      }`}
                    >
                      {msg.sender_name.charAt(0).toUpperCase()}
                    </div>

                    <span
                      className={`font-bold truncate text-[11px] ${
                        isPastorOrLeader
                          ? 'text-[#DAA017]'
                          : 'text-[#F8F5EC] hover:text-[#DAA017]'
                      }`}
                    >
                      {msg.sender_name}
                    </span>

                    {isPastorOrLeader && (
                      <span className="text-[8.5px] px-1 py-0.2 rounded bg-[#DAA017]/20 text-[#DAA017] border border-[#DAA017]/40 uppercase font-bold shrink-0">
                        Ministério
                      </span>
                    )}

                    {isPrayer && (
                      <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 uppercase font-bold shrink-0 flex items-center gap-0.5 border border-amber-500/40">
                        🙏 Pedido de Oração
                      </span>
                    )}
                  </div>

                  {/* Ações de Moderação & Timestamp */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-[#F8F5EC]/40 font-mono">
                      {new Date(msg.sent_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {canModerate && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#120E0A] px-1 py-0.5 rounded border border-[#DAA017]/20">
                        <button
                          onClick={() => togglePinMessage(msg.id)}
                          className={`p-0.5 rounded hover:bg-[#3A2E1F] transition-colors ${
                            msg.is_pinned ? 'text-[#DAA017]' : 'text-[#F8F5EC]/40'
                          }`}
                          title={msg.is_pinned ? 'Desafixar' : 'Fixar no Topo'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteLiveChatMessage(msg.id)}
                          className="p-0.5 rounded hover:bg-rose-950 text-[#F8F5EC]/40 hover:text-rose-400 transition-colors"
                          title="Excluir Mensagem"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conteúdo da Mensagem */}
                <p className="text-[#F8F5EC]/95 leading-relaxed break-words text-xs pl-6">
                  {msg.message}
                </p>

                {/* Interação de Apoio à Oração */}
                {isPrayer && (
                  <div className="mt-2 pl-6 flex items-center justify-between gap-2 pt-1.5 border-t border-amber-500/20">
                    <button
                      onClick={() => handleIntercessorySupport(msg.id)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-[10px] font-semibold text-amber-200 transition-colors"
                    >
                      <span>🙏 Estou Orando</span>
                      <span className="font-bold text-white bg-amber-800/80 px-1 rounded-full">
                        {prayerSupports[msg.id] || 1}
                      </span>
                    </button>

                    <span className="text-[9.5px] text-amber-400/70 italic">
                      Intercessores Boas Novas
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Botão Flutuante de Scroll para o Fim quando houver novas mensagens */}
      {unreadCount > 0 && !isAtBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#DAA017] text-[#1A1A1A] font-bold text-xs shadow-xl flex items-center gap-1.5 animate-bounce z-10 border border-black/20"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>{unreadCount} nova(s) mensagem(ns)</span>
        </button>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. Barra de Reações Rápidas e Améns                                   */}
      {/* --------------------------------------------------------------------- */}
      {isViewerAuthorized && (
        <div className="px-3 py-1.5 bg-[#17120D] border-t border-[#DAA017]/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] text-[#DAA017] font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Amém:
          </span>
          {QUICK_REACTIONS.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickReaction(r.text)}
              className="px-2 py-1 rounded-lg bg-[#221B13] hover:bg-[#3A2E1F] border border-[#DAA017]/25 text-[10.5px] text-[#F8F5EC] hover:text-[#DAA017] shrink-0 font-medium transition-all"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 5. Composer de Envio ou Mensagem de Bloqueio                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-3 border-t border-[#DAA017]/20 bg-[#1A140E] shrink-0">
        {isViewerAuthorized ? (
          <form onSubmit={handleSendMessage} className="space-y-2">
            {/* Status do Membro Remetente */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[#DAA017] truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
                <span className="font-semibold truncate">
                  Enviando como: {activeViewerMember?.full_name}
                </span>
                <span className="text-[9px] text-[#F8F5EC]/40">
                  ({activeViewerMember?.ministry || 'Membro'})
                </span>
              </div>
              <span className="text-[10px] text-[#F8F5EC]/40 font-mono shrink-0">
                {inputText.length}/300
              </span>
            </div>

            {/* Input + Botão Enviar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                maxLength={300}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escreva sua mensagem ou pedido de oração..."
                disabled={isSubmitting}
                className="flex-1 bg-[#120E0A] text-[#F8F5EC] placeholder-[#F8F5EC]/30 rounded-xl px-3 py-2 text-xs border border-[#DAA017]/30 focus:ring-1 focus:ring-[#DAA017] focus:outline-none disabled:opacity-50"
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                disabled={!inputText.trim() || isSubmitting}
                className="px-3.5 py-2 text-xs shadow-md shrink-0"
              >
                {isSubmitting ? '...' : 'Enviar'}
              </Button>
            </div>

            {/* Checkbox de Pedido de Oração */}
            <label className="flex items-center gap-2 text-[11px] text-amber-300/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPrayerRequest}
                onChange={(e) => setIsPrayerRequest(e.target.checked)}
                className="rounded border-[#DAA017] bg-[#120E0A] text-[#DAA017] focus:ring-0 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1 font-medium">
                🙏 Marcar como Pedido de Intercessão Pastoral
              </span>
            </label>
          </form>
        ) : (
          /* Estado Bloqueado para Visitantes / Não Autenticados */
          <div className="p-3 rounded-xl bg-[#140E0A] border border-rose-500/30 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Chat Restrito a Membros Autenticados</span>
            </div>
            <p className="text-[11px] text-[#F8F5EC]/60 max-w-xs mx-auto">
              Para interagir no culto ao vivo e enviar pedidos de oração, valide sua Credencial Digital de Membro.
            </p>
            {onOpenAuthModal && (
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                onClick={onOpenAuthModal}
                className="w-full text-xs py-1.5"
              >
                Validar Minha Credencial Digital
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;
