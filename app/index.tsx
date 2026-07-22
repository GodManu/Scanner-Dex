// app/index.tsx
// Pantalla puente: decide si mandarte al login o al escáner.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { color } from '../src/theme/tokens';

export default function Index() {
  const { session, ready } = useAuth();

  if (!ready) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={color.foil} />
      </View>
    );
  }
  return <Redirect href={session ? '/(app)/scan' : '/(auth)/login'} />;
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.ink },
});
