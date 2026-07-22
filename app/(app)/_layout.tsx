// app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { color } from '../../src/theme/tokens';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.ink },
      }}
    >
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
