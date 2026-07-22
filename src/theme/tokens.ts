// src/theme/tokens.ts
// Sistema de diseño. Todo color, espacio y tamaño de la app sale de aquí.
//
// Concepto: el "slab" — la carcasa rígida de una carta graduada.
// Grafito profundo como base (la carpeta del coleccionista), oro para lo
// graduado/premium, aqua para lo interactivo/escaneo.

export const color = {
  ink: '#0F1218', // fondo de pantalla
  slab: '#191E26', // superficie: tarjetas, paneles
  window: '#222935', // superficie elevada, bordes suaves
  edge: '#2E3745', // bordes visibles

  bone: '#ECEEF2', // texto principal
  ash: '#8B95A5', // texto secundario
  dim: '#5D6675', // texto terciario, deshabilitado

  gold: '#C9A227', // graduado, premium, PSA
  goldSoft: '#3A3117', // fondo tenue dorado

  foil: '#5AC8D8', // acento de escaneo, enlaces, foco
  foilSoft: '#132B31', // fondo tenue aqua

  alert: '#E0574B', // errores, límite alcanzado
  alertSoft: '#33191A',

  ok: '#5FBF8F',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  slab: 14, // esquinas de la carcasa
  pill: 999,
} as const;

export const type = {
  // Etiqueta micro: versalitas espaciadas, como el texto de una etiqueta
  // de graduación. Es la firma tipográfica de la app.
  label: {
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  caption: { fontSize: 13, fontWeight: '400' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  title: { fontSize: 20, fontWeight: '600' as const },
  display: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.5 },
  // Precios: peso alto y ancho tabular para que las cifras se alineen.
  money: {
    fontSize: 19,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

/** Formatea pesos mexicanos. Null -> guion largo. */
export function mxn(v: number | null | undefined): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(v);
}
