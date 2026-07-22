// src/components/PriceLadder.tsx
// La escalera de precios: sin graduar -> PSA 8 -> 9 -> 10.
//
// Decisión de diseño: no es una tabla. Es una escalera visual, porque el dato
// interesante para un coleccionista no es cada precio aislado sino EL SALTO
// entre grados: cuánto vale mandar la carta a graduar. La barra hace visible
// ese salto de un vistazo.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, radius, space, type, mxn } from '../theme/tokens';

export interface Rung {
  key: string;
  label: string;
  value: number | null;
}

export function PriceLadder({ rungs }: { rungs: Rung[] }) {
  const max = Math.max(...rungs.map((r) => r.value ?? 0), 1);

  return (
    <View style={{ gap: space.sm }}>
      {rungs.map((r, i) => {
        const pct = r.value ? Math.max((r.value / max) * 100, 6) : 0;
        // El último peldaño (el grado más alto) va en oro. El resto en aqua.
        const isTop = i === rungs.length - 1 && r.value != null;
        const bar = isTop ? color.gold : color.foil;

        return (
          <View key={r.key} style={s.row}>
            <Text style={[type.label, s.grade]}>{r.label}</Text>

            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  { width: `${pct}%`, backgroundColor: bar, opacity: isTop ? 1 : 0.5 },
                ]}
              />
            </View>

            <Text
              style={[
                type.money,
                s.amount,
                { color: r.value == null ? color.dim : isTop ? color.gold : color.bone },
              ]}
            >
              {mxn(r.value)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  grade: { color: color.ash, width: 62 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: color.window,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: radius.pill },
  amount: { width: 96, textAlign: 'right' },
});
