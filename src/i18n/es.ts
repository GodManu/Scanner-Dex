// src/i18n/es.ts
export default {
  appName: 'Scanner Dex',
  tagline: 'Identifica y valúa tus cartas coleccionables',

  common: {
    continue: 'Continuar',
    cancel: 'Cancelar',
    back: 'Volver',
    retry: 'Intentar de nuevo',
    close: 'Cerrar',
    loading: 'Cargando',
  },

  auth: {
    signIn: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    email: 'Correo',
    password: 'Contraseña',
    withGoogle: 'Continuar con Google',
    or: 'o',
    noAccount: '¿No tienes cuenta? Crear una',
    hasAccount: '¿Ya tienes cuenta? Iniciar sesión',
    signOut: 'Cerrar sesión',
    acceptPrefix: 'Al crear tu cuenta aceptas los',
    acceptTerms: 'términos y condiciones',
    errEmail: 'Escribe un correo válido.',
    errPassword: 'La contraseña necesita al menos 8 caracteres.',
    errGeneric: 'No se pudo completar. Revisa tus datos e inténtalo otra vez.',
  },

  scan: {
    title: 'Escanear',
    frameHint: 'Coloca la carta dentro del marco',
    capture: 'Escanear carta',
    reading: 'Leyendo carta',
    searching: 'Buscando en el catálogo',
    pricing: 'Consultando precios',
    permTitle: 'Necesitamos la cámara',
    permBody:
      'Scanner Dex usa la cámara únicamente para leer la carta que tienes enfrente. Las fotos no se guardan ni se envían a ningún servidor.',
    permGrant: 'Permitir cámara',
    remaining: '{{n}} de {{total}} escaneos hoy',
    unlimited: 'Escaneos ilimitados',
    errUnreadable:
      'No se pudo leer la carta. Busca mejor luz, evita reflejos y llena el marco.',
  },

  result: {
    specs: 'Ficha técnica',
    set: 'Colección',
    number: 'Número',
    rarity: 'Rareza',
    artist: 'Ilustración',
    year: 'Año',
    type: 'Tipo',
    prices: 'Valor estimado',
    ungraded: 'Sin graduar',
    market: 'Mercado',
    trivia: 'Datos de la carta',
    scanAnother: 'Escanear otra',
    mockNotice: 'Valores de demostración. No son precios reales.',
    psaNotice: 'Los precios por grado requieren un proveedor de datos de pago.',
    priceDisclaimer:
      'Valores estimados con fines informativos. No son una oferta de compra ni asesoría de inversión.',
  },

  paywall: {
    title: 'Escaneos ilimitados',
    subtitle: 'Llegaste a tus {{n}} escaneos de hoy.',
    price: '$89 MXN al mes',
    perks: [
      'Escaneos y búsquedas sin límite',
      'Historial completo de tus cartas',
      'Valores por grado, cuando estén disponibles',
    ],
    cta: 'Obtener ilimitado',
    later: 'Seguir con el plan gratis',
    resetNote: 'Tus escaneos gratis se reinician a medianoche.',
  },

  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
    account: 'Cuenta',
    plan: 'Plan',
    planFree: 'Gratis',
    planPremium: 'Ilimitado',
    legal: 'Legal',
    terms: 'Términos y condiciones',
    version: 'Versión',
  },

  legal: {
    title: 'Términos y condiciones',
    disclaimerShort:
      'Scanner Dex no verifica la autenticidad física de las cartas. Identifica el modelo impreso, no determina si una carta es genuina.',
    affiliationShort:
      'App independiente. Sin relación con Nintendo, The Pokémon Company, Creatures, Game Freak ni ninguna otra casa editora.',
  },
};
