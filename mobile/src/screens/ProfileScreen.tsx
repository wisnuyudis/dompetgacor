import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Avatar } from '../components/Avatar';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

function Row({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function ProfileScreen() {
  const { t, lang, setLang } = useI18n();
  const { signOut } = useAuth();
  const { profile } = useWallet();

  const confirmLogout = () => {
    Alert.alert(t.profile.logout, t.profile.logoutConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.profile.logout, style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const toggleLang = () => setLang(lang === 'id' ? 'en' : 'id');

  return (
    <ScreenContainer edges={['top']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={styles.title}>{t.profile.title}</Text>

        <View style={styles.card}>
          <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={64} />
          <Text style={styles.name}>{profile?.full_name || 'Pengguna'}</Text>
          <Text style={styles.sub}>
            {profile?.username ? `@${profile.username} · ` : ''}{profile?.phone || ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Row icon="✏️" label={t.profile.editProfile} />
          <Row icon="🌐" label={t.profile.language} value={lang === 'id' ? 'Indonesia' : 'English'} onPress={toggleLang} />
          <Row icon="🔐" label={t.profile.security} />
          <Row icon="❓" label={t.profile.help} />
          <Row icon="ℹ️" label={t.profile.about} value="v1.0.0" />
        </View>

        <Pressable style={styles.logout} onPress={confirmLogout}>
          <Text style={styles.logoutText}>🚪 {t.profile.logout}</Text>
        </Pressable>
      </ScrollView>
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
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text, marginTop: spacing.md },
  sub: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  section: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: { fontSize: 20, width: 30 },
  rowLabel: { flex: 1, fontSize: font.size.md, color: colors.text, fontWeight: font.weight.medium },
  rowValue: { color: colors.textMuted, fontSize: font.size.sm, marginRight: spacing.sm },
  chevron: { fontSize: 22, color: colors.textMuted },
  logout: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#FEECEC',
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: font.weight.bold, fontSize: font.size.md },
});
