import { z } from 'zod';
import { handler, ok, HttpError, supabaseAsUser } from '@/lib/http';

const Body = z.object({
  recipient: z.string().min(1), // user_id, username, atau phone
  amount: z.number().positive().max(100_000_000),
  note: z.string().max(140).optional(),
});

async function resolveRecipient(sb: ReturnType<typeof supabaseAsUser>, ref: string) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuid.test(ref)) return ref;
  const { data } = await sb
    .from('profiles')
    .select('id')
    .or(`username.eq.${ref},phone.eq.${ref}`)
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

// POST /api/transfer { recipient, amount, note? }
export const POST = handler(async (req, ctx) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError('Data transfer tidak valid', 422);

  const sb = supabaseAsUser(ctx.token);
  const recipientId = await resolveRecipient(sb, parsed.data.recipient);
  if (!recipientId) throw new HttpError('Penerima tidak ditemukan', 404, 'RECIPIENT_NOT_FOUND');

  const { data, error } = await sb.rpc('transfer_funds', {
    p_sender: ctx.userId,
    p_recipient: recipientId,
    p_amount: parsed.data.amount,
    p_note: parsed.data.note ?? null,
  });
  if (error) throw new Error(error.message);
  return ok({ transaction: data });
});
