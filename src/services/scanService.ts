// src/services/scanService.ts
// Orquesta el flujo completo de un escaneo:
//   1) Consumir 1 escaneo (límite server-side, atómico)  -> consume_scan RPC
//   2) Reconocer la carta (OCR / visión)
//   3) Traer catálogo + precios estándar (PokemonTCG.io)
//   4) Traer precios graduados PSA (edge function -> PriceCharting)
//   5) Fusionar en un CardResult
//
// El límite se valida SIEMPRE en el backend. El cliente nunca decide si
// "quedan escaneos": solo muestra lo que el servidor devuelve.

import { supabase } from '../lib/supabase';
import { CardResult, GradedPrices } from '../types/card';
import { recognizeCard } from './cardRecognition';
import { findCard } from './pokemonTcg';

export class ScanLimitError extends Error {
  remaining = 0;
  constructor() {
    super('Límite diario de escaneos alcanzado.');
    this.name = 'ScanLimitError';
  }
}

interface ConsumeResult {
  allowed: boolean;
  premium: boolean;
  remaining: number; // -1 = ilimitado (premium)
  limit?: number;
}

/** Llama a la función atómica de la base de datos que descuenta 1 escaneo. */
async function consumeScan(): Promise<ConsumeResult> {
  const { data, error } = await supabase.rpc('consume_scan');
  if (error) throw error;
  return data as ConsumeResult;
}

/** Pide precios graduados al edge function (que oculta el token de PriceCharting). */
async function fetchGradedPrices(name: string, number: string): Promise<GradedPrices | null> {
  try {
    const { data, error } = await supabase.functions.invoke('price-lookup', {
      body: { name, number, currency: 'MXN' },
    });
    if (error) return null; // los precios graduados son "best effort"
    return data as GradedPrices;
  } catch {
    return null;
  }
}

export interface ScanOutcome {
  card: CardResult;
  remaining: number; // para pintar "X/10 restantes"
  premium: boolean;
}

/** Punto de entrada que consume la pantalla de cámara. */
export async function scanCard(imageUri: string): Promise<ScanOutcome> {
  // 1) Gate de límite (antes de gastar llamadas a APIs externas).
  const gate = await consumeScan();
  if (!gate.allowed) {
    const err = new ScanLimitError();
    err.remaining = 0;
    throw err;
  }

  // 2) Reconocer.
  const recognized = await recognizeCard(imageUri);
  if (recognized.confidence < 0.4) {
    throw new Error('No se pudo leer la carta con claridad. Intenta de nuevo.');
  }

  // 3) Catálogo + precios estándar.
  const card = await findCard(recognized);

  // 4) Precios graduados (en paralelo no es posible aquí porque depende de 3).
  card.graded = await fetchGradedPrices(card.name, card.number);

  return { card, remaining: gate.remaining, premium: gate.premium };
}
