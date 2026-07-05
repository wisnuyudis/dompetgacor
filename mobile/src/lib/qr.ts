// Format payload QR Dompet Gacor:
//   dompetgacor://pay?to=<userId>&name=<displayName>
const SCHEME = 'dompetgacor://pay';

export function buildQrPayload(userId: string, displayName?: string): string {
  const q = new URLSearchParams({ to: userId });
  if (displayName) q.set('name', displayName);
  return `${SCHEME}?${q.toString()}`;
}

export type ParsedQr = { to: string; name?: string };

export function parseQrPayload(raw: string): ParsedQr | null {
  try {
    if (!raw.startsWith('dompetgacor://pay')) return null;
    const query = raw.split('?')[1] ?? '';
    const params = new URLSearchParams(query);
    const to = params.get('to');
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!to || !uuid.test(to)) return null;
    return { to, name: params.get('name') || undefined };
  } catch {
    return null;
  }
}
