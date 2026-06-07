/**
 * MidiExport.js — Harmony Lab Pro
 * Exportación MIDI Type 0 implementada en binario puro, sin librerías.
 *
 * Referencia de formato:
 *   Header chunk: MThd [4] + length [4=6] + format [2=0] + tracks [2=1] + division [2=96]
 *   Track chunk:  MTrk [4] + length [4] + events...
 *   Drums:        Canal MIDI 9 (0x99 note_on, 0x89 note_off)
 *
 * GM Drum Map:
 *   kick=36, snare=38, hh_closed=42, hh_open=46,
 *   clap=39, tom1=48, tom2=47, shaker=69
 */

// ── Constantes MIDI ───────────────────────────────────────────────────────────

const TICKS_PER_BEAT = 96;
const DEFAULT_VELOCITY = 100;

/** GM Drum map — nombre → nota MIDI */
export const DRUM_MAP = {
  kick:    36,
  snare:   38,
  hh_c:    42,
  hh_o:    46,
  clap:    39,
  tom1:    48,
  tom2:    47,
  shaker:  69,
};

/** Map de nombres de notas a número MIDI */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ── Encoders binarios ─────────────────────────────────────────────────────────

/**
 * Codifica un número como Variable-Length Quantity (VLQ).
 * @param {number} value
 * @returns {number[]}
 */
export function encodeVLQ(value) {
  if (value === 0) return [0];
  const bytes = [];
  let v = value;
  while (v > 0) {
    bytes.unshift(v & 0x7f);
    v >>= 7;
  }
  for (let i = 0; i < bytes.length - 1; i++) {
    bytes[i] |= 0x80;
  }
  return bytes;
}

function int32BE(value) {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >>  8) & 0xff,
     value        & 0xff,
  ];
}

function int16BE(value) {
  return [(value >> 8) & 0xff, value & 0xff];
}

// ── Builders de chunks MIDI ───────────────────────────────────────────────────

function buildHeader() {
  return [
    0x4d, 0x54, 0x68, 0x64,  // "MThd"
    0x00, 0x00, 0x00, 0x06,  // chunk length = 6
    0x00, 0x00,              // format 0
    0x00, 0x01,              // 1 track
    ...int16BE(TICKS_PER_BEAT),
  ];
}

function buildTrack(events) {
  const withEOT = [...events, 0x00, 0xff, 0x2f, 0x00];
  return [
    0x4d, 0x54, 0x72, 0x6b,  // "MTrk"
    ...int32BE(withEOT.length),
    ...withEOT,
  ];
}

function tempoEvent(bpm) {
  const uspb = Math.round(60_000_000 / bpm);
  return [
    0x00,
    0xff, 0x51, 0x03,
    (uspb >> 16) & 0xff,
    (uspb >>  8) & 0xff,
     uspb        & 0xff,
  ];
}

function noteToMidi(note, octave) {
  const idx = NOTE_NAMES.indexOf(note);
  if (idx === -1) throw new Error(`Nota MIDI inválida: "${note}"`);
  return (octave + 1) * 12 + idx;
}

// ── Builders puros (sin DOM) — testables ─────────────────────────────────────

/**
 * Construye los bytes MIDI de una progresión de acordes.
 * Separado de exportProgression para ser testable sin APIs de browser.
 *
 * @param {Array<{notes: string[], octave?: number, beats?: number}>} chords
 * @param {number} [bpm=120]
 * @returns {number[]}
 */
export function buildProgressionBytes(chords, bpm = 120) {
  if (!chords || chords.length === 0) {
    throw new Error('La progresión no puede estar vacía');
  }

  const events = [...tempoEvent(bpm)];

  chords.forEach(({ notes, octave = 4, beats = 4 }) => {
    const tickDur   = TICKS_PER_BEAT * beats;
    const midiNotes = notes.map((n) => noteToMidi(n, octave));

    midiNotes.forEach((midi) => {
      events.push(...encodeVLQ(0), 0x90, midi, DEFAULT_VELOCITY);
    });

    midiNotes.forEach((midi, i) => {
      events.push(
        ...(i === 0 ? encodeVLQ(tickDur) : encodeVLQ(0)),
        0x80, midi, 0,
      );
    });
  });

  return [...buildHeader(), ...buildTrack(events)];
}

/**
 * Construye los bytes MIDI de un patrón de batería.
 * Separado de exportDrums para ser testable sin APIs de browser.
 *
 * @param {Object<string, boolean[]>} pattern
 * @param {number} [bpm=120]
 * @returns {number[]}
 */
export function buildDrumsBytes(pattern, bpm = 120) {
  if (!pattern || Object.keys(pattern).length === 0) {
    throw new Error('El patrón de batería no puede estar vacío');
  }

  const STEPS = 16;
  const ticksPerStep = TICKS_PER_BEAT / 4;
  const events = [...tempoEvent(bpm)];

  const noteOnsByStep  = Array.from({ length: STEPS }, () => []);
  const noteOffsByStep = Array.from({ length: STEPS }, () => []);

  Object.entries(pattern).forEach(([instrument, steps]) => {
    const midiNote = DRUM_MAP[instrument];
    if (midiNote === undefined) return;

    steps.forEach((active, step) => {
      if (active) {
        noteOnsByStep[step].push(midiNote);
        noteOffsByStep[(step + 1) % STEPS].push(midiNote);
      }
    });
  });

  let currentTick = 0;

  for (let step = 0; step < STEPS; step++) {
    const targetTick = step * ticksPerStep;
    const delta      = targetTick - currentTick;

    noteOnsByStep[step].forEach((midi, i) => {
      events.push(
        ...(i === 0 ? encodeVLQ(delta) : encodeVLQ(0)),
        0x99, midi, DEFAULT_VELOCITY,
      );
      if (i === 0) currentTick = targetTick;
    });

    noteOffsByStep[step].forEach((midi, i) => {
      const d = (noteOnsByStep[step].length > 0 || i > 0) ? 0 : delta;
      events.push(...encodeVLQ(d), 0x89, midi, 0);
      if (d > 0) currentTick = targetTick;
    });
  }

  return [...buildHeader(), ...buildTrack(events)];
}

// ── Exportaciones con descarga ────────────────────────────────────────────────

/**
 * Exporta una progresión de acordes como archivo MIDI.
 * @param {Array<{notes: string[], octave?: number, beats?: number}>} chords
 * @param {number} [bpm=120]
 * @param {string} [filename='progression.mid']
 */
export function exportProgression(chords, bpm = 120, filename = 'progression.mid') {
  downloadMidi(buildProgressionBytes(chords, bpm), filename);
}

/**
 * Exporta un patrón de batería como archivo MIDI.
 * @param {Object<string, boolean[]>} pattern
 * @param {number} [bpm=120]
 * @param {string} [filename='drums.mid']
 */
export function exportDrums(pattern, bpm = 120, filename = 'drums.mid') {
  downloadMidi(buildDrumsBytes(pattern, bpm), filename);
}

// ── Descarga ──────────────────────────────────────────────────────────────────

/**
 * Descarga un array de bytes como archivo MIDI.
 * @param {number[]} bytes
 * @param {string} filename
 */
export function downloadMidi(bytes, filename) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
