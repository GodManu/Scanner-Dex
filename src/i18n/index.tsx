// src/i18n/index.tsx
// i18n mínimo y sin dependencias externas.
// Detecta el idioma del teléfono al abrir y lo guarda en el perfil del usuario.

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import es from './es';
import en from './en';

export type Locale = 'es' | 'en';
const dicts = { es, en };
const STORE_KEY = 'scannerdex.locale';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  raw: typeof es;
};

const I18nContext = createContext<Ctx>(null as any);

/** Lee "scan.remaining" del diccionario y sustituye {{n}}. */
function resolve(dict: any, path: string, vars?: Record<string, any>): string {
  const value = path.split('.').reduce((o, k) => o?.[k], dict);
  if (typeof value !== 'string') return path; // fallback visible en desarrollo
  if (!vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORE_KEY);
      if (saved === 'es' || saved === 'en') return setLocaleState(saved);
      // Sin preferencia guardada: seguimos el idioma del teléfono.
      const device = Localization.getLocales()[0]?.languageCode;
      setLocaleState(device === 'en' ? 'en' : 'es');
    })();
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    AsyncStorage.setItem(STORE_KEY, l);
    // Guardamos también en el perfil para que viaje entre dispositivos.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').update({ locale: l }).eq('id', data.user.id);
      }
    });
  };

  const t = (path: string, vars?: Record<string, any>) =>
    resolve(dicts[locale], path, vars);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, raw: dicts[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
