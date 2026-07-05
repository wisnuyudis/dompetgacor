import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { colors, font, spacing } from '../../theme';
import { useI18n } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError(t.common.error);
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // RootNavigator otomatis pindah ke Main saat session berubah
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t.auth.loginTitle}</Text>
          <Text style={styles.subtitle}>{t.auth.loginSubtitle}</Text>

          <View style={styles.form}>
            <TextField
              label={t.auth.email}
              leftIcon="✉️"
              placeholder="nama@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label={t.auth.password}
              leftIcon="🔒"
              placeholder="••••••••"
              secure
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t.auth.login} onPress={onSubmit} loading={loading} />
          </View>

          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            {t.auth.noAccount}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  title: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  subtitle: { fontSize: font.size.md, color: colors.textMuted, marginTop: spacing.xs },
  form: { marginTop: spacing.xxl },
  error: { color: colors.danger, marginBottom: spacing.md, fontSize: font.size.sm },
  link: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.primaryDark,
    fontWeight: font.weight.semibold,
  },
});
