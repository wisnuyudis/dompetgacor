import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { colors, font, spacing } from '../../theme';
import { useI18n } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!fullName || !email || password.length < 6) {
      setError('Lengkapi data & kata sandi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      const { needsVerification } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      if (needsVerification) {
        Alert.alert(t.common.success, t.auth.checkEmail, [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
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
          <Text style={styles.title}>{t.auth.registerTitle}</Text>
          <Text style={styles.subtitle}>{t.auth.registerSubtitle}</Text>

          <View style={styles.form}>
            <TextField
              label={t.auth.fullName}
              leftIcon="👤"
              placeholder="Budi Santoso"
              value={fullName}
              onChangeText={setFullName}
            />
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
              label={t.auth.phone}
              leftIcon="📱"
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextField
              label={t.auth.password}
              leftIcon="🔒"
              placeholder="Min. 6 karakter"
              secure
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={t.auth.register} onPress={onSubmit} loading={loading} />
          </View>

          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            {t.auth.hasAccount}
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
  form: { marginTop: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md, fontSize: font.size.sm },
  link: {
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    color: colors.primaryDark,
    fontWeight: font.weight.semibold,
  },
});
