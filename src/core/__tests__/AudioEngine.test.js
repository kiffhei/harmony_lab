/**
 * AudioEngine.test.js
 * Tests para src/core/AudioEngine.js
 * Web Audio API se mockea completamente — no hay contexto de browser en Vitest/jsdom.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from '../../core/AudioEngine.js';

// ── Mock de Web Audio API ─────────────────────────────────────────────────────

const mockOscillator = {
  type: 'sine',
  frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null,
};

const mockGain = {
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockFilter = {
  type: 'highpass',
  frequency: { value: 0 },
  connect: vi.fn(),
};

const mockBuffer = {
  getChannelData: vi.fn(() => new Float32Array(100)),
};

const mockBufferSource = {
  buffer: null,
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockContext = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  destination: {},
  resume: vi.fn(),
  createOscillator: vi.fn(() => ({ ...mockOscillator, onended: null })),
  createGain: vi.fn(() => ({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  })),
  createBiquadFilter: vi.fn(() => ({ ...mockFilter })),
  createBuffer: vi.fn(() => ({ ...mockBuffer })),
  createBufferSource: vi.fn(() => ({ ...mockBufferSource })),
};

// ── Setup global ──────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Inyectar AudioContext en global
  global.AudioContext = vi.fn(() => mockContext);
  global.webkitAudioContext = undefined;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AudioEngine', () => {
  describe('constructor', () => {
    it('crea instancia sin errores', () => {
      expect(() => new AudioEngine()).not.toThrow();
    });

    it('_ctx es null antes de getContext()', () => {
      const engine = new AudioEngine();
      expect(engine._ctx).toBeNull();
    });

    it('volumen default es 0.7', () => {
      const engine = new AudioEngine();
      expect(engine._volume).toBe(0.7);
    });
  });

  describe('getContext()', () => {
    it('crea AudioContext en el primer llamado', () => {
      const engine = new AudioEngine();
      engine.getContext();
      expect(global.AudioContext).toHaveBeenCalledTimes(1);
    });

    it('reutiliza el contexto en llamados subsecuentes (singleton)', () => {
      const engine = new AudioEngine();
      engine.getContext();
      engine.getContext();
      engine.getContext();
      expect(global.AudioContext).toHaveBeenCalledTimes(1);
    });

    it('retorna el contexto', () => {
      const engine = new AudioEngine();
      const ctx = engine.getContext();
      expect(ctx).toBe(mockContext);
    });

    it('llama resume() si el contexto está suspendido', () => {
      mockContext.state = 'suspended';
      const engine = new AudioEngine();
      engine.getContext();
      expect(mockContext.resume).toHaveBeenCalled();
      mockContext.state = 'running';
    });

    it('usa webkitAudioContext como fallback', () => {
      global.AudioContext    = undefined;
      global.webkitAudioContext = vi.fn(() => mockContext);
      const engine = new AudioEngine();
      engine.getContext();
      expect(global.webkitAudioContext).toHaveBeenCalled();
    });
  });

  describe('playTone()', () => {
    it('crea oscilador y gain sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.playTone(440, 0.3, 'sine', 0.5)).not.toThrow();
    });

    it('llama a createOscillator y createGain', () => {
      const engine = new AudioEngine();
      engine.playTone(440, 0.3);
      expect(mockContext.createOscillator).toHaveBeenCalled();
      expect(mockContext.createGain).toHaveBeenCalled();
    });

    it('usa valores default correctamente', () => {
      const engine = new AudioEngine();
      expect(() => engine.playTone(440)).not.toThrow();
    });
  });

  describe('playChord()', () => {
    it('reproduce acordes de C Major sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.playChord(['C', 'E', 'G'], 4)).not.toThrow();
    });

    it('ignora notas inválidas sin lanzar error', () => {
      const engine = new AudioEngine();
      expect(() => engine.playChord(['C', 'INVALID', 'G'], 4)).not.toThrow();
    });

    it('crea un oscilador por nota válida', () => {
      const engine = new AudioEngine();
      engine.playChord(['C', 'E', 'G'], 4);
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('usa octava default 4', () => {
      const engine = new AudioEngine();
      expect(() => engine.playChord(['A', 'C', 'E'])).not.toThrow();
    });
  });

  describe('drumKick()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumKick()).not.toThrow();
    });

    it('crea oscilador', () => {
      const engine = new AudioEngine();
      engine.drumKick();
      expect(mockContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('drumSnare()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumSnare()).not.toThrow();
    });

    it('crea filtro highpass', () => {
      const engine = new AudioEngine();
      engine.drumSnare();
      expect(mockContext.createBiquadFilter).toHaveBeenCalled();
    });
  });

  describe('drumHiHat()', () => {
    it('hi-hat cerrado sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumHiHat(false)).not.toThrow();
    });

    it('hi-hat abierto sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumHiHat(true)).not.toThrow();
    });

    it('default es cerrado', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumHiHat()).not.toThrow();
    });
  });

  describe('drumClap()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumClap()).not.toThrow();
    });

    it('crea doble disparo (2 buffer sources)', () => {
      const engine = new AudioEngine();
      engine.drumClap();
      expect(mockContext.createBufferSource).toHaveBeenCalledTimes(2);
    });
  });

  describe('drumTom()', () => {
    it('ejecuta con frecuencia default', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumTom()).not.toThrow();
    });

    it('ejecuta con frecuencia personalizada', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumTom(300)).not.toThrow();
    });
  });

  describe('drumShaker()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumShaker()).not.toThrow();
    });
  });

  describe('drumRimshot()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumRimshot()).not.toThrow();
    });

    it('crea un buffer de noise y un oscilador de "tick"', () => {
      const engine = new AudioEngine();
      engine.drumRimshot();
      expect(mockContext.createBufferSource).toHaveBeenCalled();
      expect(mockContext.createOscillator).toHaveBeenCalled();
    });

    it('crea filtro highpass', () => {
      const engine = new AudioEngine();
      engine.drumRimshot();
      expect(mockContext.createBiquadFilter).toHaveBeenCalled();
    });
  });

  describe('drumCowbell()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumCowbell()).not.toThrow();
    });

    it('crea dos osciladores (tonos clásicos de cowbell)', () => {
      const engine = new AudioEngine();
      engine.drumCowbell();
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(2);
    });

    it('crea filtro bandpass', () => {
      const engine = new AudioEngine();
      engine.drumCowbell();
      expect(mockContext.createBiquadFilter).toHaveBeenCalled();
    });
  });

  describe('drumCymbal()', () => {
    it('ejecuta sin errores', () => {
      const engine = new AudioEngine();
      expect(() => engine.drumCymbal()).not.toThrow();
    });

    it('crea buffer de noise y filtro highpass', () => {
      const engine = new AudioEngine();
      engine.drumCymbal();
      expect(mockContext.createBufferSource).toHaveBeenCalled();
      expect(mockContext.createBiquadFilter).toHaveBeenCalled();
    });
  });

  describe('setMasterVolume()', () => {
    it('actualiza _volume', () => {
      const engine = new AudioEngine();
      engine.getContext(); // init
      engine.setMasterVolume(0.5);
      expect(engine._volume).toBe(0.5);
    });

    it('clampea a 0 si es negativo', () => {
      const engine = new AudioEngine();
      engine.getContext();
      engine.setMasterVolume(-1);
      expect(engine._volume).toBe(0);
    });

    it('clampea a 1 si es mayor que 1', () => {
      const engine = new AudioEngine();
      engine.getContext();
      engine.setMasterVolume(2);
      expect(engine._volume).toBe(1);
    });

    it('funciona sin contexto inicializado', () => {
      const engine = new AudioEngine();
      expect(() => engine.setMasterVolume(0.3)).not.toThrow();
    });
  });

  describe('stopAll()', () => {
    it('no lanza error con lista vacía', () => {
      const engine = new AudioEngine();
      expect(() => engine.stopAll()).not.toThrow();
    });

    it('vacía el array _active', () => {
      const engine = new AudioEngine();
      engine._active = [
        { stop: vi.fn() },
        { stop: vi.fn() },
      ];
      engine.stopAll();
      expect(engine._active).toHaveLength(0);
    });

    it('llama stop() en cada nodo activo', () => {
      const engine  = new AudioEngine();
      const node1   = { stop: vi.fn() };
      const node2   = { stop: vi.fn() };
      engine._active = [node1, node2];
      engine.stopAll();
      expect(node1.stop).toHaveBeenCalled();
      expect(node2.stop).toHaveBeenCalled();
    });

    it('ignora errores en stop() individual', () => {
      const engine = new AudioEngine();
      engine._active = [{ stop: vi.fn(() => { throw new Error('already stopped'); }) }];
      expect(() => engine.stopAll()).not.toThrow();
    });
  });
});
