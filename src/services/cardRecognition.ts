// src/services/cardRecognition.ts
// Reconocimiento de la carta a partir de la foto.
//
// Estrategia MVP (barata y fluida): OCR EN EL DISPOSITIVO con ML Kit para leer
// (1) el nombre (arriba) y (2) el número de coleccionista "4/102" (abajo).
// Con nombre + número se identifica la carta de forma casi única contra el catálogo.
//
// Para producción, si necesitas distinguir variantes (reverse holo, full art,
// promos), añade un matcher visual (p. ej. Ximilar Collectibles Recognition o un
// modelo propio de embeddings). La interfaz de abajo no cambia: solo cambia
// la implementación de `recognizeCard`.

import { RecognizedCard } from '../types/card';

// --- Implementación real (descomenta cuando integres el módulo nativo) --------
// import TextRecognition from '@react-native-ml-kit/text-recognition';
//
// export async function recognizeCard(imageUri: string): Promise<RecognizedCard> {
//   const result = await TextRecognition.recognize(imageUri);
//   const lines = result.blocks.flatMap(b => b.lines.map(l => l.text));
//   return parseCardText(lines);
// }

/** Extrae nombre y número desde las líneas OCR. Aislado para poder testearlo. */
export function parseCardText(lines: string[]): RecognizedCard {
  const joined = lines.join('\n');

  // Número de coleccionista tipo "4/102", "004/102", "SV045", "GG69", "TG12/TG30".
  const numMatch =
    joined.match(/\b(\d{1,3})\s*\/\s*(\d{1,3})\b/) ||          // 4/102
    joined.match(/\b([A-Z]{1,3}\d{1,3})\s*\/\s*[A-Z0-9]+\b/) || // TG12/TG30
    joined.match(/\b([A-Z]{1,3}\d{1,3})\b/);                    // SV045, GG69

  let number: string | null = null;
  let printedTotal: string | null = null;
  if (numMatch) {
    number = numMatch[1].replace(/^0+(?=\d)/, ''); // "004" -> "4"
    printedTotal = numMatch[2] ?? null;
  }

  // El nombre suele ser la primera línea "de peso": letras, sin números de HP.
  const name =
    lines
      .map(l => l.trim())
      .find(l => /^[A-Za-zÀ-ÿ'’.\- ]{3,}$/.test(l) && !/HP/i.test(l)) ?? null;

  const confidence = (name ? 0.5 : 0) + (number ? 0.5 : 0);

  return { name, number, printedTotal, setHint: null, confidence };
}

/**
 * SIMULACIÓN para desarrollar sin cámara ni módulo nativo.
 * Cambia MOCK_ENABLED a false cuando conectes ML Kit.
 */
const MOCK_ENABLED = true;

export async function recognizeCard(imageUri: string): Promise<RecognizedCard> {
  if (MOCK_ENABLED) {
    // Simula haber leído un Charizard 4/102 del Base Set.
    await new Promise(r => setTimeout(r, 350)); // simula latencia de OCR
    return {
      name: 'Charizard',
      number: '4',
      printedTotal: '102',
      setHint: 'Base',
      confidence: 0.95,
    };
  }
  throw new Error('OCR real no configurado: instala @react-native-ml-kit/text-recognition');
}
