import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import { formatIDR } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export function SuccessScreen({ navigation, route }: Props) {
  const { t } = useI18n();
  const { title, subtitle, amount, transaction } = route.params;

  return (
    <ScreenContainer style={styles.container} background={colors.surface}>
      <View style={styles.body}>
        <LinearGradient
          colors={[colors.gradientFrom, colors.gradientTo]}
          style={styles.badge}>
          <Text style={styles.check}>✓</Text>
        </LinearGradient>

        <Text style={styles.title}>{title || t.common.success}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {typeof amount === 'number' ? (
          <Text style={styles.amount}>{formatIDR(amount)}</Text>
        ) : null}

        {transaction ? (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Referensi</Text>
            <Text style={styles.detailValue}>{transaction.reference}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          title="Selesai"
          onPress={() => navigation.navigate('Main')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 56, color: colors.primaryDeep, fontWeight: '700' },
  title: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginTop: spacing.xl,
  },
  subtitle: { fontSize: font.size.md, color: colors.textMuted, marginTop: spacing.xs },
  amount: {
    fontSize: font.size.display,
    fontWeight: font.weight.bold,
    color: colors.primaryDark,
    marginTop: spacing.lg,
  },
  detail: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  detailLabel: { color: colors.textMuted, fontSize: font.size.sm },
  detailValue: { color: colors.text, fontWeight: font.weight.semibold, fontSize: font.size.sm },
  footer: { paddingVertical: spacing.xl },
});
