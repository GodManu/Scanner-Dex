// app/(app)/legal.tsx
// Términos y condiciones dentro de la app.
//
// Los dos avisos que más importan (autenticidad y no-afiliación) van ARRIBA,
// en tarjetas destacadas, antes del texto largo. Nadie lee 10 secciones; sí
// lee dos recuadros.

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { Label } from '../../src/components/UI';
import { termsEs, termsEn, LAST_UPDATED } from '../../src/legal/terms';
import { color, space, type, radius } from '../../src/theme/tokens';

function Notice({ tone, title, body }: { tone: string; title: string; body: string }) {
  return (
    <View style={[s.notice, { borderLeftColor: tone }]}>
      <Text style={[type.label, { color: tone }]}>{title}</Text>
      <Text style={[type.body, { color: color.bone }]}>{body}</Text>
    </View>
  );
}

export default function Legal() {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const body = locale === 'en' ? termsEn : termsEs;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.ink }}
      contentContainerStyle={[
        s.wrap,
        { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.xxl },
      ]}
    >
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-start' }}>
        <Label tone={color.foil}>{`← ${t('common.back')}`}</Label>
      </Pressable>

      <View style={{ gap: space.xs }}>
        <Text style={[type.display, { color: color.bone }]}>{t('legal.title')}</Text>
        <Text style={[type.caption, { color: color.dim }]}>{LAST_UPDATED}</Text>
      </View>

      <Notice
        tone={color.alert}
        title={locale === 'en' ? 'AUTHENTICITY' : 'AUTENTICIDAD'}
        body={t('legal.disclaimerShort')}
      />
      <Notice
        tone={color.gold}
        title={locale === 'en' ? 'INDEPENDENT APP' : 'APP INDEPENDIENTE'}
        body={t('legal.affiliationShort')}
      />

      <Text style={s.body}>{body}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, gap: space.lg },
  notice: {
    backgroundColor: color.slab,
    padding: space.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    gap: space.sm,
  },
  body: {
    color: color.ash,
    fontSize: 14,
    lineHeight: 22,
  },
});
