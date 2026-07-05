import { z } from 'zod';
import { handler, ok, HttpError, supabaseAsUser } from '@/lib/http';

const Body = z.object({
  payee: z.string().uuid(),         // user_id tujuan dari payload QR
  amount: z.number().positive().max(100_000_000),
  note: z.string().max(140).optional(),
});

// POST /api/qr/pay { payee, amount, note? }
export const POST = handler(async (req, ctx) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError('Data pembayaran tidak valid', 422);

  const sb = supabaseAsUser(ctx.token);
  const { data, error } = await sb.rpc('pay_qr', {
    p_payer: ctx.userId,
    p_payee: parsed.data.payee,
    p_amount: parsed.data.amount,
    p_note: parsed.data.note ?? 'QR Payment',
  });
  if (error) throw new Error(error.message);
  return ok({ transaction: data });
});
