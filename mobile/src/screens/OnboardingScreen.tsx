import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { t, lang, toggle } = useI18n();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.langRow}>
        <Text style={styles.lang} onPress={toggle}>
          {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
        </Text>
      </View>

      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.gradientFrom, colors.gradientTo]}
          style={styles.logo}>
          <Text style={styles.logoText}>💚</Text>
        </LinearGradient>
        <Text style={styles.brand}>Dompet Gacor</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{t.onboarding.title}</Text>
        <Text style={styles.subtitle}>{t.onboarding.subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <Button title={t.onboarding.getStarted} onPress={() => navigation.navigate('Register')} />
        <Text style={styles.signin} onPress={() => navigation.navigate('Login')}>
          {t.onboarding.haveAccount}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  langRow: { alignItems: 'flex-end', paddingTop: spacing.sm },
  lang: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 48 },
  brand: {
    marginTop: spacing.lg,
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  body: { paddingBottom: spacing.xxl },
  title: {
    fontSize: font.size.display,
    fontWeight: font.weight.bold,
    color: colors.text,
    lineHeight: 42,
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: font.size.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
  footer: { paddingBottom: spacing.xl, gap: spacing.lg },
  signin: {
    textAlign: 'center',
    color: colors.primaryDark,
    fontWeight: font.weight.semibold,
    fontSize: font.size.sm,
  },
});
