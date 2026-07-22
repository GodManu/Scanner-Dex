// app/(auth)/signup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n';
import { Button, Field } from '../../src/components/UI';
import { color, space, type, radius } from '../../src/theme/tokens';

export default function SignUp() {
  const { t } = useI18n();
  const { signUpEmail, signInGoogle } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!email.includes('@')) return setErr(t('auth.errEmail'));
    if (pass.length < 8) return setErr(t('auth.errPassword'));
    setBusy(true);
    try {
      await signUpEmail(email.trim(), pass);
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
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: space.xs }}>
          <Text style={[type.display, { color: color.bone }]}>{t('auth.signUp')}</Text>
          <Text style={[type.caption, { color: color.ash }]}>{t('tagline')}</Text>
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

          <Button title={t('auth.signUp')} onPress={submit} loading={busy} />

          {/* Aceptación de términos: visible ANTES de crear la cuenta. */}
          <Text style={[type.caption, { color: color.dim, textAlign: 'center' }]}>
            {t('auth.acceptPrefix')}{' '}
            <Link href="/(app)/legal" style={{ color: color.foil }}>
              {t('auth.acceptTerms')}
            </Link>
          </Text>

          <Link href="/(auth)/login" asChild>
            <Pressable style={{ paddingVertical: space.sm }}>
              <Text style={[type.caption, { color: color.foil, textAlign: 'center' }]}>
                {t('auth.hasAccount')}
              </Text>
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
  err: {
    color: color.alert,
    backgroundColor: color.alertSoft,
    padding: space.md,
    borderRadius: radius.md,
    fontSize: 14,
  },
});
