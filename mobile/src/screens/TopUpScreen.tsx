import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import { useWallet } from '../context/WalletContext';
import { formatIDR } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TopUp'>;
const PRESETS = [50000, 100000, 150000, 250000, 500000, 1000000];

export function TopUpScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { topup } = useWallet();
  const [amount, setAmount] = useState<number>(100000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (amount <= 0) return;
    setLoading(true);
    try {
      const tx = await topup(amount, t.topup.methodDemo);
      navigation.replace('Success', {
        transaction: tx,
        title: t.common.success,
        subtitle: `${t.home.topup} ${formatIDR(amount)}`,
        amount,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <Header title={t.topup.title} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={styles.amountDisplay}>{formatIDR(amount)}</Text>
        <Text style={styles.section}>{t.topup.chooseAmount}</Text>

        <View style={styles.grid}>
          {PRESETS.map(p => {
            const active = p === amount;
            return (
              <Pressable
                key={p}
                onPress={() => setAmount(p)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {formatIDR(p)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t.topup.method}</Text>
        <View style={styles.method}>
          <Text style={styles.methodIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodTitle}>{t.topup.methodDemo}</Text>
            <Text style={styles.methodSub}>Saldo langsung bertambah (demo)</Text>
          </View>
          <Text style={styles.check}>✅</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t.topup.topupNow} onPress={onSubmit} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  amountDisplay: {
    fontSize: font.size.display,
    fontWeight: font.weight.bold,
    color: colors.primaryDark,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  section: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chip: {
    width: '47%',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: '#EAFBEF' },
  chipText: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.text },
  chipTextActive: { color: colors.primaryDeep },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  methodIcon: { fontSize: 24 },
  methodTitle: { fontWeight: font.weight.semibold, color: colors.text, fontSize: font.size.md },
  methodSub: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  check: { fontSize: 18 },
  error: { color: colors.danger, marginTop: spacing.lg, fontSize: font.size.sm },
  footer: { paddingVertical: spacing.lg },
});
