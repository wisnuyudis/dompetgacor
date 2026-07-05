import { handler, ok, supabaseAsUser } from '@/lib/http';

// GET /api/users/search?q=budi -> cari penerima by username/phone/nama
export const GET = handler(async (req, ctx) => {
  const sb = supabaseAsUser(ctx.token);
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  if (q.length < 3) return ok({ users: [] });

  const { data, error } = await sb
    .from('profiles')
    .select('id, full_name, username, phone, avatar_url')
    .or(`username.ilike.%${q}%,phone.ilike.%${q}%,full_name.ilike.%${q}%`)
    .neq('id', ctx.userId)
    .limit(10);

  if (error) throw new Error(error.message);
  return ok({ users: data ?? [] });
});
