// supabase/functions/price-lookup/index.ts
// Proxy de precios con PROVEEDOR INTERCAMBIABLE + CACHÉ.
//
// ¿Por qué así? Porque hoy quieres $0 y mañana querrás precios PSA reales.
// Cambiando UNA variable de entorno cambias de proveedor sin tocar la app:
//
//   PRICE_PROVIDER=mock   -> GRATIS. Precios PSA simulados (desarrollo).
//   PRICE_PROVIDER=ppt    -> PokemonPriceTracker. Free tier: 100 créditos/día.
//                            Da precio de mercado; PSA solo en planes de pago.
//   PRICE_PROVIDER=pc     -> PriceCharting. De pago, pero el más completo en PSA.
//
// La CACHÉ es obligatoria, no opcional: con 100 créditos/día te quedas sin
// cuota en 100 escaneos. Guardando por carta, 100 usuarios escaneando el mismo
// Charizard = 1 sola llamada.

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PROVIDER = Deno.env.get('PRICE_PROVIDER') ?? 'mock';
const USD_TO_MXN = Number(Deno.env.get('USD_TO_MXN') ?? '18.5');
const CACHE_HOURS = Number(Deno.env.get('CACHE_HOURS') ?? '24');

// Estas dos las inyecta Supabase automáticamente en los edge functions.
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface Graded {
  currency: 'MXN';
  provider: string;
  ungraded: number | null;
  psa8: number | null;
  psa9: number | null;
  psa10: number | null;
  note: string | null; // mensaje para la UI (ej. "datos simulados")
}

const mxn = (usd: number | null) =>
  usd == null ? null : Math.round(usd * USD_TO_MXN * 100) / 100;

// ─────────────────────── Proveedor: MOCK (gratis) ───────────────────────
// Genera una escala PSA plausible a partir de un precio base determinista.
// Sirve para construir y probar TODA la pantalla de resultados sin gastar $0.
function providerMock(name: string, number: string): Graded {
  // Hash simple del nombre -> precio base estable (mismo input, mismo output).
  let h = 0;
  for (const ch of name + number) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const base = 5 + (h % 400); // USD 5..405

  return {
    currency: 'MXN',
    provider: 'mock',
    ungraded: mxn(base),
    psa8: mxn(base * 1.8),
    psa9: mxn(base * 3.2),
    psa10: mxn(base * 9.5),
    note: 'Datos simulados para desarrollo. No son precios reales.',
  };
}

// ───────────── Proveedor: PokemonPriceTracker (free tier) ─────────────
async function providerPPT(name: string, number: string): Promise<Graded> {
  const key = Deno.env.get('PPT_API_KEY');
  if (!key) throw new Error('Falta PPT_API_KEY');

  const q = encodeURIComponent(`${name} ${number}`.trim());
  const url = `https://www.pokemonpricetracker.com/api/v2/cards?search=${q}&limit=1`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`PPT error ${res.status}`);

  const json = await res.json();
  const card = json?.data?.[0];
  if (!card) throw new Error('Carta no encontrada');

  // El free tier entrega precio de mercado. Los graduados PSA vienen en
  // planes de pago, así que aquí llegan como null y la UI lo indica.
  const ebay = card.ebay ?? {};
  const hasPsa = ebay?.psa10?.avg != null;

  return {
    currency: 'MXN',
    provider: 'pokemonpricetracker',
    ungraded: mxn(card?.prices?.market ?? null),
    psa8: mxn(ebay?.psa8?.avg ?? null),
    psa9: mxn(ebay?.psa9?.avg ?? null),
    psa10: mxn(ebay?.psa10?.avg ?? null),
    note: hasPsa ? null : 'Precios PSA requieren plan de pago del proveedor.',
  };
}

// ───────── Proveedor: PriceCharting (de pago, el más completo) ─────────
// ⚠️ Reutiliza nombres de campo de videojuegos. Para CARTAS:
//    loose-price = sin graduar | new-price = grado 8 |
//    graded-price = grado 9 | manual-only-price = PSA 10
//    Los valores vienen en CENTAVOS de USD.
async function providerPC(name: string, number: string): Promise<Graded> {
  const token = Deno.env.get('PRICECHARTING_TOKEN');
  if (!token) throw new Error('Falta PRICECHARTING_TOKEN');

  const q = encodeURIComponent(`${name} ${number}`.trim());
  const res = await fetch(
    `https://www.pricecharting.com/api/product?t=${token}&q=${q}`,
  );
  const raw = await res.json();
  if (raw.status !== 'success') throw new Error('Carta no encontrada');

  const c = (v: any) => (typeof v === 'number' && v > 0 ? v / 100 : null);

  return {
    currency: 'MXN',
    provider: 'pricecharting',
    ungraded: mxn(c(raw['loose-price'])),
    psa8: mxn(c(raw['new-price'])),
    psa9: mxn(c(raw['graded-price'])),
    psa10: mxn(c(raw['manual-only-price'])), // <- sí, aquí vive el PSA 10
    note: null,
  };
}

// ─────────────────────────── Handler ───────────────────────────

serve(async (req) => {
  try {
    const { name, number = '' } = await req.json();
    if (!name) return json({ error: 'name requerido' }, 400);

    const cacheKey = `${PROVIDER}:${name}:${number}`.toLowerCase();

    // 1) ¿Está en caché y todavía fresco?
    const { data: hit } = await admin
      .from('card_prices')
      .select('payload, fetched_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (hit) {
      const ageH = (Date.now() - new Date(hit.fetched_at).getTime()) / 3.6e6;
      if (ageH < CACHE_HOURS) return json(hit.payload, 200);
    }

    // 2) Consultar al proveedor activo.
    let graded: Graded;
    if (PROVIDER === 'pc') graded = await providerPC(name, number);
    else if (PROVIDER === 'ppt') graded = await providerPPT(name, number);
    else graded = providerMock(name, number);

    // 3) Guardar en caché (no bloquea la respuesta si falla).
    await admin.from('card_prices').upsert({
      cache_key: cacheKey,
      payload: graded,
      fetched_at: new Date().toISOString(),
    });

    return json(graded, 200);
  } catch (e) {
    // Si el proveedor falla, degradamos a mock en vez de romper el escaneo.
    return json({ error: String(e) }, 200);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
