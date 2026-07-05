import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ScreenContainer } from '../components/ScreenContainer';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { colors, font, spacing, radius, shadow } from '../theme';
import { useI18n } from '../i18n';
import { useWallet } from '../context/WalletContext';
import { buildQrPayload } from '../lib/qr';

export function MyQRScreen() {
  const { t } = useI18n();
  const { profile } = useWallet();

  const payload = profile ? buildQrPayload(profile.id, profile.full_name || undefined) : '';

  return (
    <ScreenContainer style={styles.container}>
      <Header title={t.qr.myQrTitle} />
      <View style={styles.center}>
        <View style={[styles.qrCard, shadow.card]}>
          <View style={styles.userRow}>
            <Avatar name={profile?.full_name} uri={profile?.avatar_url} size={48} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={styles.name}>{profile?.full_name || 'Pengguna'}</Text>
              <Text style={styles.handle}>
                {profile?.username ? `@${profile.username}` : profile?.phone || ''}
              </Text>
            </View>
          </View>

          <View style={styles.qrWrap}>
            {payload ? (
              <QRCode value={payload} size={220} color={colors.primaryDeep} backgroundColor="#fff" />
            ) : (
              <Text style={styles.muted}>{t.common.loading}</Text>
            )}
          </View>

          <Text style={styles.brand}>💚 Dompet Gacor</Text>
        </View>
        <Text style={styles.hint}>{t.qr.myQrSubtitle}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  name: { fontWeight: font.weight.bold, color: colors.text, fontSize: font.size.lg },
  handle: { color: colors.textMuted, fontSize: font.size.sm },
  qrWrap: {
    marginVertical: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  brand: { color: colors.primaryDark, fontWeight: font.weight.bold },
  muted: { color: colors.textMuted, width: 220, height: 220, textAlign: 'center', textAlignVertical: 'center' },
  hint: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl, fontSize: font.size.sm },
});
