// app/(app)/scan.tsx
// Pantalla principal: cámara con el marco "slab".
//
// El overlay no es un rectángulo genérico: reproduce la silueta de una carcasa
// de graduación (etiqueta arriba + ventana abajo), que es el motivo de la app.
// La etiqueta muestra el estado en vivo del escaneo.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { useAuth } from '../../src/context/AuthContext';
import { scanCard, ScanLimitError } from '../../src/services/scanService';
import { Button, Label } from '../../src/components/UI';
import { color, space, type, radius } from '../../src/theme/tokens';

const { width: SW } = Dimensions.get('window');
// Proporción de una carta: 63x88 mm.
const FRAME_W = Math.min(SW - space.lg * 2, 330);
const FRAME_H = FRAME_W * (88 / 63);

type Phase = 'idle' | 'reading' | 'searching' | 'pricing';

export default function Scan() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const cam = useRef<CameraView>(null);

  const [perm, requestPerm] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('idle');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const busy = phase !== 'idle';

  // ── Permiso de cámara ──────────────────────────────────────────
  if (!perm) return <View style={{ flex: 1, backgroundColor: color.ink }} />;

  if (!perm.granted) {
    return (
      <View style={[s.permWrap, { paddingTop: insets.top + space.xxl }]}>
        <View style={s.permIcon}>
          <View style={s.permLine} />
        </View>
        <Text style={[type.title, { color: color.bone, textAlign: 'center' }]}>
          {t('scan.permTitle')}
        </Text>
        <Text style={[type.body, { color: color.ash, textAlign: 'center' }]}>
          {t('scan.permBody')}
        </Text>
        <Button title={t('scan.permGrant')} onPress={requestPerm} />
      </View>
    );
  }

  // ── Captura y escaneo ──────────────────────────────────────────
  const capture = async () => {
    if (busy) return;
    setErr(null);
    setPhase('reading');

    try {
      const photo = await cam.current?.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error('sin foto');

      setPhase('searching');
      const outcome = await scanCard(photo.uri);

      setPhase('pricing');
      setRemaining(outcome.remaining);

      router.push({
        pathname: '/(app)/result',
        params: { payload: JSON.stringify(outcome.card) },
      });
    } catch (e) {
      if (e instanceof ScanLimitError) {
        router.push('/(app)/paywall');
      } else {
        setErr(t('scan.errUnreadable'));
      }
    } finally {
      setPhase('idle');
    }
  };

  const statusText =
    phase === 'reading'
      ? t('scan.reading')
      : phase === 'searching'
        ? t('scan.searching')
        : phase === 'pricing'
          ? t('scan.pricing')
          : t('scan.frameHint');

  const quota = profile?.is_premium
    ? t('scan.unlimited')
    : remaining != null
      ? t('scan.remaining', { n: remaining, total: 10 })
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />

      {/* Velo oscuro sobre la cámara, con la ventana recortada visualmente */}
      <View style={[StyleSheet.absoluteFill, s.veil]}>
        {/* Barra superior */}
        <View style={[s.top, { paddingTop: insets.top + space.sm }]}>
          <Text style={[type.label, { color: color.gold }]}>SCANNER DEX</Text>
          <Pressable onPress={() => router.push('/(app)/settings')} hitSlop={12}>
            <Label tone={color.ash}>{t('settings.title')}</Label>
          </Pressable>
        </View>

        {/* ── El marco slab ── */}
        <View style={{ alignItems: 'center' }}>
          <View style={[s.frame, { width: FRAME_W, height: FRAME_H }]}>
            <View style={s.frameLabel}>
              <View style={[s.tick, { backgroundColor: busy ? color.foil : color.gold }]} />
              {busy && <ActivityIndicator size="small" color={color.foil} />}
              <Text style={[type.label, { color: color.bone, flex: 1 }]} numberOfLines={1}>
                {statusText}
              </Text>
            </View>

            {/* Esquinas: guías de encuadre */}
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
          </View>

          {quota && (
            <Text style={[type.label, { color: color.ash, marginTop: space.md }]}>{quota}</Text>
          )}

          {err && <Text style={s.err}>{err}</Text>}
        </View>

        {/* Barra inferior: disparador + disclaimer legal obligatorio */}
        <View style={[s.bottom, { paddingBottom: insets.bottom + space.md }]}>
          <Pressable
            onPress={capture}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('scan.capture')}
            style={({ pressed }) => [s.shutter, pressed && { opacity: 0.7 }, busy && { opacity: 0.4 }]}
          >
            <View style={s.shutterInner} />
          </Pressable>

          {/* DISCLAIMER: visible en el escáner, no escondido en ajustes. */}
          <Text style={s.disclaimer}>{t('legal.disclaimerShort')}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  veil: {
    backgroundColor: 'rgba(15,18,24,0.62)',
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  frame: {
    borderRadius: radius.slab,
    borderWidth: 1.5,
    borderColor: color.edge,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  frameLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    backgroundColor: 'rgba(25,30,38,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: color.edge,
  },
  tick: { width: 3, height: 14, borderRadius: 2 },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: color.foil,
  },
  tl: { top: 52, left: 10, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
  tr: { top: 52, right: 10, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
  bl: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
  br: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  bottom: { alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: color.bone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.gold },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    color: color.ash,
    textAlign: 'center',
  },
  err: {
    marginTop: space.md,
    color: color.alert,
    backgroundColor: color.alertSoft,
    padding: space.md,
    borderRadius: radius.md,
    fontSize: 13,
    textAlign: 'center',
    marginHorizontal: space.lg,
  },
  permWrap: {
    flex: 1,
    backgroundColor: color.ink,
    paddingHorizontal: space.lg,
    gap: space.lg,
    alignItems: 'center',
  },
  permIcon: {
    width: 84,
    height: 116,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.gold,
    backgroundColor: color.slab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permLine: { width: 48, height: 2, backgroundColor: color.foil, borderRadius: 2 },
});
