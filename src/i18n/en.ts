// src/i18n/en.ts
export default {
  appName: 'Scanner Dex',
  tagline: 'Identify and value your collectible cards',

  common: {
    continue: 'Continue',
    cancel: 'Cancel',
    back: 'Back',
    retry: 'Try again',
    close: 'Close',
    loading: 'Loading',
  },

  auth: {
    signIn: 'Sign in',
    signUp: 'Create account',
    email: 'Email',
    password: 'Password',
    withGoogle: 'Continue with Google',
    or: 'or',
    noAccount: "Don't have an account? Create one",
    hasAccount: 'Already have an account? Sign in',
    signOut: 'Sign out',
    acceptPrefix: 'By creating an account you accept the',
    acceptTerms: 'terms and conditions',
    errEmail: 'Enter a valid email address.',
    errPassword: 'Password needs at least 8 characters.',
    errGeneric: "That didn't go through. Check your details and try again.",
  },

  scan: {
    title: 'Scan',
    frameHint: 'Place the card inside the frame',
    capture: 'Scan card',
    reading: 'Reading card',
    searching: 'Searching the catalog',
    pricing: 'Checking prices',
    permTitle: 'Camera access needed',
    permBody:
      'Scanner Dex uses the camera only to read the card in front of you. Photos are not stored or sent to any server.',
    permGrant: 'Allow camera',
    remaining: '{{n}} of {{total}} scans today',
    unlimited: 'Unlimited scans',
    errUnreadable:
      "Couldn't read that card. Find better light, avoid glare, and fill the frame.",
  },

  result: {
    specs: 'Card details',
    set: 'Set',
    number: 'Number',
    rarity: 'Rarity',
    artist: 'Illustration',
    year: 'Year',
    type: 'Type',
    prices: 'Estimated value',
    ungraded: 'Ungraded',
    market: 'Market',
    trivia: 'About this card',
    scanAnother: 'Scan another',
    mockNotice: 'Demo values. These are not real prices.',
    psaNotice: 'Graded values require a paid data provider.',
    priceDisclaimer:
      'Estimated values for information only. Not an offer to buy and not investment advice.',
  },

  paywall: {
    title: 'Unlimited scans',
    subtitle: "You've used your {{n}} scans for today.",
    price: '$89 MXN per month',
    perks: [
      'Unlimited scans and searches',
      'Full history of your cards',
      'Graded values where available',
    ],
    cta: 'Go unlimited',
    later: 'Stay on the free plan',
    resetNote: 'Your free scans reset at midnight.',
  },

  settings: {
    title: 'Settings',
    language: 'Language',
    spanish: 'Español',
    english: 'English',
    account: 'Account',
    plan: 'Plan',
    planFree: 'Free',
    planPremium: 'Unlimited',
    legal: 'Legal',
    terms: 'Terms and conditions',
    version: 'Version',
  },

  legal: {
    title: 'Terms and conditions',
    disclaimerShort:
      'Scanner Dex does not verify the physical authenticity of cards. It identifies the printed model; it does not determine whether a card is genuine.',
    affiliationShort:
      'Independent app. Not affiliated with Nintendo, The Pokémon Company, Creatures, Game Freak, or any other publisher.',
  },
};
