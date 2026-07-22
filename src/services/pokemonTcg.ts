// src/services/pokemonTcg.ts
// Fuente principal de CATÁLOGO: nombre, set, rareza, artista, año, imagen HD
// y precios "estándar" de mercado (TCGPlayer USD / Cardmarket EUR).
//
// Docs: https://docs.pokemontcg.io/  (API v2, datos en el campo `data`)

import { CardResult, MarketPrices, RecognizedCard } from '../types/card';

const BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.EXPO_PUBLIC_POKEMONTCG_KEY ?? '';

interface RawCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  artist?: string;
  types?: string[];
  flavorText?: string;
  images: { small: string; large: string };
  set: {
    id: string; name: string; series: string;
    releaseDate?: string; printedTotal?: number;
  };
  tcgplayer?: {
    updatedAt?: string;
    prices?: Record<string, { market?: number | null }>;
  };
  cardmarket?: { prices?: { trendPrice?: number | null } };
}

/** Construye la query Lucene de PokemonTCG.io a partir del OCR. */
function buildQuery(r: RecognizedCard): string {
  const parts: string[] = [];
  if (r.name) parts.push(`name:"${r.name}"`);
  if (r.number) parts.push(`number:${r.number}`);
  // setHint es opcional; el número + nombre ya suele bastar.
  return parts.join(' ');
}

/** Extrae el "market price" del primer variant disponible (normal/holo/etc.). */
function extractMarket(raw: RawCard): MarketPrices {
  const variants = raw.tcgplayer?.prices ?? {};
  const firstWithMarket = Object.values(variants).find(v => v?.market != null);
  return {
    tcgplayerUsd: firstWithMarket?.market ?? null,
    cardmarketEur: raw.cardmarket?.prices?.trendPrice ?? null,
    updatedAt: raw.tcgplayer?.updatedAt ?? null,
    source: 'pokemontcg.io',
  };
}

/**
 * Busca la carta y devuelve un CardResult SIN precios graduados todavía
 * (esos los añade priceCharting a través del edge function).
 */
export async function findCard(r: RecognizedCard): Promise<CardResult> {
  const q = buildQuery(r);
  if (!q) throw new Error('OCR insuficiente para buscar la carta.');

  const url = `${BASE}/cards?q=${encodeURIComponent(q)}&pageSize=1&orderBy=-set.releaseDate`;
  const res = await fetch(url, {
    headers: API_KEY ? { 'X-Api-Key': API_KEY } : {},
  });
  if (!res.ok) throw new Error(`PokemonTCG.io error ${res.status}`);

  const json = (await res.json()) as { data: RawCard[] };
  const raw = json.data?.[0];
  if (!raw) throw new Error('Carta no encontrada en el catálogo.');

  const trivia: string[] = [];
  if (raw.flavorText) trivia.push(raw.flavorText);
  if (raw.set.releaseDate) trivia.push(`Set "${raw.set.name}" lanzado el ${raw.set.releaseDate}.`);
  if (raw.artist) trivia.push(`Ilustrada por ${raw.artist}.`);

  return {
    id: raw.id,
    name: raw.name,
    number: raw.number,
    set: {
      id: raw.set.id,
      name: raw.set.name,
      series: raw.set.series,
      releaseDate: raw.set.releaseDate ?? null,
      printedTotal: raw.set.printedTotal ?? null,
    },
    rarity: raw.rarity ?? null,
    types: raw.types ?? [],
    artist: raw.artist ?? null,
    images: raw.images,
    market: extractMarket(raw),
    graded: null, // se rellena después
    trivia,
  };
}
