// app/(app)/result.tsx
// Resultado del escaneo. La carta se presenta DENTRO del mismo slab que usa
// la cámara: cerramos el círculo visual — lo que encuadraste es lo que sale.

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { Slab } from '../../src/components/Slab';
import { PriceLadder, Rung } from '../../src/components/PriceLadder';
import { Button, Label } from '../../src/components/UI';
import { CardResult } from '../../src/types/card';
import { color, space, type, radius, mxn } from '../../src/theme/tokens';

function Spec({ k, v }: { k: string; v: string | null }) {
  if (!v) return null;
  return (
    <View style={s.spec}>
      <Text style={[type.label, { color: color.dim }]}>{k}</Text>
      <Text style={[type.body, { color: color.bone, flex: 1, textAlign: 'right' }]}>{v}</Text>
    </View>
  );
}

export default function Result() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { payload } = useLocalSearchParams<{ payload: string }>();

  let card: CardResult | null = null;
  try {
    card = JSON.parse(payload ?? '');
  } catch {
    card = null;
  }

  if (!card) {
    return (
      <View style={[s.wrap, { paddingTop: insets.top + space.xxl }]}>
        <Text style={[type.body, { color: color.ash }]}>{t('scan.errUnreadable')}</Text>
        <Button title={t('common.back')} variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  const g = card.graded;
  const rungs: Rung[] = g
    ? [
        { key: 'raw', label: t('result.ungraded'), value: g.ungraded },
        { key: 'psa8', label: 'PSA 8', value: g.psa8 },
        { key: 'psa9', label: 'PSA 9', value: g.psa9 },
        { key: 'psa10', label: 'PSA 10', value: g.psa10 },
      ]
    : [];

  const year = card.set.releaseDate?.slice(0, 4) ?? null;

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

      {/* La carta, dentro del slab */}
      <Slab label={card.set.name} badge={`${card.number}/${card.set.printedTotal ?? '?'}`}>
        <Image
          source={{ uri: card.images.large }}
          style={s.art}
          resizeMode="contain"
          accessibilityLabel={card.name}
        />
      </Slab>

      <View style={{ gap: space.xs }}>
        <Text style={[type.display, { color: color.bone }]}>{card.name}</Text>
        {card.rarity && <Label tone={color.gold}>{card.rarity}</Label>}
      </View>

      {/* Precios */}
      {g && (
        <View style={{ gap: space.md }}>
          <Label>{t('result.prices')}</Label>
          <Slab>
            <PriceLadder rungs={rungs} />
          </Slab>

          {g.note && (
            <View style={s.notice}>
              <Text style={s.noticeText}>{g.note}</Text>
            </View>
          )}
          <Text style={s.fine}>{t('result.priceDisclaimer')}</Text>
        </View>
      )}

      {/* Ficha técnica */}
      <View style={{ gap: space.md }}>
        <Label>{t('result.specs')}</Label>
        <Slab>
          <Spec k={t('result.set')} v={card.set.name} />
          <Spec k={t('result.number')} v={card.number} />
          <Spec k={t('result.rarity')} v={card.rarity} />
          <Spec k={t('result.type')} v={card.types.join(', ') || null} />
          <Spec k={t('result.artist')} v={card.artist} />
          <Spec k={t('result.year')} v={year} />
          <Spec
            k={t('result.market')}
            v={card.market.tcgplayerUsd ? `US$${card.market.tcgplayerUsd.toFixed(2)}` : null}
          />
        </Slab>
      </View>

      {/* Curiosidades */}
      {card.trivia.length > 0 && (
        <View style={{ gap: space.md }}>
          <Label>{t('result.trivia')}</Label>
          <Slab>
            <View style={{ gap: space.md }}>
              {card.trivia.map((line, i) => (
                <View key={i} style={s.trivia}>
                  <View style={s.dot} />
                  <Text style={[type.body, { color: color.ash, flex: 1 }]}>{line}</Text>
                </View>
              ))}
            </View>
          </Slab>
        </View>
      )}

      <Button title={t('result.scanAnother')} onPress={() => router.back()} />

      <Text style={s.fine}>{t('legal.affiliationShort')}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, gap: space.lg },
  art: { width: '100%', height: 380, borderRadius: radius.sm },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.edge,
  },
  trivia: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: color.gold, marginTop: 8 },
  notice: {
    backgroundColor: color.goldSoft,
    padding: space.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: color.gold,
  },
  noticeText: { color: color.gold, fontSize: 13, lineHeight: 18 },
  fine: { fontSize: 11, lineHeight: 16, color: color.dim },
});
