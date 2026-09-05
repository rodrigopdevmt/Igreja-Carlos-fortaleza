export interface PrayerRequest {
  id: string;
  tenant_id: string;
  name: string;
  category: 'saude' | 'familia' | 'financeiro' | 'salvacao' | 'ministerio' | 'outro';
  request: string;
  is_anonymous: boolean;
  status: 'pending' | 'in_intercession' | 'answered';
  prayer_count: number;
  created_at: string;
}

export const PRAYER_CATEGORIES: { value: PrayerRequest['category']; label: string; icon: string }[] = [
  { value: 'saude', label: 'Saúde & Cura', icon: '💚' },
  { value: 'familia', label: 'Família & Relacionamentos', icon: '🏠' },
  { value: 'financeiro', label: 'Providência Financeira', icon: '💰' },
  { value: 'salvacao', label: 'Salvação de Vidas', icon: '🕊️' },
  { value: 'ministerio', label: 'Ministério & Igreja', icon: '⛪' },
  { value: 'outro', label: 'Outros Pedidos', icon: '🙏' },
];

const POSTGREST_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3100';

export async function submitPrayerRequestToDb(payload: {
  tenant_id: string;
  name: string;
  category: PrayerRequest['category'];
  request: string;
  is_anonymous: boolean;
}): Promise<PrayerRequest> {
  const timestamp = new Date().toISOString();
  const body = {
    tenant_id: payload.tenant_id,
    name: payload.is_anonymous ? 'Anônimo' : payload.name,
    category: payload.category,
    request: payload.request,
    is_anonymous: payload.is_anonymous,
    status: 'pending' as const,
    prayer_count: 0,
  };

  try {
    const res = await fetch(`${POSTGREST_URL}/prayer_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Falha ao inserir pedido de oração:', err);
  }

  return {
    id: `prayer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...body,
    created_at: timestamp,
  };
}

export async function fetchPrayerRequestsFromDb(
  tenantId: string
): Promise<PrayerRequest[]> {
  try {
    const res = await fetch(
      `${POSTGREST_URL}/prayer_requests?tenant_id=eq.${tenantId}&order=created_at.desc&limit=100`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    }
  } catch (err) {
    console.warn('Erro ao consultar prayer_requests:', err);
  }
  return [];
}
