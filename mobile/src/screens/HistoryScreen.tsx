import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { TransactionItem } from '../components/TransactionItem';
import { colors, font, spacing } from '../theme';
import { useI18n } from '../i18n';
import { useWallet } from '../context/WalletContext';
import { relativeDay } from '../lib/format';
import type { Transaction } from '../lib/api';

export function HistoryScreen() {
  const { t, lang } = useI18n();
  const { transactions, loading, refresh } = useWallet();

  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
      const key = relativeDay(tx.created_at, lang);
      (groups[key] ||= []).push(tx);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [transactions, lang]);

  return (
    <ScreenContainer edges={['top']} style={styles.container}>
      <Text style={styles.title}>{t.history.title}</Text>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem tx={item} />}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        onRefresh={refresh}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>{t.history.empty}</Text> : null
        }
        stickySectionHeadersEnabled={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  title: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginVertical: spacing.lg,
  },
  sectionHeader: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xxl },
});
