import { z } from 'zod';
import { handler, ok, HttpError, supabaseAsUser } from '@/lib/http';

const Body = z.object({
  amount: z.number().positive().max(100_000_000),
  note: z.string().max(140).optional(),
});

// POST /api/topup { amount, note? }
export const POST = handler(async (req, ctx) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError('Nominal tidak valid', 422, 'INVALID_AMOUNT');

  const sb = supabaseAsUser(ctx.token);
  const { data, error } = await sb.rpc('topup_wallet', {
    p_user_id: ctx.userId,
    p_amount: parsed.data.amount,
    p_note: parsed.data.note ?? 'Top-up',
  });
  if (error) throw new Error(error.message);
  return ok({ transaction: data });
});
