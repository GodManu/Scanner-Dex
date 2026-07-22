# Scanner Dex

Escáner de cartas coleccionables para Android e iOS. Identifica la carta con la
cámara y muestra su ficha, imagen HD y valores estimados de mercado.

App independiente. Sin relación con Nintendo, The Pokémon Company, Creatures,
Game Freak ni ninguna otra casa editora.

## Costo de desarrollo: $0

| Pieza | Plan | Costo |
|---|---|---|
| GitHub | público o privado | Gratis |
| Supabase | free tier | Gratis |
| PokemonTCG.io | key gratuita, 20k req/día | Gratis |
| OCR (ML Kit) | en el dispositivo | Gratis |
| Precios | proveedor `mock` | Gratis |
| Probar en tu Android | Expo Go / dev build | Gratis |

Único gasto planeado: **Google Play, $25 USD una sola vez.**

## Arranque

```bash
npm install
cp .env.example .env          # llena tus llaves de Supabase

supabase link --project-ref TU_REF
supabase db push                          # tablas, RLS, consume_scan()
supabase secrets set PRICE_PROVIDER=mock
supabase functions deploy price-lookup

npx expo start                # escanea el QR con tu celular
```

## Estructura

```
app/                          # pantallas (expo-router)
├─ index.tsx                  # puente: login o escáner
├─ (auth)/login · signup      # Google OAuth + correo
└─ (app)/
   ├─ scan.tsx                # cámara con marco slab + disclaimer
   ├─ result.tsx              # ficha, escalera de precios, curiosidades
   ├─ paywall.tsx             # muro de pago 89 MXN
   ├─ settings.tsx            # idioma, cuenta, legal
   └─ legal.tsx               # términos completos

src/
├─ theme/tokens.ts            # paleta, espaciado, tipografía
├─ components/                # Slab (firma visual), UI, PriceLadder
├─ i18n/                      # es · en, detecta idioma del teléfono
├─ legal/terms.ts             # términos completos en ambos idiomas
├─ context/AuthContext.tsx    # sesión y perfil
├─ services/                  # OCR, catálogo, orquestador del escaneo
└─ types/card.ts

supabase/
├─ migrations/0001_init.sql       # límite 10/día atómico + RLS
├─ migrations/0002_price_cache.sql# caché (protege la cuota gratis)
└─ functions/price-lookup/        # precios, proveedor intercambiable
```

## Diseño

**Motivo central: el slab.** La carcasa rígida de una carta graduada — etiqueta
arriba, ventana abajo — se repite en toda la app: es el marco de la cámara, el
contenedor del resultado y el panel de precios. Un solo gesto visual, coherente
de pantalla en pantalla.

**Paleta.** Grafito profundo (`#0F1218`) como base, oro (`#C9A227`) para lo
graduado y premium, aqua (`#5AC8D8`) para lo interactivo y el escaneo.

**Tipografía.** Versalitas espaciadas para las micro-etiquetas, imitando el
texto impreso de una etiqueta de graduación. Cifras tabulares en los precios
para que las columnas se alineen.

**La escalera de precios** no es una tabla: es una escalera visual, porque lo
que le importa al coleccionista no es cada precio aislado sino el salto entre
grados — cuánto vale mandar la carta a graduar.

## Los tres proveedores de precios

Cambias con **una variable**, sin tocar la app:

| `PRICE_PROVIDER` | Qué da | Costo |
|---|---|---|
| `mock` (actual) | Escala PSA simulada, estable por carta | Gratis |
| `ppt` | Precio de mercado real; PSA en plan de pago | Free: 100 créditos/día |
| `pc` | Escala PSA completa y real | Suscripción de pago |

## Pendientes antes de publicar

- [ ] Conectar OCR real: `MOCK_ENABLED = false` en `cardRecognition.ts`
- [ ] Configurar Google OAuth en Supabase (Authentication > Providers)
- [ ] Conectar RevenueCat en `paywall.tsx` + webhook que marque `is_premium`
- [ ] Poner tu correo real en `src/legal/terms.ts` (sección 10)
- [ ] Íconos y splash (`assets/`)
- [ ] Revisar los términos con un abogado antes de cobrar

## Notas

- **El límite de 10/día se valida SOLO en el servidor** (`consume_scan`).
- **`is_premium` solo lo cambia el webhook de pagos** (service_role); un trigger
  impide que el usuario se auto-marque premium.
- **Nunca subas `.env`** (ya está en `.gitignore`).
- Los free tiers de los proveedores de precios son para desarrollo. Revisa la
  licencia antes de cobrar suscripción.
