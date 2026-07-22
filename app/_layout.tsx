// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { I18nProvider } from '../src/i18n';
import { color } from '../src/theme/tokens';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.ink },
              animation: 'fade',
            }}
          />
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
