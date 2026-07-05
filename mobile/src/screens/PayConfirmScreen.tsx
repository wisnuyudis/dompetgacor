import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import { useWallet } from '../context/WalletContext';
import { formatIDR } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PayConfirm'>;

export function PayConfirmScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { wallet, payQr } = useWallet();
  const { payeeId, payeeName } = route.params;
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount.replace(/\D/g, '')) || 0;

  const onPay = async () => {
    setError(null);
    if (numericAmount <= 0) return;
    if (wallet && numericAmount > wallet.balance) {
      setError(t.transfer.insufficient);
      return;
    }
    setLoading(true);
    try {
      const tx = await payQr(payeeId, numericAmount, note || undefined);
      navigation.replace('Success', {
        transaction: tx,
        title: t.common.success,
        subtitle: `${t.qr.payTo} ${payeeName || ''}`,
        amount: numericAmount,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <Header title={t.qr.scanTitle} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={styles.payeeCard}>
          <Avatar name={payeeName} size={56} />
          <Text style={styles.payTo}>{t.qr.payTo}</Text>
          <Text style={styles.payeeName}>{payeeName || payeeId.slice(0, 8)}</Text>
        </View>

        <TextField
          label={t.transfer.amount}
          leftIcon="💵"
          placeholder="0"
          keyboardType="number-pad"
          value={amount ? formatIDR(numericAmount, false) : ''}
          onChangeText={setAmount}
        />
        <TextField
          label={t.common.note}
          leftIcon="📝"
          placeholder={t.common.optional}
          value={note}
          onChangeText={setNote}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ flex: 1 }} />
        <Button
          title={`${t.common.confirm} · ${formatIDR(numericAmount)}`}
          onPress={onPay}
          loading={loading}
          disabled={numericAmount <= 0}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  payeeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payTo: { color: colors.textMuted, marginTop: spacing.md, fontSize: font.size.sm },
  payeeName: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  error: { color: colors.danger, fontSize: font.size.sm },
});
