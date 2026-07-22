// src/components/UI.tsx
// Controles base: botón, campo de texto y etiqueta micro.

import React from 'react';
import {
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { color, radius, space, type } from '../theme/tokens';

type Variant = 'primary' | 'ghost' | 'gold';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => [
        b.base,
        variant === 'primary' && b.primary,
        variant === 'gold' && b.gold,
        variant === 'ghost' && b.ghost,
        pressed && !off && b.pressed,
        off && b.off,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? color.bone : color.ink} />
      ) : (
        <Text
          style={[
            b.text,
            variant === 'ghost' ? { color: color.bone } : { color: color.ink },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const b = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  primary: { backgroundColor: color.foil },
  gold: { backgroundColor: color.gold },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.edge },
  pressed: { opacity: 0.82 },
  off: { opacity: 0.45 },
  text: { fontSize: 16, fontWeight: '700' },
});

export function Field({
  label,
  value,
  onChangeText,
  secure,
  keyboard,
  autoCap,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  keyboard?: 'email-address' | 'default';
  autoCap?: 'none' | 'sentences';
}) {
  return (
    <View style={{ gap: space.sm }}>
      <Text style={[type.label, { color: color.ash }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboard ?? 'default'}
        autoCapitalize={autoCap ?? 'none'}
        autoCorrect={false}
        placeholderTextColor={color.dim}
        style={f.input}
      />
    </View>
  );
}

const f = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.edge,
    backgroundColor: color.slab,
    paddingHorizontal: space.md,
    color: color.bone,
    fontSize: 16,
  },
});

/** Etiqueta micro en versalitas, el recurso tipográfico de la app. */
export function Label({ children, tone }: { children: string; tone?: string }) {
  return <Text style={[type.label, { color: tone ?? color.ash }]}>{children}</Text>;
}
