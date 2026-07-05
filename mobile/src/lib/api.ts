import { config } from '../config';
import { supabase } from './supabase';

export type Wallet = { id: string; balance: number; currency: string };
export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
};
export type Transaction = {
  id: string;
  type: 'topup' | 'transfer_in' | 'transfer_out' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  note: string | null;
  reference: string;
  counterparty: string | null;
  created_at: string;
};

class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

async function authToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError('Sesi berakhir, silakan masuk lagi', 401);
  return token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await authToken();
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    throw new ApiError(json?.error || 'Permintaan gagal', res.status, json?.code);
  }
  return json.data as T;
}

export const api = {
  getWallet: () => request<{ wallet: Wallet; profile: Profile }>('/api/wallet'),

  getTransactions: (limit = 20, before?: string) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (before) q.set('before', before);
    return request<{ transactions: Transaction[] }>(`/api/transactions?${q.toString()}`);
  },

  topup: (amount: number, note?: string) =>
    request<{ transaction: Transaction }>('/api/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, note }),
    }),

  transfer: (recipient: string, amount: number, note?: string) =>
    request<{ transaction: Transaction }>('/api/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipient, amount, note }),
    }),

  payQr: (payee: string, amount: number, note?: string) =>
    request<{ transaction: Transaction }>('/api/qr/pay', {
      method: 'POST',
      body: JSON.stringify({ payee, amount, note }),
    }),

  searchUsers: (q: string) =>
    request<{ users: Profile[] }>(`/api/users/search?q=${encodeURIComponent(q)}`),
};

export { ApiError };
