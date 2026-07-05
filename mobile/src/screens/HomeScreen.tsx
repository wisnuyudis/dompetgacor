import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { BalanceCard } from '../components/BalanceCard';
import { QuickAction } from '../components/QuickAction';
import { TransactionItem } from '../components/TransactionItem';
import { Avatar } from '../components/Avatar';
import { colors, font, spacing } from '../theme';
import { useI18n } from '../i18n';
import { useWallet } from '../context/WalletContext';
import type { RootStackParamList } from '../navigation/types';

export function HomeScreen() {
  const { t } = useI18n();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { wallet, profile, transactions, loading, refresh } = useWallet();

  const firstName = (profile?.full_name || 'Pengguna').split(' ')[0];

  return (
    <ScreenContainer edges={['top']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }>
        {/* Greeting */}
        <View style={styles.greetRow}>
          <View style={styles.greetLeft}>
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={styles.greetHi}>{t.home.greeting},</Text>
              <Text style={styles.greetName}>{firstName} 👋</Text>
            </View>
          </View>
          <Text style={styles.bell}>🔔</Text>
        </View>

        {/* Balance card */}
        <BalanceCard balance={wallet?.balance ?? 0} name={profile?.full_name} />

        {/* Quick actions */}
        <View style={styles.actions}>
          <QuickAction icon="➕" label={t.home.topup} onPress={() => nav.navigate('TopUp')} />
          <QuickAction icon="💸" label={t.home.transfer} onPress={() => nav.navigate('Transfer')} />
          <QuickAction icon="⛶" label={t.home.scan} onPress={() => nav.navigate('Scan')} />
          <QuickAction icon="🔳" label={t.home.qr} onPress={() => nav.navigate('MyQR')} />
        </View>

        {/* Promo */}
        <View style={styles.promo}>
          <Text style={styles.promoTitle}>🎉 {t.home.promos}</Text>
          <Text style={styles.promoBody}>Cashback 20% top-up pertama kamu!</Text>
        </View>

        {/* Recent transactions */}
        <View style={styles.txHeader}>
          <Text style={styles.sectionTitle}>{t.home.recentTransactions}</Text>
          <Text style={styles.seeAll} onPress={() => nav.navigate('Main', { screen: 'History' } as any)}>
            {t.common.seeAll}
          </Text>
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.empty}>{t.home.noTransactions}</Text>
        ) : (
          transactions.slice(0, 6).map(tx => <TransactionItem key={tx.id} tx={tx} />)
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  greetLeft: { flexDirection: 'row', alignItems: 'center' },
  greetHi: { color: colors.textMuted, fontSize: font.size.sm },
  greetName: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.bold },
  bell: { fontSize: 22 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  promo: {
    backgroundColor: '#E9FBEE',
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  promoTitle: { fontWeight: font.weight.bold, color: colors.primaryDeep, fontSize: font.size.md },
  promoBody: { color: colors.textMuted, marginTop: 4, fontSize: font.size.sm },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  seeAll: { color: colors.primaryDark, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
