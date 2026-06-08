/**
 * ProgressionEngine.test.js
 * Tests para src/core/ProgressionEngine.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CHORD_DURATIONS, DEFAULT_BEATS, MAX_CHORDS,
  generateChordId,
  createProgressionChord,
  addChord, removeChord, moveChord,
  setChordBeats, setChordOctave,
  duplicateChord, clearProgression, reverseProgression,
  totalBeats, totalDuration, getBeatOffsets, getChordAtBeat,
  toMidiFormat, serializeProgression, deserializeProgression,
  validateProgression, ProgressionPlayer,
} from '../../core/ProgressionEngine.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const cMaj = { root: 'C', quality: 'maj', roman: 'I',  notes: ['C','E','G'], degree: 0 };
const fMaj = { root: 'F', quality: 'maj', roman: 'IV', notes: ['F','A','C'], degree: 3 };
const gMaj = { root: 'G', quality: 'maj', roman: 'V',  notes: ['G','B','D'], degree: 4 };
const aMin = { root: 'A', quality: 'min', roman: 'vi', notes: ['A','C','E'], degree: 5 };

const mockAudio = {
  getContext: vi.fn(() => ({ currentTime: 0 })),
  playChord:  vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── generateChordId ───────────────────────────────────────────────────────────

describe('generateChordId()', () => {
  it('retorna string', () => expect(typeof generateChordId()).toBe('string'));
  it('empieza con chord_', () => expect(generateChordId()).toMatch(/^chord_/));
  it('genera IDs únicos', () => {
    const ids = new Set(Array.from({ length: 100 }, generateChordId));
    expect(ids.size).toBe(100);
  });
});

// ── createProgressionChord ────────────────────────────────────────────────────

describe('createProgressionChord()', () => {
  it('crea acorde con todas las propiedades', () => {
    const chord = createProgressionChord(cMaj);
    expect(chord).toHaveProperty('id');
    expect(chord).toHaveProperty('root', 'C');
    expect(chord).toHaveProperty('quality', 'maj');
    expect(chord).toHaveProperty('roman', 'I');
    expect(chord).toHaveProperty('notes');
    expect(chord).toHaveProperty('degree', 0);
    expect(chord).toHaveProperty('beats', DEFAULT_BEATS);
    expect(chord).toHaveProperty('octave', 4);
  });

  it('respeta beats personalizado', () => {
    const chord = createProgressionChord(cMaj, 2);
    expect(chord.beats).toBe(2);
  });

  it('beats inválido → DEFAULT_BEATS', () => {
    const chord = createProgressionChord(cMaj, 3);
    expect(chord.beats).toBe(DEFAULT_BEATS);
  });

  it('octave se clampea a 1-7', () => {
    expect(createProgressionChord(cMaj, 4, 0).octave).toBe(1);
    expect(createProgressionChord(cMaj, 4, 9).octave).toBe(7);
    expect(createProgressionChord(cMaj, 4, 4).octave).toBe(4);
  });

  it('notas son copia, no referencia', () => {
    const chord = createProgressionChord(cMaj);
    chord.notes.push('X');
    expect(cMaj.notes).toHaveLength(3);
  });
});

// ── addChord ──────────────────────────────────────────────────────────────────

describe('addChord()', () => {
  it('agrega acorde al final', () => {
    const prog = addChord([], cMaj);
    expect(prog).toHaveLength(1);
    expect(prog[0].root).toBe('C');
  });

  it('acumula acordes', () => {
    let prog = addChord([], cMaj);
    prog = addChord(prog, gMaj);
    expect(prog).toHaveLength(2);
  });

  it('no muta el original', () => {
    const orig = [];
    addChord(orig, cMaj);
    expect(orig).toHaveLength(0);
  });

  it('respeta MAX_CHORDS', () => {
    let prog = [];
    for (let i = 0; i < MAX_CHORDS; i++) prog = addChord(prog, cMaj);
    const after = addChord(prog, gMaj);
    expect(after).toHaveLength(MAX_CHORDS);
  });
});

// ── removeChord ───────────────────────────────────────────────────────────────

describe('removeChord()', () => {
  it('elimina acorde por ID', () => {
    let prog = addChord([], cMaj);
    const id = prog[0].id;
    prog = removeChord(prog, id);
    expect(prog).toHaveLength(0);
  });

  it('no afecta otros acordes', () => {
    let prog = addChord(addChord([], cMaj), gMaj);
    const id = prog[0].id;
    prog = removeChord(prog, id);
    expect(prog).toHaveLength(1);
    expect(prog[0].root).toBe('G');
  });

  it('ID inexistente → sin cambios', () => {
    const prog = addChord([], cMaj);
    expect(removeChord(prog, 'fake_id')).toHaveLength(1);
  });

  it('no muta el original', () => {
    const prog = addChord([], cMaj);
    const id   = prog[0].id;
    removeChord(prog, id);
    expect(prog).toHaveLength(1);
  });
});

// ── moveChord ─────────────────────────────────────────────────────────────────

describe('moveChord()', () => {
  let prog;
  beforeEach(() => {
    prog = addChord(addChord(addChord([], cMaj), fMaj), gMaj);
  });

  it('mueve de índice 0 a 2', () => {
    const next = moveChord(prog, 0, 2);
    expect(next[0].root).toBe('F');
    expect(next[1].root).toBe('G');
    expect(next[2].root).toBe('C');
  });

  it('mueve de índice 2 a 0', () => {
    const next = moveChord(prog, 2, 0);
    expect(next[0].root).toBe('G');
    expect(next[1].root).toBe('C');
    expect(next[2].root).toBe('F');
  });

  it('mismo índice → sin cambios', () => {
    expect(moveChord(prog, 1, 1)).toEqual(prog);
  });

  it('índice fuera de rango → sin cambios', () => {
    expect(moveChord(prog, -1, 0)).toEqual(prog);
    expect(moveChord(prog, 0, 99)).toEqual(prog);
  });

  it('no muta el original', () => {
    moveChord(prog, 0, 2);
    expect(prog[0].root).toBe('C');
  });
});

// ── setChordBeats ─────────────────────────────────────────────────────────────

describe('setChordBeats()', () => {
  it('actualiza duración', () => {
    const prog = addChord([], cMaj);
    const id   = prog[0].id;
    const next = setChordBeats(prog, id, 2);
    expect(next[0].beats).toBe(2);
  });

  it('beats inválido → sin cambios', () => {
    const prog = addChord([], cMaj);
    const id   = prog[0].id;
    expect(setChordBeats(prog, id, 3)[0].beats).toBe(DEFAULT_BEATS);
  });

  it('todos los valores de CHORD_DURATIONS son válidos', () => {
    CHORD_DURATIONS.forEach((beats) => {
      const prog = addChord([], cMaj);
      const next = setChordBeats(prog, prog[0].id, beats);
      expect(next[0].beats).toBe(beats);
    });
  });
});

// ── setChordOctave ────────────────────────────────────────────────────────────

describe('setChordOctave()', () => {
  it('actualiza octava', () => {
    const prog = addChord([], cMaj);
    const next = setChordOctave(prog, prog[0].id, 3);
    expect(next[0].octave).toBe(3);
  });

  it('clampea a mínimo 1', () => {
    const prog = addChord([], cMaj);
    expect(setChordOctave(prog, prog[0].id, 0)[0].octave).toBe(1);
  });

  it('clampea a máximo 7', () => {
    const prog = addChord([], cMaj);
    expect(setChordOctave(prog, prog[0].id, 9)[0].octave).toBe(7);
  });
});

// ── duplicateChord ────────────────────────────────────────────────────────────

describe('duplicateChord()', () => {
  it('duplica el acorde después del original', () => {
    const prog = addChord(addChord([], cMaj), gMaj);
    const id   = prog[0].id;
    const next = duplicateChord(prog, id);
    expect(next).toHaveLength(3);
    expect(next[0].root).toBe('C');
    expect(next[1].root).toBe('C');
    expect(next[2].root).toBe('G');
  });

  it('el duplicado tiene ID diferente', () => {
    const prog = addChord([], cMaj);
    const next = duplicateChord(prog, prog[0].id);
    expect(next[0].id).not.toBe(next[1].id);
  });

  it('respeta MAX_CHORDS', () => {
    let prog = [];
    for (let i = 0; i < MAX_CHORDS; i++) prog = addChord(prog, cMaj);
    const next = duplicateChord(prog, prog[0].id);
    expect(next).toHaveLength(MAX_CHORDS);
  });

  it('ID inexistente → sin cambios', () => {
    const prog = addChord([], cMaj);
    expect(duplicateChord(prog, 'fake')).toHaveLength(1);
  });
});

// ── clearProgression ──────────────────────────────────────────────────────────

describe('clearProgression()', () => {
  it('retorna array vacío', () => {
    expect(clearProgression()).toEqual([]);
  });
});

// ── reverseProgression ────────────────────────────────────────────────────────

describe('reverseProgression()', () => {
  it('invierte el orden', () => {
    let prog = addChord(addChord(addChord([], cMaj), fMaj), gMaj);
    const rev = reverseProgression(prog);
    expect(rev[0].root).toBe('G');
    expect(rev[1].root).toBe('F');
    expect(rev[2].root).toBe('C');
  });

  it('no muta el original', () => {
    const prog = addChord(addChord([], cMaj), gMaj);
    reverseProgression(prog);
    expect(prog[0].root).toBe('C');
  });

  it('progresión vacía → array vacío', () => {
    expect(reverseProgression([])).toEqual([]);
  });
});

// ── totalBeats ────────────────────────────────────────────────────────────────

describe('totalBeats()', () => {
  it('progresión vacía → 0', () => expect(totalBeats([])).toBe(0));

  it('suma los beats de todos los acordes', () => {
    let prog = addChord([], cMaj);           // 4 beats
    prog = setChordBeats(prog, prog[0].id, 4);
    prog = addChord(prog, gMaj);             // 4 beats
    prog = setChordBeats(prog, prog[1].id, 2);
    expect(totalBeats(prog)).toBe(6);
  });

  it('4 acordes de 4 beats = 16 beats', () => {
    let prog = [];
    [cMaj, fMaj, gMaj, aMin].forEach((c) => { prog = addChord(prog, c); });
    expect(totalBeats(prog)).toBe(16);
  });
});

// ── totalDuration ─────────────────────────────────────────────────────────────

describe('totalDuration()', () => {
  it('4 beats a 120 BPM = 2 segundos', () => {
    const prog = addChord([], cMaj); // 4 beats default
    expect(totalDuration(prog, 120)).toBeCloseTo(2, 5);
  });

  it('4 beats a 60 BPM = 4 segundos', () => {
    const prog = addChord([], cMaj);
    expect(totalDuration(prog, 60)).toBeCloseTo(4, 5);
  });

  it('BPM 0 → 0', () => {
    expect(totalDuration(addChord([], cMaj), 0)).toBe(0);
  });

  it('progresión vacía → 0', () => {
    expect(totalDuration([], 120)).toBe(0);
  });
});

// ── getBeatOffsets ────────────────────────────────────────────────────────────

describe('getBeatOffsets()', () => {
  it('progresión vacía → []', () => expect(getBeatOffsets([])).toEqual([]));

  it('un acorde → offset 0', () => {
    const prog = addChord([], cMaj);
    expect(getBeatOffsets(prog)).toEqual([0]);
  });

  it('calcula offsets acumulados correctamente', () => {
    let prog = addChord([], cMaj);              // beats=4
    prog = addChord(prog, fMaj);               // beats=4
    prog = setChordBeats(prog, prog[1].id, 2); // beats=2
    prog = addChord(prog, gMaj);               // beats=4
    const offsets = getBeatOffsets(prog);
    expect(offsets).toEqual([0, 4, 6]);
  });
});

// ── getChordAtBeat ────────────────────────────────────────────────────────────

describe('getChordAtBeat()', () => {
  let prog;
  beforeEach(() => {
    prog = addChord(addChord(addChord([], cMaj), fMaj), gMaj);
    // 3 acordes de 4 beats = 12 beats total
  });

  it('progresión vacía → null', () => {
    expect(getChordAtBeat([], 0)).toBeNull();
  });

  it('beat 0 → primer acorde', () => {
    expect(getChordAtBeat(prog, 0).chord.root).toBe('C');
  });

  it('beat 4 → segundo acorde', () => {
    expect(getChordAtBeat(prog, 4).chord.root).toBe('F');
  });

  it('beat 8 → tercer acorde', () => {
    expect(getChordAtBeat(prog, 8).chord.root).toBe('G');
  });

  it('loop: beat 12 → primer acorde (vuelta)', () => {
    expect(getChordAtBeat(prog, 12).chord.root).toBe('C');
  });

  it('retorna el índice correcto', () => {
    expect(getChordAtBeat(prog, 0).index).toBe(0);
    expect(getChordAtBeat(prog, 4).index).toBe(1);
    expect(getChordAtBeat(prog, 8).index).toBe(2);
  });
});

// ── toMidiFormat ──────────────────────────────────────────────────────────────

describe('toMidiFormat()', () => {
  it('retorna formato correcto para MidiExport', () => {
    const prog   = addChord([], cMaj);
    const result = toMidiFormat(prog);
    expect(result[0]).toHaveProperty('notes');
    expect(result[0]).toHaveProperty('octave');
    expect(result[0]).toHaveProperty('beats');
  });

  it('no incluye id ni degree', () => {
    const prog   = addChord([], cMaj);
    const result = toMidiFormat(prog);
    expect(result[0]).not.toHaveProperty('id');
    expect(result[0]).not.toHaveProperty('degree');
  });

  it('progresión vacía → []', () => {
    expect(toMidiFormat([])).toEqual([]);
  });
});

// ── serializeProgression / deserializeProgression ────────────────────────────

describe('serializeProgression() / deserializeProgression()', () => {
  it('round-trip preserva los datos', () => {
    const prog     = addChord(addChord([], cMaj), gMaj);
    const json     = serializeProgression(prog);
    const restored = deserializeProgression(json);
    expect(restored).toHaveLength(2);
    expect(restored[0].root).toBe('C');
    expect(restored[1].root).toBe('G');
  });

  it('JSON inválido lanza error', () => {
    expect(() => deserializeProgression('not json')).toThrow();
  });

  it('no array lanza error', () => {
    expect(() => deserializeProgression('"string"')).toThrow();
  });

  it('acorde sin root lanza error', () => {
    expect(() => deserializeProgression('[{"quality":"maj"}]')).toThrow();
  });

  it('genera nuevos IDs si faltan', () => {
    const json = JSON.stringify([{ root: 'C', notes: ['C','E','G'], beats: 4 }]);
    const prog = deserializeProgression(json);
    expect(prog[0].id).toBeDefined();
  });
});

// ── validateProgression ───────────────────────────────────────────────────────

describe('validateProgression()', () => {
  it('progresión válida → { valid: true, errors: [] }', () => {
    const prog   = addChord([], cMaj);
    const result = validateProgression(prog);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('progresión vacía → inválida', () => {
    expect(validateProgression([]).valid).toBe(false);
  });

  it('no array → inválido', () => {
    expect(validateProgression(null).valid).toBe(false);
    expect(validateProgression('string').valid).toBe(false);
  });

  it('acorde sin notas → error', () => {
    const chord = { ...createProgressionChord(cMaj), notes: [] };
    const result = validateProgression([chord]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ── ProgressionPlayer ─────────────────────────────────────────────────────────

describe('ProgressionPlayer', () => {
  let player;
  let prog;

  beforeEach(() => {
    player = new ProgressionPlayer(mockAudio);
    prog   = addChord(addChord(addChord([], cMaj), fMaj), gMaj);
    player.setProgression(prog);
    player.setBpm(120);
  });

  afterEach(() => {
    if (player.isPlaying()) player.stop();
  });

  describe('constructor', () => {
    it('crea instancia sin errores', () => {
      expect(() => new ProgressionPlayer(mockAudio)).not.toThrow();
    });
    it('no está reproduciendo al crear', () => {
      expect(player.isPlaying()).toBe(false);
    });
  });

  describe('setBpm()', () => {
    it('clampea a 60-180', () => {
      player.setBpm(30);
      expect(player._bpm).toBe(60);
      player.setBpm(300);
      expect(player._bpm).toBe(180);
    });
  });

  describe('play()', () => {
    it('inicia reproducción', () => {
      player.play();
      expect(player.isPlaying()).toBe(true);
    });

    it('progresión vacía no inicia', () => {
      player.setProgression([]);
      player.play();
      expect(player.isPlaying()).toBe(false);
    });

    it('llama onChord en el primer acorde', () => {
      const onChord = vi.fn();
      player.onChord = onChord;
      player.play();
      vi.advanceTimersByTime(50);
      expect(onChord).toHaveBeenCalledWith(0, expect.objectContaining({ root: 'C' }));
    });

    it('llama onChord en el segundo acorde después de 2 segundos (4 beats a 120 BPM)', () => {
      const onChord = vi.fn();
      player.onChord = onChord;
      player.play();
      vi.advanceTimersByTime(2100);
      expect(onChord).toHaveBeenCalledWith(1, expect.objectContaining({ root: 'F' }));
    });

    it('llama playChord en AudioEngine', () => {
      player.play();
      vi.advanceTimersByTime(50);
      expect(mockAudio.playChord).toHaveBeenCalled();
    });
  });

  describe('stop()', () => {
    it('detiene reproducción', () => {
      player.play();
      player.stop();
      expect(player.isPlaying()).toBe(false);
    });

    it('resetea índice a 0', () => {
      player.play();
      vi.advanceTimersByTime(2100);
      player.stop();
      expect(player.getCurrentIndex()).toBe(0);
    });

    it('cancela timers pendientes', () => {
      const onChord = vi.fn();
      player.onChord = onChord;
      player.play();
      player.stop();
      vi.advanceTimersByTime(10000);
      // Solo el primer acorde debería haberse llamado (el inmediato antes del stop)
      expect(onChord.mock.calls.length).toBeLessThanOrEqual(1);
    });
  });

  describe('onEnd callback', () => {
    it('se llama al terminar sin loop', () => {
      const onEnd = vi.fn();
      player.onEnd = onEnd;
      player.play();
      // 3 acordes × 4 beats × (60/120s) = 6 segundos
      vi.advanceTimersByTime(6100);
      expect(onEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('loop', () => {
    it('con loop=true no llama onEnd', () => {
      const onEnd = vi.fn();
      player.onEnd  = onEnd;
      player.setLoop(true);
      player.play();
      vi.advanceTimersByTime(6100);
      expect(onEnd).not.toHaveBeenCalled();
      player.stop();
    });
  });
});
