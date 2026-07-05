import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAsUser } from './supabase';

export function ok(data: unknown, init?: number) {
  return NextResponse.json({ ok: true, data }, { status: init ?? 200 });
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

export type AuthedContext = {
  userId: string;
  token: string;
};

/** Ambil & verifikasi Bearer token. Mengembalikan userId + token. */
export async function requireAuth(req: NextRequest): Promise<AuthedContext> {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError('Missing bearer token', 401);

  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) throw new HttpError('Invalid or expired token', 401);
  return { userId: data.user.id, token };
}

export class HttpError extends Error {
  constructor(message: string, public status = 400, public code?: string) {
    super(message);
  }
}

/** Bungkus handler dengan error handling konsisten. */
export function handler(
  fn: (req: NextRequest, ctx: AuthedContext) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      const ctx = await requireAuth(req);
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return fail(e.message, e.status, e.code);
      const msg = e instanceof Error ? e.message : 'Internal error';
      // Map error RPC Postgres ke pesan ramah
      const known: Record<string, [string, number]> = {
        INSUFFICIENT_FUNDS: ['Saldo tidak cukup', 422],
        INVALID_AMOUNT: ['Nominal tidak valid', 422],
        SELF_TRANSFER: ['Tidak bisa transfer ke diri sendiri', 422],
        SELF_PAYMENT: ['Tidak bisa membayar ke diri sendiri', 422],
        RECIPIENT_NOT_FOUND: ['Penerima tidak ditemukan', 404],
        PAYEE_NOT_FOUND: ['Penerima tidak ditemukan', 404],
        WALLET_NOT_FOUND: ['Dompet tidak ditemukan', 404],
      };
      for (const key of Object.keys(known)) {
        if (msg.includes(key)) return fail(known[key][0], known[key][1], key);
      }
      return fail(msg, 500);
    }
  };
}

export { supabaseAdmin, supabaseAsUser };
