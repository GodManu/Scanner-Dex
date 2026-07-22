// src/types/card.ts
// Tipos compartidos entre los servicios de reconocimiento, catálogo y precios.

/** Resultado crudo del reconocimiento (OCR / visión). */
export interface RecognizedCard {
  name: string | null;        // "Charizard"
  number: string | null;      // "4"  (del "4/102" impreso en la carta)
  printedTotal: string | null;// "102"
  setHint: string | null;     // texto/símbolo del set si se pudo leer
  confidence: number;         // 0..1
}

/** Precios "estándar" de mercado (PokemonTCG.io -> TCGPlayer / Cardmarket). */
export interface MarketPrices {
  tcgplayerUsd: number | null;    // market price (USD)
  cardmarketEur: number | null;   // trend price (EUR)
  updatedAt: string | null;
  source: 'pokemontcg.io';
}

/** Escala de precios por graduación. Coincide con la salida de price-lookup. */
export interface GradedPrices {
  currency: 'MXN';
  provider: 'mock' | 'pokemonpricetracker' | 'pricecharting';
  ungraded: number | null;   // carta suelta / raw
  psa8: number | null;
  psa9: number | null;
  psa10: number | null;
  /** Aviso para la UI: "datos simulados", "requiere plan de pago", etc. */
  note: string | null;
}

/** Objeto unificado que consume la pantalla de resultado. */
export interface CardResult {
  id: string;                 // id de PokemonTCG.io (ej. "base1-4")
  name: string;
  number: string;
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate: string | null;
    printedTotal: number | null;
  };
  rarity: string | null;
  types: string[];
  artist: string | null;
  images: { small: string; large: string }; // HD
  market: MarketPrices;
  graded: GradedPrices | null;
  trivia: string[];           // "curiosidades" derivadas / generadas
}
