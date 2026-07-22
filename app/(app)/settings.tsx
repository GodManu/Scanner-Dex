// app/(app)/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n, Locale } from '../../src/i18n';
import { useAuth } from '../../src/context/AuthContext';
import { Slab } from '../../src/components/Slab';
import { Button, Label } from '../../src/components/UI';
import { color, space, type, radius } from '../../src/theme/tokens';

function Row({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const Cmp: any = onPress ? Pressable : View;
  return (
    <Cmp onPress={onPress} style={s.row}>
      <Text style={[type.body, { color: color.bone, flex: 1 }]}>{label}</Text>
      {value && <Text style={[type.body, { color: color.ash }]}>{value}</Text>}
      {onPress && <Text style={{ color: color.dim, fontSize: 18 }}>›</Text>}
    </Cmp>
  );
}

export default function Settings() {
  const { t, locale, setLocale } = useI18n();
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const langs: { key: Locale; label: string }[] = [
    { key: 'es', label: t('settings.spanish') },
    { key: 'en', label: t('settings.english') },
  ];

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

      <Text style={[type.display, { color: color.bone }]}>{t('settings.title')}</Text>

      {/* Idioma: segmentado, cambia al instante */}
      <View style={{ gap: space.md }}>
        <Label>{t('settings.language')}</Label>
        <View style={s.segment}>
          {langs.map((l) => {
            const on = locale === l.key;
            return (
              <Pressable
                key={l.key}
                onPress={() => setLocale(l.key)}
                style={[s.segItem, on && s.segOn]}
              >
                <Text style={[type.body, { color: on ? color.ink : color.ash, fontWeight: '600' }]}>
                  {l.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: space.md }}>
        <Label>{t('settings.account')}</Label>
        <Slab>
          <Row label={t('auth.email')} value={profile?.email ?? '—'} />
          <Row
            label={t('settings.plan')}
            value={profile?.is_premium ? t('settings.planPremium') : t('settings.planFree')}
          />
        </Slab>
      </View>

      <View style={{ gap: space.md }}>
        <Label>{t('settings.legal')}</Label>
        <Slab>
          <Row label={t('settings.terms')} onPress={() => router.push('/(app)/legal')} />
          <Row label={t('settings.version')} value="1.0.0" />
        </Slab>
        <Text style={s.fine}>{t('legal.affiliationShort')}</Text>
      </View>

      <Button title={t('auth.signOut')} variant="ghost" onPress={signOut} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, gap: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.edge,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: color.slab,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.edge,
    padding: 4,
    gap: 4,
  },
  segItem: {
    flex: 1,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: { backgroundColor: color.foil },
  fine: { fontSize: 11, lineHeight: 16, color: color.dim },
});
