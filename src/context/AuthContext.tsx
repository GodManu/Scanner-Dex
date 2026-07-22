// src/context/AuthContext.tsx
// Sesión + perfil del usuario. Una sola fuente de verdad para toda la app.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string | null;
  locale: 'es' | 'en';
  is_premium: boolean;
}

interface Ctx {
  session: Session | null;
  profile: Profile | null;
  ready: boolean;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<Ctx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, locale, is_premium')
      .eq('id', userId)
      .single();
    setProfile((data as Profile) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  // OAuth con Google. En Expo se abre el navegador del sistema y regresa
  // a la app por el scheme "scannerdex://".
  const signInGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'scannerdex://auth/callback' },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session) await loadProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        ready,
        signInEmail,
        signUpEmail,
        signInGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
