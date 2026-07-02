/**
 * MidiExport.test.js
 * Tests para src/core/MidiExport.js
 * Se testean buildProgressionBytes y buildDrumsBytes — funciones puras sin DOM.
 * downloadMidi se testea por separado con mocks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encodeVLQ,
  buildProgressionBytes,
  buildDrumsBytes,
  exportProgression,
  exportDrums,
  DRUM_MAP,
} from '../../core/MidiExport.js';

// ── Mock de APIs de browser ───────────────────────────────────────────────────

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

const origCreate = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  const el = origCreate(tag);
  if (tag === 'a') el.click = vi.fn();
  return el;
});

beforeEach(() => {
  vi.clearAllMocks();
  global.URL.createObjectURL.mockReturnValue('blob:mock-url');
});

// ── encodeVLQ ─────────────────────────────────────────────────────────────────

describe('encodeVLQ()', () => {
  it('0 → [0x00]', () => expect(encodeVLQ(0)).toEqual([0x00]));
  it('127 → [0x7f]', () => expect(encodeVLQ(127)).toEqual([0x7f]));
  it('128 → [0x81, 0x00]', () => expect(encodeVLQ(128)).toEqual([0x81, 0x00]));
  it('255 → [0x81, 0x7f]', () => expect(encodeVLQ(255)).toEqual([0x81, 0x7f]));
  it('256 → [0x82, 0x00]', () => expect(encodeVLQ(256)).toEqual([0x82, 0x00]));
  it('16383 → dos bytes', () => expect(encodeVLQ(16383)).toHaveLength(2));
  it('16384 → tres bytes', () => expect(encodeVLQ(16384)).toHaveLength(3));

  it('retorna bytes válidos (0-255)', () => {
    encodeVLQ(500).forEach((b) => {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(0xff);
    });
  });

  it('todos menos el último tienen bit 7 activo', () => {
    const result = encodeVLQ(2000);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i] & 0x80).toBe(0x80);
    }
    expect(result[result.length - 1] & 0x80).toBe(0);
  });

  it('96 (1 beat a 96ppq) → [0x60]', () => {
    expect(encodeVLQ(96)).toEqual([0x60]);
  });

  it('384 (4 beats) → dos bytes', () => {
    const r = encodeVLQ(384);
    expect(r).toHaveLength(2);
    expect(r[0] & 0x80).toBe(0x80);
  });
});

// ── DRUM_MAP ──────────────────────────────────────────────────────────────────

describe('DRUM_MAP', () => {
  it('kick = 36', () => expect(DRUM_MAP.kick).toBe(36));
  it('snare = 38', () => expect(DRUM_MAP.snare).toBe(38));
  it('hh_c = 42', () => expect(DRUM_MAP.hh_c).toBe(42));
  it('hh_o = 46', () => expect(DRUM_MAP.hh_o).toBe(46));
  it('clap = 39', () => expect(DRUM_MAP.clap).toBe(39));
  it('tom_hi = 50', () => expect(DRUM_MAP.tom_hi).toBe(50));
  it('tom_mid = 47', () => expect(DRUM_MAP.tom_mid).toBe(47));
  it('tom_lo = 41', () => expect(DRUM_MAP.tom_lo).toBe(41));
  it('shaker = 69', () => expect(DRUM_MAP.shaker).toBe(69));
  it('rimshot = 37', () => expect(DRUM_MAP.rimshot).toBe(37));
  it('cowbell = 56', () => expect(DRUM_MAP.cowbell).toBe(56));
  it('cymbal = 49', () => expect(DRUM_MAP.cymbal).toBe(49));

  it('todos en rango MIDI 0-127', () => {
    Object.values(DRUM_MAP).forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(127);
    });
  });
});

// ── buildProgressionBytes ─────────────────────────────────────────────────────

describe('buildProgressionBytes()', () => {
  const chords = [
    { notes: ['C', 'E', 'G'], octave: 4 },
    { notes: ['F', 'A', 'C'], octave: 4 },
    { notes: ['G', 'B', 'D'], octave: 4 },
    { notes: ['C', 'E', 'G'], octave: 4 },
  ];

  it('retorna array de números', () => {
    const bytes = buildProgressionBytes(chords);
    expect(Array.isArray(bytes)).toBe(true);
    bytes.forEach((b) => {
      expect(typeof b).toBe('number');
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    });
  });

  it('header empieza con MThd (0x4d 0x54 0x68 0x64)', () => {
    const bytes = buildProgressionBytes(chords);
    expect(bytes[0]).toBe(0x4d);
    expect(bytes[1]).toBe(0x54);
    expect(bytes[2]).toBe(0x68);
    expect(bytes[3]).toBe(0x64);
  });

  it('track chunk empieza con MTrk (0x4d 0x54 0x72 0x6b)', () => {
    const bytes = buildProgressionBytes(chords);
    expect(bytes[14]).toBe(0x4d);
    expect(bytes[15]).toBe(0x54);
    expect(bytes[16]).toBe(0x72);
    expect(bytes[17]).toBe(0x6b);
  });

  it('header tiene length = 6 bytes (bytes 4-7 = 0,0,0,6)', () => {
    const bytes = buildProgressionBytes(chords);
    expect(bytes[4]).toBe(0x00);
    expect(bytes[5]).toBe(0x00);
    expect(bytes[6]).toBe(0x00);
    expect(bytes[7]).toBe(0x06);
  });

  it('lanza error con array vacío', () => {
    expect(() => buildProgressionBytes([])).toThrow();
  });

  it('lanza error con null', () => {
    expect(() => buildProgressionBytes(null)).toThrow();
  });

  it('acepta BPM personalizado', () => {
    expect(() => buildProgressionBytes(chords, 90)).not.toThrow();
    expect(() => buildProgressionBytes(chords, 180)).not.toThrow();
  });

  it('acepta beats personalizados por acorde', () => {
    const c = [{ notes: ['C', 'E', 'G'], octave: 4, beats: 8 }];
    expect(() => buildProgressionBytes(c)).not.toThrow();
  });

  it('acorde con octava 3 funciona', () => {
    const c = [{ notes: ['C', 'E', 'G'], octave: 3 }];
    expect(() => buildProgressionBytes(c)).not.toThrow();
  });

  it('más acordes → más bytes', () => {
    const short = buildProgressionBytes([chords[0]]);
    const long  = buildProgressionBytes(chords);
    expect(long.length).toBeGreaterThan(short.length);
  });

  it('BPM afecta el evento de tempo (bytes 20-22)', () => {
    const b120 = buildProgressionBytes(chords, 120);
    const b90  = buildProgressionBytes(chords, 90);
    // El evento de tempo es diferente para BPM distintos
    const tempo120 = b120.slice(23, 30);
    const tempo90  = b90.slice(23, 30);
    expect(tempo120).not.toEqual(tempo90);
  });
});

// ── buildDrumsBytes ───────────────────────────────────────────────────────────

describe('buildDrumsBytes()', () => {
  const pattern = {
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hh_c:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };

  it('retorna array de números válidos', () => {
    const bytes = buildDrumsBytes(pattern);
    expect(Array.isArray(bytes)).toBe(true);
    bytes.forEach((b) => {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    });
  });

  it('header empieza con MThd', () => {
    const bytes = buildDrumsBytes(pattern);
    expect(bytes[0]).toBe(0x4d);
    expect(bytes[1]).toBe(0x54);
    expect(bytes[2]).toBe(0x68);
    expect(bytes[3]).toBe(0x64);
  });

  it('track chunk empieza con MTrk', () => {
    const bytes = buildDrumsBytes(pattern);
    expect(bytes[14]).toBe(0x4d);
    expect(bytes[15]).toBe(0x54);
    expect(bytes[16]).toBe(0x72);
    expect(bytes[17]).toBe(0x6b);
  });

  it('lanza error con objeto vacío', () => {
    expect(() => buildDrumsBytes({})).toThrow();
  });

  it('lanza error con null', () => {
    expect(() => buildDrumsBytes(null)).toThrow();
  });

  it('ignora instrumentos no reconocidos sin crash', () => {
    const p = { ...pattern, instrumento_falso: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] };
    expect(() => buildDrumsBytes(p)).not.toThrow();
  });

  it('funciona con patrón de solo kick', () => {
    expect(() => buildDrumsBytes({ kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] })).not.toThrow();
  });

  it('funciona con todos los instrumentos del DRUM_MAP', () => {
    const full = {};
    Object.keys(DRUM_MAP).forEach((inst) => {
      full[inst] = Array(16).fill(0);
      full[inst][0] = 1;
    });
    expect(() => buildDrumsBytes(full)).not.toThrow();
  });

  it('funciona con BPM 60 y 180', () => {
    expect(() => buildDrumsBytes(pattern, 60)).not.toThrow();
    expect(() => buildDrumsBytes(pattern, 180)).not.toThrow();
  });

  it('todos los pasos a 0 no genera error', () => {
    const silent = { kick: Array(16).fill(0), snare: Array(16).fill(0) };
    expect(() => buildDrumsBytes(silent)).not.toThrow();
  });

  it('más instrumentos activos → más bytes', () => {
    const single = buildDrumsBytes({ kick: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] });
    const multi  = buildDrumsBytes(pattern);
    expect(multi.length).toBeGreaterThan(single.length);
  });

  it('funciona con un patrón de menos de 16 pasos', () => {
    expect(() => buildDrumsBytes({ kick: [1,0,0,0,1,0,0,0] })).not.toThrow();
  });

  it('funciona con un patrón de más de 16 pasos', () => {
    expect(() => buildDrumsBytes({ kick: Array(32).fill(0).map((_, i) => (i % 8 === 0 ? 1 : 0)) })).not.toThrow();
  });

  it('un patrón de 32 pasos genera más eventos que uno de 16 con los mismos hits', () => {
    const p16 = { kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] };
    const p32 = { kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] };
    expect(buildDrumsBytes(p32).length).toBeGreaterThan(buildDrumsBytes(p16).length);
  });
});

// ── exportProgression / exportDrums — integración con DOM mock ───────────────

describe('exportProgression() — con DOM mock', () => {
  it('llama URL.createObjectURL', () => {
    exportProgression([{ notes: ['C', 'E', 'G'], octave: 4 }], 120);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('llama URL.revokeObjectURL', () => {
    exportProgression([{ notes: ['C', 'E', 'G'], octave: 4 }], 120);
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('crea elemento <a>', () => {
    exportProgression([{ notes: ['C', 'E', 'G'], octave: 4 }], 120);
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('lanza error con progresión vacía', () => {
    expect(() => exportProgression([], 120)).toThrow();
  });
});

describe('exportDrums() — con DOM mock', () => {
  const p = { kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] };

  it('llama URL.createObjectURL', () => {
    exportDrums(p, 120);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('llama URL.revokeObjectURL', () => {
    exportDrums(p, 120);
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('lanza error con patrón vacío', () => {
    expect(() => exportDrums({}, 120)).toThrow();
  });
});
