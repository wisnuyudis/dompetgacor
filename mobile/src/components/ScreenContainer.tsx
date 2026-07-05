import React from 'react';
import { StyleSheet, View, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  background?: string;
  barStyle?: 'light-content' | 'dark-content';
};

export function ScreenContainer({
  children,
  style,
  edges = ['top', 'bottom'],
  background = colors.background,
  barStyle = 'dark-content',
}: Props) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={edges}>
      <StatusBar barStyle={barStyle} backgroundColor={background} />
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});
