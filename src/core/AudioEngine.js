/**
 * AudioEngine.js — Harmony Lab Pro
 * Singleton Web Audio API. Sin librerías externas.
 * IMPORTANTE: getContext() debe llamarse SOLO tras un gesto del usuario.
 */

import { noteFreq } from './MusicTheory.js';

export class AudioEngine {
  constructor() {
    /** @type {AudioContext|null} */
    this._ctx = null;
    /** @type {GainNode|null} */
    this._master = null;
    /** @type {number} Volumen maestro 0-1 */
    this._volume = 0.7;
    /** @type {AudioNode[]} Nodos activos para stopAll() */
    this._active = [];
  }

  // ── Contexto ──────────────────────────────────────────────────────────────

  /**
   * Lazy init del AudioContext. Llama SOLO desde event handlers.
   * @returns {AudioContext}
   */
  getContext() {
    if (!this._ctx) {
      this._ctx    = new (window.AudioContext || window.webkitAudioContext)();
      this._master = this._ctx.createGain();
      this._master.gain.value = this._volume;
      this._master.connect(this._ctx.destination);
    }
    // Reanudar si el browser suspendió el contexto
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  // ── Tono simple ───────────────────────────────────────────────────────────

  /**
   * Reproduce un tono simple.
   * @param {number} freq       - Frecuencia en Hz
   * @param {number} [dur=0.3]  - Duración en segundos
   * @param {OscillatorType} [type='sine'] - Tipo de onda
   * @param {number} [vol=0.5]  - Volumen 0-1
   */
  playTone(freq, dur = 0.3, type = 'sine', vol = 0.5) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type      = type;
    osc.frequency.setValueAtTime(freq, now);

    // Envelope ADSR simple
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this._master);

    osc.start(now);
    osc.stop(now + dur + 0.05);

    this._active.push(osc);
    osc.onended = () => {
      this._active = this._active.filter((n) => n !== osc);
    };
  }

  // ── Acorde ────────────────────────────────────────────────────────────────

  /**
   * Reproduce un acorde (varias notas simultáneas).
   * @param {string[]} notes  - Array de notas, ej: ['C', 'E', 'G']
   * @param {number} [octave=4]
   */
  playChord(notes, octave = 4) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    notes.forEach((note, i) => {
      try {
        const freq  = noteFreq(note, octave);
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        const dur   = 1.2;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Ligero stagger para dar cuerpo al acorde (arpeggio sutil)
        const t = now + i * 0.015;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(this._master);
        osc.start(t);
        osc.stop(t + dur + 0.1);

        this._active.push(osc);
        osc.onended = () => {
          this._active = this._active.filter((n) => n !== osc);
        };
      } catch (_) {
        // Nota inválida — ignorar silenciosamente
      }
    });
  }

  // ── Drum synthesizers ─────────────────────────────────────────────────────

  /**
   * Kick — sweep oscilador 160Hz → ~0.5Hz en 450ms.
   */
  drumKick() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(0.5, now + 0.45);

    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this._master);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Snare — noise + highpass 900Hz.
   */
  drumSnare() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const noise    = this._createNoise(0.2);
    const highpass = ctx.createBiquadFilter();
    const gain     = ctx.createGain();

    highpass.type            = 'highpass';
    highpass.frequency.value = 900;

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this._master);
    noise.start(now);
    noise.stop(now + 0.25);
  }

  /**
   * Hi-hat — noise + highpass.
   * @param {boolean} [open=false] - true = open hi-hat (más largo)
   */
  drumHiHat(open = false) {
    const ctx   = this.getContext();
    const now   = ctx.currentTime;
    const dur   = open ? 0.35 : 0.08;
    const hpFreq = open ? 7000 : 8000;

    const noise    = this._createNoise(dur);
    const highpass = ctx.createBiquadFilter();
    const gain     = ctx.createGain();

    highpass.type            = 'highpass';
    highpass.frequency.value = hpFreq;

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this._master);
    noise.start(now);
    noise.stop(now + dur + 0.02);
  }

  /**
   * Clap — noise + highpass 1500Hz, doble disparo para simular transitorios.
   */
  drumClap() {
    const ctx = this.getContext();
    // Doble disparo: 0ms + 15ms
    [0, 0.015].forEach((offset) => {
      const now      = ctx.currentTime + offset;
      const noise    = this._createNoise(0.1);
      const highpass = ctx.createBiquadFilter();
      const gain     = ctx.createGain();

      highpass.type            = 'highpass';
      highpass.frequency.value = 1500;

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      noise.connect(highpass);
      highpass.connect(gain);
      gain.connect(this._master);
      noise.start(now);
      noise.stop(now + 0.12);
    });
  }

  /**
   * Tom — noise + highpass con frecuencia variable.
   * @param {number} [freq=200] - Frecuencia del highpass
   */
  drumTom(freq = 200) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const noise    = this._createNoise(0.3);
    const highpass = ctx.createBiquadFilter();
    const osc      = ctx.createOscillator();
    const gainN    = ctx.createGain();
    const gainO    = ctx.createGain();

    highpass.type            = 'highpass';
    highpass.frequency.value = freq;

    osc.frequency.setValueAtTime(freq * 0.8, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.3);

    gainN.gain.setValueAtTime(0.5, now);
    gainN.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    gainO.gain.setValueAtTime(0.6, now);
    gainO.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(highpass);
    highpass.connect(gainN);
    gainN.connect(this._master);

    osc.connect(gainO);
    gainO.connect(this._master);

    noise.start(now);
    noise.stop(now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Rimshot — noise corto + highpass agudo + un "tick" de definición.
   */
  drumRimshot() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const noise    = this._createNoise(0.06);
    const highpass = ctx.createBiquadFilter();
    const gainN    = ctx.createGain();

    highpass.type            = 'highpass';
    highpass.frequency.value = 2000;

    gainN.gain.setValueAtTime(0.6, now);
    gainN.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(highpass);
    highpass.connect(gainN);
    gainN.connect(this._master);
    noise.start(now);
    noise.stop(now + 0.07);

    // Tick — define el ataque metálico del aro
    const tick     = ctx.createOscillator();
    const gainTick = ctx.createGain();

    tick.type = 'triangle';
    tick.frequency.setValueAtTime(800, now);

    gainTick.gain.setValueAtTime(0.4, now);
    gainTick.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    tick.connect(gainTick);
    gainTick.connect(this._master);
    tick.start(now);
    tick.stop(now + 0.04);
  }

  /**
   * Cowbell — dos osciladores cuadrados (tonos clásicos ~587Hz/845Hz)
   * a través de un bandpass, decay corto.
   */
  drumCowbell() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type            = 'bandpass';
    bandpass.frequency.value = 800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    [587, 845].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(bandpass);
      osc.start(now);
      osc.stop(now + 0.3);
    });

    bandpass.connect(gain);
    gain.connect(this._master);
  }

  /**
   * Cymbal (crash) — noise largo + highpass muy agudo, decay lento.
   */
  drumCymbal() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const dur = 1.5;

    const noise    = this._createNoise(dur);
    const highpass = ctx.createBiquadFilter();
    const gain     = ctx.createGain();

    highpass.type            = 'highpass';
    highpass.frequency.value = 5000;

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this._master);
    noise.start(now);
    noise.stop(now + dur + 0.05);
  }

  /**
   * Shaker — noise + highpass 6000Hz, muy corto.
   */
  drumShaker() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const noise    = this._createNoise(0.05);
    const highpass = ctx.createBiquadFilter();
    const gain     = ctx.createGain();

    highpass.type            = 'highpass';
    highpass.frequency.value = 6000;

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this._master);
    noise.start(now);
    noise.stop(now + 0.07);
  }

  // ── Control de volumen ────────────────────────────────────────────────────

  /**
   * @param {number} val - 0 a 1
   */
  setMasterVolume(val) {
    this._volume = Math.min(1, Math.max(0, val));
    if (this._master) {
      this._master.gain.setValueAtTime(this._volume, this._ctx.currentTime);
    }
  }

  /**
   * Para todos los osciladores activos.
   */
  stopAll() {
    this._active.forEach((node) => {
      try { node.stop(); } catch (_) {}
    });
    this._active = [];
  }

  // ── Utilidades privadas ───────────────────────────────────────────────────

  /**
   * Crea un nodo AudioBufferSourceNode con ruido blanco.
   * @param {number} duration - Duración en segundos
   * @returns {AudioBufferSourceNode}
   */
  _createNoise(duration) {
    const ctx        = this.getContext();
    const sampleRate = ctx.sampleRate;
    const length     = Math.ceil(sampleRate * duration);
    const buffer     = ctx.createBuffer(1, length, sampleRate);
    const data       = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }
}
