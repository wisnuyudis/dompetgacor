import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Header } from '../components/Header';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import { useWallet } from '../context/WalletContext';
import { api, type Profile } from '../lib/api';
import { formatIDR } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Transfer'>;

export function TransferScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { wallet, transfer } = useWallet();
  const [recipient, setRecipient] = useState<Profile | null>(route.params?.recipient ?? null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipient || query.trim().length < 3) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await api.searchUsers(query.trim());
        setResults(users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query, recipient]);

  const numericAmount = Number(amount.replace(/\D/g, '')) || 0;
  const canSubmit = recipient && numericAmount > 0;

  const onSubmit = async () => {
    setError(null);
    if (!recipient) return;
    if (numericAmount <= 0) return;
    if (wallet && numericAmount > wallet.balance) {
      setError(t.transfer.insufficient);
      return;
    }
    setLoading(true);
    try {
      const tx = await transfer(recipient.id, numericAmount, note || undefined);
      navigation.replace('Success', {
        transaction: tx,
        title: t.common.success,
        subtitle: `${t.transfer.sendTo} ${recipient.full_name || recipient.username}`,
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
      <Header title={t.transfer.title} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.balanceHint}>
            {t.home.balance}: {formatIDR(wallet?.balance ?? 0)}
          </Text>

          {/* Recipient */}
          {recipient ? (
            <View style={styles.recipientCard}>
              <Avatar name={recipient.full_name} uri={recipient.avatar_url} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.recipientName}>{recipient.full_name || recipient.username}</Text>
                <Text style={styles.recipientSub}>
                  {recipient.username ? `@${recipient.username}` : recipient.phone}
                </Text>
              </View>
              <Text style={styles.change} onPress={() => setRecipient(null)}>
                {t.common.cancel}
              </Text>
            </View>
          ) : (
            <>
              <TextField
                label={t.transfer.recipient}
                leftIcon="🔍"
                placeholder={t.transfer.recipientHint}
                autoCapitalize="none"
                value={query}
                onChangeText={setQuery}
              />
              {searching ? <ActivityIndicator color={colors.primary} /> : null}
              {results.map(u => (
                <Pressable key={u.id} style={styles.resultRow} onPress={() => { setRecipient(u); setQuery(''); }}>
                  <Avatar name={u.full_name} uri={u.avatar_url} size={40} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.recipientName}>{u.full_name || u.username}</Text>
                    <Text style={styles.recipientSub}>
                      {u.username ? `@${u.username}` : u.phone}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}

          {/* Amount */}
          {recipient ? (
            <View style={{ marginTop: spacing.lg }}>
              <TextField
                label={t.transfer.amount}
                leftIcon="💵"
                placeholder="0"
                keyboardType="number-pad"
                value={amount ? formatIDR(numericAmount, false) : ''}
                onChangeText={v => setAmount(v)}
              />
              <TextField
                label={t.common.note}
                leftIcon="📝"
                placeholder={t.common.optional}
                value={note}
                onChangeText={setNote}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {recipient ? (
        <View style={styles.footer}>
          <Button
            title={t.transfer.sendNow}
            onPress={onSubmit}
            loading={loading}
            disabled={!canSubmit}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  balanceHint: { color: colors.textMuted, marginBottom: spacing.lg, fontSize: font.size.sm },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipientName: { fontWeight: font.weight.semibold, color: colors.text, fontSize: font.size.md },
  recipientSub: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  change: { color: colors.danger, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  error: { color: colors.danger, fontSize: font.size.sm, marginTop: spacing.sm },
  footer: { paddingVertical: spacing.lg },
});
