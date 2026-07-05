import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Pressable,
} from 'react-native';
import { colors, radius, font, spacing } from '../theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: string;
  secure?: boolean;
};

export function TextField({ label, error, leftIcon, secure, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errorField,
        ]}>
        {leftIcon ? <Text style={styles.icon}>{leftIcon}</Text> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden(h => !h)} hitSlop={8}>
            <Text style={styles.toggle}>{hidden ? '👁️' : '🙈'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    fontSize: font.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: font.weight.medium,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focused: { borderColor: colors.primary, backgroundColor: colors.surface },
  errorField: { borderColor: colors.danger },
  icon: { fontSize: 18, marginRight: spacing.sm },
  input: { flex: 1, fontSize: font.size.md, color: colors.text, padding: 0 },
  toggle: { fontSize: 18 },
  errorText: {
    color: colors.danger,
    fontSize: font.size.xs,
    marginTop: spacing.xs,
  },
});
