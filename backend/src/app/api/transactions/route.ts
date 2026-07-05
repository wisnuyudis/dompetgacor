import { handler, ok, supabaseAsUser } from '@/lib/http';

// GET /api/transactions?limit=20&before=ISO
export const GET = handler(async (req, ctx) => {
  const sb = supabaseAsUser(ctx.token);
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
  const before = url.searchParams.get('before');

  let query = sb
    .from('transactions')
    .select('id, type, amount, status, note, reference, counterparty, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ok({ transactions: data ?? [] });
});
