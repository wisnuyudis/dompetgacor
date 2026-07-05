import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, font, spacing, shadow } from '../theme';
import { formatIDR } from '../lib/format';

type Props = {
  balance: number;
  name?: string | null;
  cardNumber?: string;
};

export function BalanceCard({ balance, name, cardNumber = '•••• •••• •••• 8392' }: Props) {
  const [hidden, setHidden] = useState(false);

  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, shadow.card]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>Dompet Gacor</Text>
          <Text style={styles.holder}>{name || 'Pengguna'}</Text>
        </View>
        <View style={styles.chip} />
      </View>

      <Text style={styles.balanceLabel}>Saldo</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balance}>
          {hidden ? 'Rp • • • • • •' : formatIDR(balance)}
        </Text>
        <Pressable onPress={() => setHidden(h => !h)} hitSlop={10}>
          <Text style={styles.eye}>{hidden ? '👁️' : '🙈'}</Text>
        </Pressable>
      </View>

      <Text style={styles.cardNumber}>{cardNumber}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.primaryDeep, fontWeight: font.weight.bold, fontSize: font.size.md },
  holder: { color: 'rgba(14,59,30,0.7)', fontSize: font.size.sm, marginTop: 2 },
  chip: {
    width: 42,
    height: 32,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  balanceLabel: { color: 'rgba(14,59,30,0.7)', fontSize: font.size.sm, marginTop: spacing.lg },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  balance: { color: colors.primaryDeep, fontSize: font.size.xxl, fontWeight: font.weight.bold },
  eye: { fontSize: 18 },
  cardNumber: {
    color: colors.primaryDeep,
    letterSpacing: 2,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    marginTop: spacing.sm,
  },
});
