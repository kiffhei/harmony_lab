/**
 * SequencerEngine.test.js
 * Tests para src/core/SequencerEngine.js
 * El SequencerEngine y AudioEngine se mockean para tests sin Web Audio API.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  INSTRUMENTS, STEP_COUNT, INSTRUMENT_COUNT,
  createEmptyPattern, createDefaultPattern,
  clonePattern, toggleStep, setStep,
  clearInstrument, clearPattern,
  stepInterval, countActiveSteps, getActiveSteps,
  patternToMidiFormat, patternFromMidiFormat,
  clampBpm, SequencerEngine,
} from '../../core/SequencerEngine.js';

// ── Mock de AudioEngine ───────────────────────────────────────────────────────

const mockAudio = {
  getContext: vi.fn(() => ({ currentTime: 0, state: 'running', resume: vi.fn() })),
  drumKick:    vi.fn(),
  drumSnare:   vi.fn(),
  drumHiHat:   vi.fn(),
  drumClap:    vi.fn(),
  drumTom:     vi.fn(),
  drumShaker:  vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Constantes ────────────────────────────────────────────────────────────────

describe('Constantes', () => {
  it('INSTRUMENTS tiene 8 elementos', () => {
    expect(INSTRUMENTS).toHaveLength(8);
  });

  it('STEP_COUNT es 16', () => {
    expect(STEP_COUNT).toBe(16);
  });

  it('INSTRUMENT_COUNT es 8', () => {
    expect(INSTRUMENT_COUNT).toBe(8);
  });

  it('INSTRUMENTS incluye kick, snare, hh_c', () => {
    expect(INSTRUMENTS).toContain('kick');
    expect(INSTRUMENTS).toContain('snare');
    expect(INSTRUMENTS).toContain('hh_c');
  });
});

// ── createEmptyPattern ────────────────────────────────────────────────────────

describe('createEmptyPattern()', () => {
  it('retorna matriz de 8×16', () => {
    const p = createEmptyPattern();
    expect(p).toHaveLength(INSTRUMENT_COUNT);
    p.forEach((row) => expect(row).toHaveLength(STEP_COUNT));
  });

  it('todos los pasos están en false', () => {
    const p = createEmptyPattern();
    p.forEach((row) => row.forEach((step) => expect(step).toBe(false)));
  });

  it('retorna nueva instancia cada vez', () => {
    const a = createEmptyPattern();
    const b = createEmptyPattern();
    expect(a).not.toBe(b);
  });
});

// ── createDefaultPattern ──────────────────────────────────────────────────────

describe('createDefaultPattern()', () => {
  it('retorna matriz de 8×16', () => {
    const p = createDefaultPattern();
    expect(p).toHaveLength(INSTRUMENT_COUNT);
    p.forEach((row) => expect(row).toHaveLength(STEP_COUNT));
  });

  it('kick activo en pasos 0, 4, 8, 12', () => {
    const p = createDefaultPattern();
    const kickIdx = INSTRUMENTS.indexOf('kick');
    [0, 4, 8, 12].forEach((step) => expect(p[kickIdx][step]).toBe(true));
    [1, 2, 3, 5, 6, 7].forEach((step) => expect(p[kickIdx][step]).toBe(false));
  });

  it('snare activo en pasos 4 y 12', () => {
    const p = createDefaultPattern();
    const snareIdx = INSTRUMENTS.indexOf('snare');
    [4, 12].forEach((step) => expect(p[snareIdx][step]).toBe(true));
    [0, 8].forEach((step) => expect(p[snareIdx][step]).toBe(false));
  });

  it('hi-hat activo en pasos pares', () => {
    const p = createDefaultPattern();
    const hhIdx = INSTRUMENTS.indexOf('hh_c');
    [0, 2, 4, 6, 8, 10, 12, 14].forEach((step) =>
      expect(p[hhIdx][step]).toBe(true)
    );
  });

  it('tiene pasos activos', () => {
    expect(countActiveSteps(createDefaultPattern())).toBeGreaterThan(0);
  });
});

// ── clonePattern ──────────────────────────────────────────────────────────────

describe('clonePattern()', () => {
  it('retorna nueva referencia', () => {
    const p = createDefaultPattern();
    const c = clonePattern(p);
    expect(c).not.toBe(p);
  });

  it('los valores son iguales', () => {
    const p = createDefaultPattern();
    const c = clonePattern(p);
    expect(c).toEqual(p);
  });

  it('modificar el clon no afecta el original', () => {
    const p = createEmptyPattern();
    const c = clonePattern(p);
    c[0][0] = true;
    expect(p[0][0]).toBe(false);
  });
});

// ── toggleStep ────────────────────────────────────────────────────────────────

describe('toggleStep()', () => {
  it('activa un paso inactivo', () => {
    const p = createEmptyPattern();
    const next = toggleStep(p, 0, 0);
    expect(next[0][0]).toBe(true);
  });

  it('desactiva un paso activo', () => {
    let p = createEmptyPattern();
    p = toggleStep(p, 0, 0);
    p = toggleStep(p, 0, 0);
    expect(p[0][0]).toBe(false);
  });

  it('no muta el patrón original', () => {
    const p = createEmptyPattern();
    toggleStep(p, 0, 0);
    expect(p[0][0]).toBe(false);
  });

  it('solo afecta el paso indicado', () => {
    const p = createEmptyPattern();
    const next = toggleStep(p, 0, 3);
    expect(next[0][3]).toBe(true);
    expect(next[0][0]).toBe(false);
    expect(next[1][3]).toBe(false);
  });
});

// ── setStep ───────────────────────────────────────────────────────────────────

describe('setStep()', () => {
  it('establece true en un paso', () => {
    const p = createEmptyPattern();
    const next = setStep(p, 0, 5, true);
    expect(next[0][5]).toBe(true);
  });

  it('establece false en un paso activo', () => {
    let p = createEmptyPattern();
    p = setStep(p, 0, 5, true);
    p = setStep(p, 0, 5, false);
    expect(p[0][5]).toBe(false);
  });

  it('no muta el original', () => {
    const p = createEmptyPattern();
    setStep(p, 0, 0, true);
    expect(p[0][0]).toBe(false);
  });
});

// ── clearInstrument ───────────────────────────────────────────────────────────

describe('clearInstrument()', () => {
  it('limpia todos los pasos de un instrumento', () => {
    const p = createDefaultPattern();
    const kickIdx = INSTRUMENTS.indexOf('kick');
    const next = clearInstrument(p, kickIdx);
    next[kickIdx].forEach((step) => expect(step).toBe(false));
  });

  it('no afecta otros instrumentos', () => {
    const p = createDefaultPattern();
    const kickIdx  = INSTRUMENTS.indexOf('kick');
    const snareIdx = INSTRUMENTS.indexOf('snare');
    const next = clearInstrument(p, kickIdx);
    expect(next[snareIdx]).toEqual(p[snareIdx]);
  });

  it('no muta el original', () => {
    const p = createDefaultPattern();
    const kickIdx = INSTRUMENTS.indexOf('kick');
    clearInstrument(p, kickIdx);
    expect(p[kickIdx][0]).toBe(true);
  });
});

// ── clearPattern ──────────────────────────────────────────────────────────────

describe('clearPattern()', () => {
  it('retorna patrón completamente vacío', () => {
    const p = createDefaultPattern();
    const next = clearPattern(p);
    next.forEach((row) => row.forEach((s) => expect(s).toBe(false)));
  });

  it('no muta el original', () => {
    const p = createDefaultPattern();
    clearPattern(p);
    expect(countActiveSteps(p)).toBeGreaterThan(0);
  });
});

// ── stepInterval ──────────────────────────────────────────────────────────────

describe('stepInterval()', () => {
  it('120 BPM → 0.125 segundos por paso', () => {
    expect(stepInterval(120)).toBeCloseTo(0.125, 5);
  });

  it('60 BPM → 0.25 segundos por paso', () => {
    expect(stepInterval(60)).toBeCloseTo(0.25, 5);
  });

  it('180 BPM → ~0.0833 segundos por paso', () => {
    expect(stepInterval(180)).toBeCloseTo(0.0833, 3);
  });

  it('mayor BPM → menor intervalo', () => {
    expect(stepInterval(180)).toBeLessThan(stepInterval(120));
    expect(stepInterval(120)).toBeLessThan(stepInterval(60));
  });
});

// ── countActiveSteps ──────────────────────────────────────────────────────────

describe('countActiveSteps()', () => {
  it('patrón vacío → 0', () => {
    expect(countActiveSteps(createEmptyPattern())).toBe(0);
  });

  it('patrón default → > 0', () => {
    expect(countActiveSteps(createDefaultPattern())).toBeGreaterThan(0);
  });

  it('cuenta correctamente pasos activos', () => {
    let p = createEmptyPattern();
    p = setStep(p, 0, 0, true);
    p = setStep(p, 0, 4, true);
    p = setStep(p, 1, 2, true);
    expect(countActiveSteps(p)).toBe(3);
  });
});

// ── getActiveSteps ────────────────────────────────────────────────────────────

describe('getActiveSteps()', () => {
  it('patrón vacío → array vacío', () => {
    expect(getActiveSteps(createEmptyPattern(), 0)).toEqual([]);
  });

  it('retorna índices correctos', () => {
    let p = createEmptyPattern();
    p = setStep(p, 0, 0, true);
    p = setStep(p, 0, 8, true);
    p = setStep(p, 0, 15, true);
    expect(getActiveSteps(p, 0)).toEqual([0, 8, 15]);
  });

  it('kick en patrón default tiene pasos 0, 4, 8, 12', () => {
    const p = createDefaultPattern();
    const kickIdx = INSTRUMENTS.indexOf('kick');
    expect(getActiveSteps(p, kickIdx)).toEqual([0, 4, 8, 12]);
  });
});

// ── patternToMidiFormat / patternFromMidiFormat ───────────────────────────────

describe('patternToMidiFormat()', () => {
  it('retorna objeto con claves = nombres de instrumentos', () => {
    const result = patternToMidiFormat(createEmptyPattern());
    INSTRUMENTS.forEach((name) => expect(result).toHaveProperty(name));
  });

  it('cada valor es array de 16 booleanos', () => {
    const result = patternToMidiFormat(createEmptyPattern());
    Object.values(result).forEach((steps) => {
      expect(steps).toHaveLength(STEP_COUNT);
    });
  });

  it('es inversa de patternFromMidiFormat', () => {
    const original = createDefaultPattern();
    const midi     = patternToMidiFormat(original);
    const restored = patternFromMidiFormat(midi);
    expect(restored).toEqual(original);
  });
});

describe('patternFromMidiFormat()', () => {
  it('rellena con false instrumentos faltantes', () => {
    const result = patternFromMidiFormat({ kick: Array(16).fill(true) });
    const snareIdx = INSTRUMENTS.indexOf('snare');
    result[snareIdx].forEach((s) => expect(s).toBe(false));
  });

  it('retorna matriz de 8×16', () => {
    const result = patternFromMidiFormat({});
    expect(result).toHaveLength(INSTRUMENT_COUNT);
    result.forEach((row) => expect(row).toHaveLength(STEP_COUNT));
  });
});

// ── clampBpm ──────────────────────────────────────────────────────────────────

describe('clampBpm()', () => {
  it('valor dentro del rango pasa sin cambio', () => {
    expect(clampBpm(120)).toBe(120);
    expect(clampBpm(60)).toBe(60);
    expect(clampBpm(180)).toBe(180);
  });

  it('valor menor a 60 → 60', () => {
    expect(clampBpm(30)).toBe(60);
    expect(clampBpm(0)).toBe(60);
  });

  it('valor mayor a 180 → 180', () => {
    expect(clampBpm(200)).toBe(180);
    expect(clampBpm(999)).toBe(180);
  });

  it('redondea decimales', () => {
    expect(clampBpm(120.7)).toBe(121);
    expect(clampBpm(119.2)).toBe(119);
  });
});

// ── SequencerEngine ───────────────────────────────────────────────────────────

describe('SequencerEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SequencerEngine(mockAudio);
  });

  afterEach(() => {
    if (engine.isPlaying()) engine.stop();
  });

  describe('constructor', () => {
    it('crea instancia sin errores', () => {
      expect(() => new SequencerEngine(mockAudio)).not.toThrow();
    });

    it('BPM default es 120', () => {
      expect(engine.getBpm()).toBe(120);
    });

    it('no está reproduciendo al crear', () => {
      expect(engine.isPlaying()).toBe(false);
    });

    it('paso actual es 0', () => {
      expect(engine.getCurrentStep()).toBe(0);
    });
  });

  describe('setBpm() / getBpm()', () => {
    it('actualiza el BPM', () => {
      engine.setBpm(140);
      expect(engine.getBpm()).toBe(140);
    });

    it('clampea a 60 mínimo', () => {
      engine.setBpm(30);
      expect(engine.getBpm()).toBe(60);
    });

    it('clampea a 180 máximo', () => {
      engine.setBpm(300);
      expect(engine.getBpm()).toBe(180);
    });
  });

  describe('setPattern() / getPattern()', () => {
    it('guarda el patrón', () => {
      const p = createDefaultPattern();
      engine.setPattern(p);
      expect(engine.getPattern()).toEqual(p);
    });

    it('getPattern() retorna copia, no referencia', () => {
      const p = createDefaultPattern();
      engine.setPattern(p);
      const got = engine.getPattern();
      expect(got).not.toBe(p);
    });

    it('modificar el patrón externo no afecta el engine', () => {
      const p = createEmptyPattern();
      engine.setPattern(p);
      p[0][0] = true;
      expect(engine.getPattern()[0][0]).toBe(false);
    });
  });

  describe('start() / stop() / toggle()', () => {
    it('start() inicia la reproducción', () => {
      engine.start();
      expect(engine.isPlaying()).toBe(true);
      engine.stop();
    });

    it('stop() detiene la reproducción', () => {
      engine.start();
      engine.stop();
      expect(engine.isPlaying()).toBe(false);
    });

    it('stop() resetea al paso 0', () => {
      engine.start();
      engine.stop();
      expect(engine.getCurrentStep()).toBe(0);
    });

    it('start() doble no lanza error', () => {
      engine.start();
      expect(() => engine.start()).not.toThrow();
      engine.stop();
    });

    it('stop() doble no lanza error', () => {
      engine.start();
      engine.stop();
      expect(() => engine.stop()).not.toThrow();
    });

    it('toggle() arranca si está parado', () => {
      engine.toggle();
      expect(engine.isPlaying()).toBe(true);
      engine.stop();
    });

    it('toggle() para si está corriendo', () => {
      engine.start();
      engine.toggle();
      expect(engine.isPlaying()).toBe(false);
    });

    it('stop() llama onStop callback', () => {
      const onStop = vi.fn();
      engine.onStop = onStop;
      engine.start();
      engine.stop();
      expect(onStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('onStep callback', () => {
    it('se llama cuando hay pasos en el scheduler', () => {
      const onStep = vi.fn();
      engine.onStep = onStep;
      engine.setPattern(createDefaultPattern());
      engine.start();
      // Avanzar timers para disparar el scheduler
      vi.advanceTimersByTime(500);
      engine.stop();
      // onStep debe haberse llamado al menos una vez
      expect(onStep).toHaveBeenCalled();
    });

    it('el argumento es un número de paso válido', () => {
      const steps = [];
      engine.onStep = (s) => steps.push(s);
      engine.setPattern(createDefaultPattern());
      engine.start();
      vi.advanceTimersByTime(500);
      engine.stop();
      steps.forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThan(STEP_COUNT);
      });
    });
  });
});
