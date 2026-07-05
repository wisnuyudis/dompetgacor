import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, font, spacing } from '../theme';

type Props = { icon: string; label: string; onPress?: () => void };

export function QuickAction({ icon, label, onPress }: Props) {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      {({ pressed }) => (
        <>
          <View style={[styles.circle, pressed && { opacity: 0.7 }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { fontSize: 24 },
  label: {
    marginTop: spacing.sm,
    fontSize: font.size.xs,
    color: colors.text,
    fontWeight: font.weight.medium,
  },
});
