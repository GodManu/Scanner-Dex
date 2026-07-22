// src/components/Slab.tsx
// EL ELEMENTO FIRMA DE LA APP.
//
// Un "slab" es la carcasa rígida donde vive una carta graduada: una etiqueta
// arriba con los datos, y debajo la ventana transparente con la carta.
// Ese silueta se repite en toda la app: es el marco de la cámara, el
// contenedor del resultado y el panel de precios. Un solo motivo, coherente.

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { color, radius, space, type } from '../theme/tokens';

interface Props {
  /** Texto pequeño de la izquierda en la etiqueta (ej. "BASE SET"). */
  label?: string;
  /** Texto de la derecha, destacado (ej. "4/102"). */
  badge?: string;
  /** Color del acento de la etiqueta. */
  accent?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  /** Ventana transparente: para la cámara, sin fondo sólido. */
  hollow?: boolean;
}

export function Slab({
  label,
  badge,
  accent = color.gold,
  children,
  style,
  hollow,
}: Props) {
  return (
    <View style={[s.shell, style]}>
      {(label || badge) && (
        <View style={[s.label, { borderBottomColor: color.edge }]}>
          <View style={[s.tick, { backgroundColor: accent }]} />
          <Text style={[type.label, s.labelText]} numberOfLines={1}>
            {label}
          </Text>
          {badge ? (
            <Text style={[type.label, { color: accent }]}>{badge}</Text>
          ) : null}
        </View>
      )}
      <View style={[s.window, hollow && s.hollow]}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  shell: {
    borderRadius: radius.slab,
    borderWidth: 1,
    borderColor: color.edge,
    backgroundColor: color.slab,
    overflow: 'hidden',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    borderBottomWidth: 1,
    backgroundColor: color.window,
  },
  // Marca vertical de color: el detalle que hace que la etiqueta se lea
  // como una etiqueta de graduación y no como un encabezado cualquiera.
  tick: { width: 3, height: 14, borderRadius: 2 },
  labelText: { color: color.ash, flex: 1 },
  window: { padding: space.md },
  hollow: { padding: 0, backgroundColor: 'transparent' },
});
