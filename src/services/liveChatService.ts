import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type LiveChatMessage = Database['public']['Tables']['live_chat_messages']['Row'];
export type InsertLiveChatMessage = Database['public']['Tables']['live_chat_messages']['Insert'];

// BroadcastChannel para sincronização instantânea em tempo real entre abas e instâncias locais
const CHAT_BROADCAST_CHANNEL_NAME = 'boas_novas_live_chat_channel';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHAT_BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel não disponível neste ambiente:', e);
}

/**
 * Busca o histórico de mensagens do chat da tabela `live_chat_messages`
 */
export async function fetchLiveChatMessagesFromDb(
  liveId: string,
  tenantId: string
): Promise<{ messages: LiveChatMessage[]; source: 'supabase' | 'local' }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('live_id', liveId)
        .order('sent_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return { messages: data as LiveChatMessage[], source: 'supabase' };
      }
    } catch (err) {
      console.warn('Erro ao consultar tabela live_chat_messages no Supabase, usando estado local:', err);
    }
  }

  return { messages: [], source: 'local' };
}

/**
 * Publica uma nova mensagem no chat na tabela `live_chat_messages` e transmite em tempo real
 */
export async function insertLiveChatMessageToDb(
  payload: Omit<LiveChatMessage, 'id' | 'sent_at'> & { sent_at?: string }
): Promise<LiveChatMessage> {
  const generatedId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = payload.sent_at || new Date().toISOString();

  const newMessage: LiveChatMessage = {
    id: generatedId,
    tenant_id: payload.tenant_id,
    live_id: payload.live_id,
    sender_name: payload.sender_name,
    message: payload.message,
    sent_at: timestamp,
    is_pinned: Boolean(payload.is_pinned),
    is_prayer_request: Boolean(payload.is_prayer_request),
  };

  // 1. Tenta gravar no Supabase se configurado
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('live_chat_messages') as any)
        .insert([
          {
            tenant_id: newMessage.tenant_id,
            live_id: newMessage.live_id,
            sender_name: newMessage.sender_name,
            message: newMessage.message,
            sent_at: newMessage.sent_at,
            is_pinned: newMessage.is_pinned,
            is_prayer_request: newMessage.is_prayer_request,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // Envia pelo BroadcastChannel para replicação entre abas
        broadcastChannel?.postMessage({ type: 'INSERT', message: data });
        return data as LiveChatMessage;
      }
    } catch (err) {
      console.warn('Falha na inserção no Supabase live_chat_messages:', err);
    }
  }

  // 2. Broadcast local para outras abas
  broadcastChannel?.postMessage({ type: 'INSERT', message: newMessage });
  return newMessage;
}

/**
 * Alterna a fixação de uma mensagem no chat
 */
export async function togglePinLiveChatMessageInDb(
  messageId: string,
  isPinned: boolean
): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await (supabase.from('live_chat_messages') as any)
        .update({ is_pinned: isPinned })
        .eq('id', messageId);
    } catch (err) {
      console.warn('Erro ao atualizar pin no Supabase:', err);
    }
  }

  broadcastChannel?.postMessage({
    type: 'UPDATE_PIN',
    messageId,
    isPinned,
  });
}

/**
 * Exclui uma mensagem de moderação do chat
 */
export async function deleteLiveChatMessageInDb(messageId: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await (supabase.from('live_chat_messages') as any)
        .delete()
        .eq('id', messageId);
    } catch (err) {
      console.warn('Erro ao excluir no Supabase:', err);
    }
  }

  broadcastChannel?.postMessage({
    type: 'DELETE',
    messageId,
  });
}

/**
 * Inscreve no canal em tempo real para receber novas mensagens de `live_chat_messages`
 */
export function subscribeToLiveChatMessages(
  liveId: string,
  callbacks: {
    onInsert: (message: LiveChatMessage) => void;
    onUpdatePin?: (messageId: string, isPinned: boolean) => void;
    onDelete?: (messageId: string) => void;
  }
): () => void {
  // 1. Supabase Realtime Channel
  let supabaseChannel: ReturnType<typeof supabase.channel> | null = null;

  if (isSupabaseConfigured) {
    try {
      supabaseChannel = supabase
        .channel(`live_chat_channel_${liveId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_chat_messages',
            filter: `live_id=eq.${liveId}`,
          },
          (payload) => {
            if (payload.new) {
              callbacks.onInsert(payload.new as LiveChatMessage);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'live_chat_messages',
            filter: `live_id=eq.${liveId}`,
          },
          (payload) => {
            if (payload.new) {
              const updated = payload.new as LiveChatMessage;
              callbacks.onUpdatePin?.(updated.id, updated.is_pinned);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'live_chat_messages',
            filter: `live_id=eq.${liveId}`,
          },
          (payload) => {
            if (payload.old && payload.old.id) {
              callbacks.onDelete?.(payload.old.id);
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Falha ao iniciar canal Supabase Realtime:', e);
    }
  }

  // 2. BroadcastChannel para sincronização instantânea em tempo real entre abas
  const handleBroadcastMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data) return;

    if (data.type === 'INSERT' && data.message) {
      callbacks.onInsert(data.message);
    } else if (data.type === 'UPDATE_PIN' && data.messageId) {
      callbacks.onUpdatePin?.(data.messageId, data.isPinned);
    } else if (data.type === 'DELETE' && data.messageId) {
      callbacks.onDelete?.(data.messageId);
    }
  };

  broadcastChannel?.addEventListener('message', handleBroadcastMessage);

  // Retorna função de desinscrição / limpeza
  return () => {
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
    broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
  };
}
