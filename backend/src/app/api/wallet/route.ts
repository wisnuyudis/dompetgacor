import { handler, ok, supabaseAsUser } from '@/lib/http';

// GET /api/wallet -> saldo + profil user
export const GET = handler(async (_req, ctx) => {
  const sb = supabaseAsUser(ctx.token);

  const [{ data: wallet }, { data: profile }] = await Promise.all([
    sb.from('wallets').select('id, balance, currency').eq('user_id', ctx.userId).single(),
    sb.from('profiles').select('id, full_name, username, phone, avatar_url').eq('id', ctx.userId).single(),
  ]);

  return ok({ wallet, profile });
});
