import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors, font, spacing, radius } from '../theme';
import { useI18n } from '../i18n';
import { parseQrPayload } from '../lib/qr';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export function ScanScreen({ navigation }: Props) {
  const { t } = useI18n();
  const device = useCameraDevice('back');
  const [permission, setPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const locked = useRef(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.getCameraPermissionStatus();
      if (status === 'granted') return setPermission('granted');
      const req = await Camera.requestCameraPermission();
      setPermission(req === 'granted' ? 'granted' : 'denied');
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (locked.current) return;
      const raw = codes[0]?.value;
      if (!raw) return;
      const parsed = parseQrPayload(raw);
      if (!parsed) {
        Alert.alert(t.common.error, t.qr.invalidQr);
        return;
      }
      locked.current = true;
      navigation.replace('PayConfirm', { payeeId: parsed.to, payeeName: parsed.name });
    },
  });

  if (permission !== 'granted') {
    return (
      <ScreenContainer style={styles.permWrap}>
        <Header title={t.qr.scanTitle} />
        <View style={styles.permBody}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>{t.qr.permissionTitle}</Text>
          <Text style={styles.permText}>{t.qr.permissionBody}</Text>
          <Button
            title={t.qr.grantPermission}
            onPress={async () => {
              const req = await Camera.requestCameraPermission();
              setPermission(req === 'granted' ? 'granted' : 'denied');
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (!device) {
    return (
      <ScreenContainer style={styles.permWrap}>
        <Header title={t.qr.scanTitle} />
        <View style={styles.permBody}>
          <Text style={styles.permText}>Kamera tidak tersedia.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.fill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <Header title={t.qr.scanTitle} />
        <View style={styles.frameWrap}>
          <View style={styles.frame} />
          <Text style={styles.hint}>{t.qr.scanHint}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 240,
    height: 240,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#fff',
    marginTop: spacing.xl,
    fontSize: font.size.md,
    fontWeight: font.weight.medium,
  },
  permWrap: { paddingHorizontal: spacing.xl },
  permBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  permIcon: { fontSize: 56 },
  permTitle: { fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.text },
  permText: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
});
