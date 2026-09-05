import type { Database } from '@/integrations/supabase/types';

export type LiveChatMessage = Database['public']['Tables']['live_chat_messages']['Row'];
export type InsertLiveChatMessage = Database['public']['Tables']['live_chat_messages']['Insert'];

const POSTGREST_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3100';

const CHAT_BROADCAST_CHANNEL_NAME = 'boas_novas_live_chat_channel';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHAT_BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel não disponível:', e);
}

export async function fetchLiveChatMessagesFromDb(
  liveId: string,
  tenantId: string
): Promise<{ messages: LiveChatMessage[]; source: 'postgrest' | 'local' }> {
  try {
    const res = await fetch(
      `${POSTGREST_URL}/live_chat_messages?live_id=eq.${liveId}&tenant_id=eq.${tenantId}&order=sent_at.asc`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      if (data.length > 0) {
        return { messages: data as LiveChatMessage[], source: 'postgrest' };
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar live_chat_messages:', err);
  }
  return { messages: [], source: 'local' };
}

export async function insertLiveChatMessageToDb(
  payload: Omit<LiveChatMessage, 'id' | 'sent_at'> & { sent_at?: string }
): Promise<LiveChatMessage> {
  const timestamp = payload.sent_at || new Date().toISOString();

  try {
    const res = await fetch(`${POSTGREST_URL}/live_chat_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        tenant_id: payload.tenant_id,
        live_id: payload.live_id,
        sender_name: payload.sender_name,
        message: payload.message,
        sent_at: timestamp,
        is_pinned: payload.is_pinned || false,
        is_prayer_request: payload.is_prayer_request || false,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      broadcastChannel?.postMessage({ type: 'INSERT', message: data });
      return data as LiveChatMessage;
    }
  } catch (err) {
    console.warn('Falha na inserção live_chat_messages:', err);
  }

  const fallback: LiveChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tenant_id: payload.tenant_id,
    live_id: payload.live_id,
    sender_name: payload.sender_name,
    message: payload.message,
    sent_at: timestamp,
    is_pinned: Boolean(payload.is_pinned),
    is_prayer_request: Boolean(payload.is_prayer_request),
  };
  broadcastChannel?.postMessage({ type: 'INSERT', message: fallback });
  return fallback;
}

export async function togglePinLiveChatMessageInDb(
  messageId: string,
  isPinned: boolean
): Promise<void> {
  try {
    const params = new URLSearchParams({ id: `eq.${messageId}` });
    await fetch(`${POSTGREST_URL}/live_chat_messages?${params.toString()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: isPinned }),
    });
  } catch (err) {
    console.warn('Erro ao atualizar pin:', err);
  }
  broadcastChannel?.postMessage({ type: 'UPDATE_PIN', messageId, isPinned });
}

export async function deleteLiveChatMessageInDb(messageId: string): Promise<void> {
  try {
    const params = new URLSearchParams({ id: `eq.${messageId}` });
    await fetch(`${POSTGREST_URL}/live_chat_messages?${params.toString()}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Erro ao excluir mensagem:', err);
  }
  broadcastChannel?.postMessage({ type: 'DELETE', messageId });
}

export function subscribeToLiveChatMessages(
  liveId: string,
  callbacks: {
    onInsert: (message: LiveChatMessage) => void;
    onUpdatePin?: (messageId: string, isPinned: boolean) => void;
    onDelete?: (messageId: string) => void;
  }
): () => void {
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

  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
  };
}
