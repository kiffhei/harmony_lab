/**
 * MusicTheory.js — Harmony Lab Pro
 * Lógica musical pura. Sin UI, sin side effects, sin imports externos.
 * Cobertura de tests requerida: > 90%
 */

// ── Constantes ────────────────────────────────────────────────────────────────

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  'Major':          [0, 2, 4, 5, 7, 9, 11],
  'Minor':          [0, 2, 3, 5, 7, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Dorian':         [0, 2, 3, 5, 7, 9, 10],
  'Phrygian':       [0, 1, 3, 5, 7, 8, 10],
  'Lydian':         [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian':     [0, 2, 4, 5, 7, 9, 10],
  'Pentatonic Maj': [0, 2, 4, 7, 9],
  'Pentatonic Min': [0, 3, 5, 7, 10],
  'Blues':          [0, 3, 5, 6, 7, 10],
  // Double Harmonic = Raga Bhairav occidental (Glass Beams, música turca)
  'Double Harmonic':   [0, 1, 4, 5, 7, 8, 11],
  // Phrygian Dominant = Makam Hüseyni proxy 12-tone (King Gizzard microtonal)
  'Phrygian Dominant': [0, 1, 4, 5, 7, 8, 10],
};

export const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

/** Frecuencia de referencia — A4 = 440Hz */
const A4_FREQ = 440;
const A4_MIDI = 69;

// ── Tipos de acordes triádicos ────────────────────────────────────────────────

/** Intervalos de los tritonos: [tercera, quinta] en semitonos desde la raíz */
const TRIAD_PATTERNS = {
  maj: [4, 7],
  min: [3, 7],
  dim: [3, 6],
  aug: [4, 8],
};

// ── Funciones de escala ───────────────────────────────────────────────────────

/**
 * Retorna las notas de una escala dado un root y nombre de escala.
 *
 * @param {string} root - Nota raíz, ej: 'C', 'F#'
 * @param {string} scaleName - Nombre de la escala, ej: 'Major'
 * @returns {string[]} Array de notas en orden ascendente
 * @throws {Error} Si root o scaleName son inválidos
 *
 * @example
 * getScale('C', 'Major') // → ['C','D','E','F','G','A','B']
 * getScale('A', 'Minor') // → ['A','B','C','D','E','F','G']
 */
export function getScale(root, scaleName) {
  const rootIdx = NOTES.indexOf(root);
  if (rootIdx === -1) throw new Error(`Nota raíz inválida: "${root}"`);

  const intervals = SCALES[scaleName];
  if (!intervals) throw new Error(`Escala inválida: "${scaleName}"`);

  return intervals.map((interval) => NOTES[(rootIdx + interval) % 12]);
}

// ── Funciones de acordes diatónicos ──────────────────────────────────────────

/**
 * Retorna los acordes diatónicos de una tonalidad.
 * Solo escalas de 7 notas soportan grados romanos completos.
 * Las escalas pentatónicas y Blues retornan acordes sin función armónica romana.
 *
 * @param {string} root
 * @param {string} scaleName
 * @returns {Array<{root: string, quality: string, roman: string, notes: string[]}>}
 *
 * @example
 * getDiatonic('C', 'Major')
 * // → [
 * //   { root: 'C', quality: 'maj', roman: 'I',    notes: ['C','E','G'] },
 * //   { root: 'D', quality: 'min', roman: 'ii',   notes: ['D','F','A'] },
 * //   ...
 * // ]
 */
export function getDiatonic(root, scaleName) {
  const scale = getScale(root, scaleName);

  return scale.map((note, degree) => {
    const noteIdx = NOTES.indexOf(note);
    const third   = NOTES[(noteIdx + 3) % 12];
    const fifth   = NOTES[(noteIdx + 7) % 12];

    // Determinar calidad del acorde según los intervalos en la escala
    const thirdInterval  = (NOTES.indexOf(third)  - noteIdx + 12) % 12;
    const fifthInterval  = (NOTES.indexOf(fifth)  - noteIdx + 12) % 12;

    // Ajustar tercera y quinta para que caigan dentro de la escala
    const scaleSet = new Set(scale);
    let actualThird = third;
    let actualFifth = fifth;

    // Buscar la tercera más cercana dentro de la escala
    for (let i = 3; i <= 4; i++) {
      const candidate = NOTES[(noteIdx + i) % 12];
      if (scaleSet.has(candidate)) { actualThird = candidate; break; }
    }
    // Buscar la quinta más cercana dentro de la escala
    for (let i = 6; i <= 8; i++) {
      const candidate = NOTES[(noteIdx + i) % 12];
      if (scaleSet.has(candidate)) { actualFifth = candidate; break; }
    }

    const t = (NOTES.indexOf(actualThird) - noteIdx + 12) % 12;
    const f = (NOTES.indexOf(actualFifth) - noteIdx + 12) % 12;

    let quality = 'maj';
    if      (t === 3 && f === 6) quality = 'dim';
    else if (t === 4 && f === 8) quality = 'aug';
    else if (t === 3)            quality = 'min';
    else if (t === 4)            quality = 'maj';

    const roman = degree < ROMAN.length ? ROMAN[degree] : `${degree + 1}`;

    return {
      root:    note,
      quality,
      roman,
      notes:   [note, actualThird, actualFifth],
    };
  });
}

// ── Frecuencias ───────────────────────────────────────────────────────────────

/**
 * Calcula la frecuencia en Hz de una nota en una octava dada.
 * Usa afinación igual temperada con A4 = 440Hz como referencia.
 *
 * @param {string} note  - Nota, ej: 'A', 'C#'
 * @param {number} octave - Octava (0-8), default 4
 * @returns {number} Frecuencia en Hz, redondeada a 3 decimales
 * @throws {Error} Si la nota es inválida
 *
 * @example
 * noteFreq('A', 4) // → 440
 * noteFreq('C', 4) // → 261.626
 * noteFreq('A', 5) // → 880
 */
export function noteFreq(note, octave = 4) {
  const noteIdx = NOTES.indexOf(note);
  if (noteIdx === -1) throw new Error(`Nota inválida: "${note}"`);

  // MIDI number: C4 = 60
  const midi = (octave + 1) * 12 + noteIdx;
  const freq = A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
  return Math.round(freq * 1000) / 1000;
}

/**
 * Convierte una frecuencia en Hz a la nota más cercana.
 *
 * @param {number} freq - Frecuencia en Hz (> 0)
 * @returns {string} Nombre de la nota, ej: 'A4', 'C#3'
 * @throws {Error} Si la frecuencia es inválida
 *
 * @example
 * freqToNote(440)   // → 'A4'
 * freqToNote(261.6) // → 'C4'
 */
export function freqToNote(freq) {
  if (!freq || freq <= 0) throw new Error(`Frecuencia inválida: ${freq}`);

  const midi   = Math.round(A4_MIDI + 12 * Math.log2(freq / A4_FREQ));
  const octave = Math.floor(midi / 12) - 1;
  const note   = NOTES[midi % 12];
  return `${note}${octave}`;
}

/**
 * Calcula la desviación en cents entre una frecuencia y una nota de referencia.
 * Un cent = 1/100 de semitono. Rango: -50 a +50 cents.
 *
 * @param {number} freq     - Frecuencia medida en Hz
 * @param {string} noteStr  - Nota de referencia, ej: 'A4'
 * @returns {number} Desviación en cents (-50 a +50)
 *
 * @example
 * freqCents(442, 'A4')  // → ~+7.85 (ligeramente alto)
 * freqCents(438, 'A4')  // → ~-7.85 (ligeramente bajo)
 */
export function freqCents(freq, noteStr) {
  // Extraer nota y octava del string 'A4', 'C#3', etc.
  const match = noteStr.match(/^([A-G]#?)(\d+)$/);
  if (!match) throw new Error(`Formato de nota inválido: "${noteStr}"`);

  const [, noteName, octaveStr] = match;
  const refFreq = noteFreq(noteName, parseInt(octaveStr, 10));

  return 1200 * Math.log2(freq / refFreq);
}

// ── Calidad de acordes ────────────────────────────────────────────────────────

/**
 * Determina la calidad de un acorde a partir de un array de notas.
 * Analiza únicamente los intervalos de la tríada (root, tercera, quinta).
 *
 * @param {string[]} notes - Array de notas, mínimo 2
 * @returns {'maj'|'min'|'dim'|'aug'|'unknown'}
 *
 * @example
 * getChordQuality(['C', 'E', 'G'])  // → 'maj'
 * getChordQuality(['A', 'C', 'E'])  // → 'min'
 * getChordQuality(['B', 'D', 'F'])  // → 'dim'
 */
export function getChordQuality(notes) {
  if (!notes || notes.length < 2) return 'unknown';

  const root = NOTES.indexOf(notes[0]);
  if (root === -1) return 'unknown';

  // Calcular intervalos desde la raíz
  const intervals = notes.slice(1).map((n) => {
    const idx = NOTES.indexOf(n);
    if (idx === -1) return -1;
    return (idx - root + 12) % 12;
  });

  const third = intervals[0];
  const fifth  = intervals[1] ?? null;

  for (const [quality, pattern] of Object.entries(TRIAD_PATTERNS)) {
    if (third === pattern[0] && (fifth === null || fifth === pattern[1])) {
      return quality;
    }
  }

  return 'unknown';
}

// ── Utilidades ────────────────────────────────────────────────────────────────

/**
 * Normaliza una nota a su enharmonic equivalente en el array NOTES.
 * Ej: 'Db' → 'C#', 'Bb' → 'A#'
 *
 * @param {string} note
 * @returns {string}
 */
export function normalizeNote(note) {
  const enharmonics = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
    'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
    'E#': 'F',  'B#': 'C',
  };
  return enharmonics[note] ?? note;
}

/**
 * Retorna los nombres de todas las escalas disponibles.
 * @returns {string[]}
 */
export function getScaleNames() {
  return Object.keys(SCALES);
}

/**
 * Retorna todas las notas del cromático.
 * @returns {string[]}
 */
export function getAllNotes() {
  return [...NOTES];
}
