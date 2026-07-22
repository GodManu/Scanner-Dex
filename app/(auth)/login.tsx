// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n';
import { Button, Field } from '../../src/components/UI';
import { color, space, type, radius } from '../../src/theme/tokens';

/**
 * Marca: cartas apiladas con líneas de índice.
 * "Dex" es índice, así que la carta del frente lleva renglones catalogados
 * y una línea de escaneo cruzándolos. Escáner + índice en una sola figura.
 */
function Wordmark() {
  return (
    <View style={w.stack}>
      <View style={[w.card, { backgroundColor: color.window, transform: [{ rotate: '-9deg' }] }]} />
      <View style={[w.card, { backgroundColor: color.slab, transform: [{ rotate: '4deg' }] }]} />
      <View style={[w.card, w.front]}>
        <View style={w.rows}>
          <View style={[w.row, { width: 34 }]} />
          <View style={[w.row, { width: 26 }]} />
          <View style={[w.row, { width: 30 }]} />
        </View>
        <View style={w.scanline} />
      </View>
    </View>
  );
}

const w = StyleSheet.create({
  stack: { width: 110, height: 130, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: 76,
    height: 106,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.edge,
  },
  front: {
    backgroundColor: color.slab,
    borderColor: color.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rows: { gap: 7, alignItems: 'center' },
  row: { height: 3, borderRadius: 2, backgroundColor: color.edge },
  scanline: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: color.foil,
    borderRadius: 2,
  },
});

export default function Login() {
  const { t } = useI18n();
  const { signInEmail, signInGoogle } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email.includes('@')) return setErr(t('auth.errEmail'));
    setBusy(true);
    try {
      await signInEmail(email.trim(), pass);
      router.replace('/(app)/scan');
    } catch {
      setErr(t('auth.errGeneric'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          s.wrap,
          { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Wordmark />

        <View style={{ alignItems: 'center', gap: space.sm }}>
          {/* Dos tonos: "Scanner" es la acción, "Dex" es el catálogo. */}
          <Text style={[type.display, { color: color.bone }]}>
            Scanner<Text style={{ color: color.gold }}>Dex</Text>
          </Text>
          <Text style={[type.caption, { color: color.ash, textAlign: 'center' }]}>
            {t('tagline')}
          </Text>
        </View>

        <View style={{ gap: space.md }}>
          <Button title={t('auth.withGoogle')} variant="ghost" onPress={signInGoogle} />

          <View style={s.divider}>
            <View style={s.rule} />
            <Text style={[type.label, { color: color.dim }]}>{t('auth.or')}</Text>
            <View style={s.rule} />
          </View>

          <Field
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboard="email-address"
          />
          <Field label={t('auth.password')} value={pass} onChangeText={setPass} secure />

          {err && <Text style={s.err}>{err}</Text>}

          <Button title={t('auth.signIn')} onPress={submit} loading={busy} />

          <Link href="/(auth)/signup" asChild>
            <Pressable style={{ paddingVertical: space.sm }}>
              <Text style={[type.caption, s.link]}>{t('auth.noAccount')}</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: space.lg, gap: space.xl, justifyContent: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rule: { flex: 1, height: 1, backgroundColor: color.edge },
  link: { color: color.foil, textAlign: 'center' },
  err: {
    color: color.alert,
    backgroundColor: color.alertSoft,
    padding: space.md,
    borderRadius: radius.md,
    fontSize: 14,
  },
});
