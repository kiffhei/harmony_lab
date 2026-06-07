/**
 * MusicTheory.test.js
 * Tests exhaustivos para src/core/MusicTheory.js
 * Target: >90% cobertura en líneas, funciones y ramas
 */

import { describe, it, expect } from 'vitest';
import {
  NOTES, SCALES, ROMAN,
  getScale, getDiatonic, noteFreq,
  freqToNote, freqCents, getChordQuality,
  normalizeNote, getScaleNames, getAllNotes,
} from '../../core/MusicTheory.js';

// ── NOTES ─────────────────────────────────────────────────────────────────────

describe('NOTES', () => {
  it('contiene 12 notas únicas', () => {
    expect(NOTES).toHaveLength(12);
    expect(new Set(NOTES).size).toBe(12);
  });

  it('empieza en C y termina en B', () => {
    expect(NOTES[0]).toBe('C');
    expect(NOTES[11]).toBe('B');
  });

  it('incluye todas las notas cromáticas', () => {
    const expected = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    expect(NOTES).toEqual(expected);
  });
});

// ── SCALES ────────────────────────────────────────────────────────────────────

describe('SCALES', () => {
  it('tiene 10 escalas definidas', () => {
    expect(Object.keys(SCALES)).toHaveLength(10);
  });

  it('Major tiene los intervalos correctos', () => {
    expect(SCALES['Major']).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('Minor tiene los intervalos correctos', () => {
    expect(SCALES['Minor']).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it('Blues tiene 6 notas', () => {
    expect(SCALES['Blues']).toHaveLength(6);
  });

  it('Pentatonic Maj tiene 5 notas', () => {
    expect(SCALES['Pentatonic Maj']).toHaveLength(5);
  });
});

// ── getScale ──────────────────────────────────────────────────────────────────

describe('getScale()', () => {
  it('C Major retorna las 7 notas correctas', () => {
    expect(getScale('C', 'Major')).toEqual(['C','D','E','F','G','A','B']);
  });

  it('G Major contiene F#', () => {
    const scale = getScale('G', 'Major');
    expect(scale).toContain('F#');
    expect(scale).toHaveLength(7);
  });

  it('A Minor retorna las notas naturales', () => {
    expect(getScale('A', 'Minor')).toEqual(['A','B','C','D','E','F','G']);
  });

  it('D Dorian es correcto', () => {
    expect(getScale('D', 'Dorian')).toEqual(['D','E','F','G','A','B','C']);
  });

  it('C# Major funciona con sostenidos', () => {
    const scale = getScale('C#', 'Major');
    expect(scale).toHaveLength(7);
    expect(scale[0]).toBe('C#');
  });

  it('A# Blues funciona correctamente', () => {
    const scale = getScale('A#', 'Blues');
    expect(scale).toHaveLength(6);
  });

  it('Pentatonic Maj retorna 5 notas', () => {
    expect(getScale('C', 'Pentatonic Maj')).toHaveLength(5);
  });

  it('todas las escalas con root C retornan el número correcto de notas', () => {
    Object.entries(SCALES).forEach(([name, intervals]) => {
      const scale = getScale('C', name);
      expect(scale).toHaveLength(intervals.length);
    });
  });

  it('lanza error con nota inválida', () => {
    expect(() => getScale('X', 'Major')).toThrow('inválida');
  });

  it('lanza error con escala inválida', () => {
    expect(() => getScale('C', 'FakeScale')).toThrow('inválida');
  });

  it('el primer elemento siempre es la nota raíz', () => {
    const notes = ['C','D','E','F','G','A','B','C#','D#','F#','G#','A#'];
    notes.forEach((root) => {
      const scale = getScale(root, 'Major');
      expect(scale[0]).toBe(root);
    });
  });
});

// ── getDiatonic ───────────────────────────────────────────────────────────────

describe('getDiatonic()', () => {
  it('C Major tiene 7 acordes', () => {
    expect(getDiatonic('C', 'Major')).toHaveLength(7);
  });

  it('primer acorde de C Major es C maj', () => {
    const chords = getDiatonic('C', 'Major');
    expect(chords[0].root).toBe('C');
    expect(chords[0].quality).toBe('maj');
    expect(chords[0].roman).toBe('I');
  });

  it('segundo acorde de C Major es D min', () => {
    const chords = getDiatonic('C', 'Major');
    expect(chords[1].root).toBe('D');
    expect(chords[1].quality).toBe('min');
    expect(chords[1].roman).toBe('ii');
  });

  it('quinto acorde de C Major es G maj (V)', () => {
    const chords = getDiatonic('C', 'Major');
    expect(chords[4].root).toBe('G');
    expect(chords[4].quality).toBe('maj');
    expect(chords[4].roman).toBe('V');
  });

  it('cada acorde tiene notas, root, quality y roman', () => {
    const chords = getDiatonic('C', 'Major');
    chords.forEach((chord) => {
      expect(chord).toHaveProperty('root');
      expect(chord).toHaveProperty('quality');
      expect(chord).toHaveProperty('roman');
      expect(chord).toHaveProperty('notes');
      expect(Array.isArray(chord.notes)).toBe(true);
      expect(chord.notes.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('A Minor: primer acorde es Am', () => {
    const chords = getDiatonic('A', 'Minor');
    expect(chords[0].root).toBe('A');
    expect(chords[0].quality).toBe('min');
  });

  it('G Major funciona con escala con sostenidos', () => {
    const chords = getDiatonic('G', 'Major');
    expect(chords).toHaveLength(7);
    expect(chords[0].root).toBe('G');
  });

  it('Pentatonic Maj retorna acordes sin crash', () => {
    const chords = getDiatonic('C', 'Pentatonic Maj');
    expect(chords).toHaveLength(5);
  });
});

// ── noteFreq ──────────────────────────────────────────────────────────────────

describe('noteFreq()', () => {
  it('A4 = 440Hz exacto', () => {
    expect(noteFreq('A', 4)).toBe(440);
  });

  it('A5 = 880Hz (una octava arriba)', () => {
    expect(noteFreq('A', 5)).toBe(880);
  });

  it('A3 = 220Hz (una octava abajo)', () => {
    expect(noteFreq('A', 3)).toBe(220);
  });

  it('C4 ≈ 261.626Hz', () => {
    expect(noteFreq('C', 4)).toBeCloseTo(261.626, 2);
  });

  it('C5 ≈ 523.251Hz', () => {
    expect(noteFreq('C', 5)).toBeCloseTo(523.251, 2);
  });

  it('E4 ≈ 329.628Hz', () => {
    expect(noteFreq('E', 4)).toBeCloseTo(329.628, 2);
  });

  it('G4 ≈ 391.995Hz', () => {
    expect(noteFreq('G', 4)).toBeCloseTo(391.995, 2);
  });

  it('octava default es 4', () => {
    expect(noteFreq('A')).toBe(440);
  });

  it('frecuencia sube exactamente x2 por octava', () => {
    const freq4 = noteFreq('C', 4);
    const freq5 = noteFreq('C', 5);
    expect(freq5 / freq4).toBeCloseTo(2, 5);
  });

  it('lanza error con nota inválida', () => {
    expect(() => noteFreq('X', 4)).toThrow('inválida');
  });

  it('retorna número positivo para todas las notas en octava 4', () => {
    NOTES.forEach((note) => {
      expect(noteFreq(note, 4)).toBeGreaterThan(0);
    });
  });
});

// ── freqToNote ────────────────────────────────────────────────────────────────

describe('freqToNote()', () => {
  it('440Hz → A4', () => {
    expect(freqToNote(440)).toBe('A4');
  });

  it('880Hz → A5', () => {
    expect(freqToNote(880)).toBe('A5');
  });

  it('220Hz → A3', () => {
    expect(freqToNote(220)).toBe('A3');
  });

  it('261.63Hz → C4', () => {
    expect(freqToNote(261.63)).toBe('C4');
  });

  it('es inversa de noteFreq para todas las notas en octava 4', () => {
    NOTES.forEach((note) => {
      const freq = noteFreq(note, 4);
      const result = freqToNote(freq);
      expect(result).toBe(`${note}4`);
    });
  });

  it('lanza error con frecuencia 0', () => {
    expect(() => freqToNote(0)).toThrow();
  });

  it('lanza error con frecuencia negativa', () => {
    expect(() => freqToNote(-440)).toThrow();
  });

  it('lanza error sin argumento', () => {
    expect(() => freqToNote()).toThrow();
  });
});

// ── freqCents ─────────────────────────────────────────────────────────────────

describe('freqCents()', () => {
  it('frecuencia exacta → 0 cents', () => {
    expect(freqCents(440, 'A4')).toBeCloseTo(0, 5);
  });

  it('442Hz → ~+7.85 cents sobre A4', () => {
    expect(freqCents(442, 'A4')).toBeCloseTo(7.85, 1);
  });

  it('438Hz → ~-7.85 cents bajo A4', () => {
    expect(freqCents(438, 'A4')).toBeCloseTo(-7.85, 1);
  });

  it('un semitono arriba = +100 cents', () => {
    const a4   = noteFreq('A', 4);
    const as4  = noteFreq('A#', 4);
    expect(freqCents(as4, 'A4')).toBeCloseTo(100, 1);
  });

  it('una octava arriba = +1200 cents', () => {
    const a5 = noteFreq('A', 5);
    expect(freqCents(a5, 'A4')).toBeCloseTo(1200, 1);
  });

  it('lanza error con formato de nota inválido', () => {
    expect(() => freqCents(440, 'LA4')).toThrow();
  });

  it('funciona con notas sostenidas como C#4', () => {
    const freq = noteFreq('C#', 4);
    expect(freqCents(freq, 'C#4')).toBeCloseTo(0, 5);
  });
});

// ── getChordQuality ───────────────────────────────────────────────────────────

describe('getChordQuality()', () => {
  it('C-E-G → maj', () => {
    expect(getChordQuality(['C', 'E', 'G'])).toBe('maj');
  });

  it('A-C-E → min', () => {
    expect(getChordQuality(['A', 'C', 'E'])).toBe('min');
  });

  it('B-D-F → dim', () => {
    expect(getChordQuality(['B', 'D', 'F'])).toBe('dim');
  });

  it('C-E-G# → aug', () => {
    expect(getChordQuality(['C', 'E', 'G#'])).toBe('aug');
  });

  it('G-B-D → maj', () => {
    expect(getChordQuality(['G', 'B', 'D'])).toBe('maj');
  });

  it('D-F-A → min', () => {
    expect(getChordQuality(['D', 'F', 'A'])).toBe('min');
  });

  it('F-A-C → maj', () => {
    expect(getChordQuality(['F', 'A', 'C'])).toBe('maj');
  });

  it('retorna unknown con array vacío', () => {
    expect(getChordQuality([])).toBe('unknown');
  });

  it('retorna unknown con un solo elemento', () => {
    expect(getChordQuality(['C'])).toBe('unknown');
  });

  it('retorna unknown con notas inválidas', () => {
    expect(getChordQuality(['X', 'Y', 'Z'])).toBe('unknown');
  });

  it('retorna unknown con null', () => {
    expect(getChordQuality(null)).toBe('unknown');
  });

  it('funciona sin quinta (solo dos notas)', () => {
    const result = getChordQuality(['C', 'E']);
    expect(['maj', 'min', 'dim', 'aug', 'unknown']).toContain(result);
  });
});

// ── normalizeNote ─────────────────────────────────────────────────────────────

describe('normalizeNote()', () => {
  it('Db → C#', () => expect(normalizeNote('Db')).toBe('C#'));
  it('Eb → D#', () => expect(normalizeNote('Eb')).toBe('D#'));
  it('Gb → F#', () => expect(normalizeNote('Gb')).toBe('F#'));
  it('Ab → G#', () => expect(normalizeNote('Ab')).toBe('G#'));
  it('Bb → A#', () => expect(normalizeNote('Bb')).toBe('A#'));
  it('Fb → E',  () => expect(normalizeNote('Fb')).toBe('E'));
  it('Cb → B',  () => expect(normalizeNote('Cb')).toBe('B'));
  it('E# → F',  () => expect(normalizeNote('E#')).toBe('F'));
  it('B# → C',  () => expect(normalizeNote('B#')).toBe('C'));
  it('nota normal pasa sin cambio', () => expect(normalizeNote('C')).toBe('C'));
  it('sostenido pasa sin cambio', () => expect(normalizeNote('C#')).toBe('C#'));
});

// ── getScaleNames / getAllNotes ────────────────────────────────────────────────

describe('getScaleNames()', () => {
  it('retorna array de strings', () => {
    const names = getScaleNames();
    expect(Array.isArray(names)).toBe(true);
    names.forEach((n) => expect(typeof n).toBe('string'));
  });

  it('incluye Major y Minor', () => {
    const names = getScaleNames();
    expect(names).toContain('Major');
    expect(names).toContain('Minor');
  });

  it('tiene 10 escalas', () => {
    expect(getScaleNames()).toHaveLength(10);
  });
});

describe('getAllNotes()', () => {
  it('retorna copia de 12 notas', () => {
    const notes = getAllNotes();
    expect(notes).toHaveLength(12);
  });

  it('es una copia, no la referencia original', () => {
    const notes = getAllNotes();
    notes.push('X');
    expect(NOTES).toHaveLength(12); // original no mutado
  });
});
