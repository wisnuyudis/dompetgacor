import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { signedAmount, isIncoming, formatTime } from '../lib/format';
import type { Transaction } from '../lib/api';
import { useI18n } from '../i18n';

const ICONS: Record<string, string> = {
  topup: '⬇️',
  transfer_in: '📥',
  transfer_out: '📤',
  payment: '🛒',
  refund: '↩️',
};

export function TransactionItem({ tx }: { tx: Transaction }) {
  const { t } = useI18n();
  const incoming = isIncoming(tx.type);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{ICONS[tx.type] ?? '💳'}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title}>{t.txType[tx.type] ?? tx.type}</Text>
        <Text style={styles.sub}>
          {tx.note || tx.reference} · {formatTime(tx.created_at)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: incoming ? colors.success : colors.text }]}>
        {signedAmount(tx.type, tx.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  middle: { flex: 1, marginLeft: spacing.md },
  title: { fontSize: font.size.md, color: colors.text, fontWeight: font.weight.semibold },
  sub: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: font.size.md, fontWeight: font.weight.bold },
});
