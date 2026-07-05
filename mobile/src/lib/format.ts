import type { Lang } from '../i18n';

/** Format angka ke Rupiah, mis. 15000 -> "Rp15.000" */
export function formatIDR(value: number, withSymbol = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
  return withSymbol ? `Rp${formatted}` : formatted;
}

/** Untuk tanda +/- di list transaksi */
export function signedAmount(type: string, amount: number): string {
  const incoming = type === 'topup' || type === 'transfer_in' || type === 'refund';
  return `${incoming ? '+' : '-'}${formatIDR(amount)}`;
}

export function isIncoming(type: string): boolean {
  return type === 'topup' || type === 'transfer_in' || type === 'refund';
}

export function formatDate(iso: string, lang: Lang = 'id'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function relativeDay(iso: string, lang: Lang = 'id'): string {
  const d = new Date(iso);
  const today = new Date();
  const isSameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isSameDay) return lang === 'id' ? 'Hari ini' : 'Today';
  return formatDate(iso, lang);
}
