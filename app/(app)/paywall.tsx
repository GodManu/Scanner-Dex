// app/(app)/paywall.tsx
// Muro de pago. Aparece cuando el servidor responde que ya no quedan escaneos.
//
// Tono: no castiga al usuario por llegar al límite. Le dice qué pasó, qué
// obtiene si paga, y le deja una salida clara sin pagar.

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { Button, Label } from '../../src/components/UI';
import { Slab } from '../../src/components/Slab';
import { color, space, type } from '../../src/theme/tokens';

export default function Paywall() {
  const { t, raw } = useI18n();
  const insets = useSafeAreaInsets();

  const startPurchase = () => {
    // TODO: conectar RevenueCat aquí.
    // await Purchases.purchasePackage(pkg)  ->  webhook marca is_premium
    // Mientras tanto, no hacemos nada: no prometemos lo que no cumplimos.
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.ink }}
      contentContainerStyle={[
        s.wrap,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <View style={{ gap: space.sm }}>
        <Label tone={color.gold}>SCANNER DEX</Label>
        <Text style={[type.display, { color: color.bone }]}>{t('paywall.title')}</Text>
        <Text style={[type.body, { color: color.ash }]}>
          {t('paywall.subtitle', { n: 10 })}
        </Text>
      </View>

      <Slab label="PLAN" badge="PREMIUM" accent={color.gold}>
        <View style={{ gap: space.lg }}>
          <Text style={[type.display, { color: color.gold }]}>{t('paywall.price')}</Text>

          <View style={{ gap: space.md }}>
            {raw.paywall.perks.map((p: string, i: number) => (
              <View key={i} style={s.perk}>
                <View style={s.check} />
                <Text style={[type.body, { color: color.bone, flex: 1 }]}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      </Slab>

      <View style={{ gap: space.md }}>
        <Button title={t('paywall.cta')} variant="gold" onPress={startPurchase} />

        <Pressable onPress={() => router.back()} style={{ paddingVertical: space.sm }}>
          <Text style={[type.caption, { color: color.foil, textAlign: 'center' }]}>
            {t('paywall.later')}
          </Text>
        </Pressable>

        <Text style={[type.caption, { color: color.dim, textAlign: 'center' }]}>
          {t('paywall.resetNote')}
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, gap: space.xl, flexGrow: 1, justifyContent: 'center' },
  perk: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: color.gold,
  },
});
