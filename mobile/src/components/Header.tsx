import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, font, spacing } from '../theme';

type Props = { title?: string; onBack?: () => void; right?: React.ReactNode };

export function Header({ title, onBack, right }: Props) {
  const nav = useNavigation();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack ?? (() => nav.goBack())}
        hitSlop={10}
        style={styles.back}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 28, color: colors.text, marginTop: -4 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  right: { width: 40, alignItems: 'flex-end' },
});
