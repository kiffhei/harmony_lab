/**
 * SequencerEngine.js — Harmony Lab Pro
 * Motor de secuenciación rítmica con lookahead scheduler.
 *
 * Arquitectura basada en el patrón de Chris Wilson (WebAudio scheduling):
 * https://www.html5rocks.com/en/tutorials/audio/scheduling/
 *
 * El scheduler corre en un setInterval de alta frecuencia y schedula
 * eventos de audio con tiempo absoluto (AudioContext.currentTime) para
 * evitar drift y garantizar precisión rítmica.
 *
 * Separación de responsabilidades:
 *   - SequencerEngine: scheduling, estado de pasos, BPM, loop
 *   - AudioEngine: síntesis de sonido (ya implementado)
 *   - useSequencer hook: conecta el engine con React/MusicContext
 */

/** Instrumentos disponibles en el orden del grid */
export const INSTRUMENTS = [
  'kick', 'snare', 'hh_c', 'hh_o', 'clap',
  'tom_hi', 'tom_mid', 'tom_lo', 'shaker',
  'rimshot', 'cowbell', 'cymbal',
];

/** Número de pasos default por patrón (configurable por patrón) */
export const STEP_COUNT = 16;

/** Número de instrumentos */
export const INSTRUMENT_COUNT = INSTRUMENTS.length;

/**
 * Crea un patrón vacío de N pasos × INSTRUMENT_COUNT instrumentos.
 * @param {number} [steps=STEP_COUNT]
 * @returns {boolean[][]} matriz [instrumento][paso]
 */
export function createEmptyPattern(steps = STEP_COUNT) {
  return Array.from({ length: INSTRUMENT_COUNT }, () =>
    Array(steps).fill(false)
  );
}

/**
 * Crea un patrón con preset básico de kick en los 4 beats del compás.
 * Las posiciones escalan proporcionalmente a `steps` (steps/4 por beat).
 * @param {number} [steps=STEP_COUNT]
 * @returns {boolean[][]}
 */
export function createDefaultPattern(steps = STEP_COUNT) {
  const pattern = createEmptyPattern(steps);
  const beatStep = steps / 4;
  const beats = [0, 1, 2, 3].map((i) => Math.round(i * beatStep));

  const kickIdx = INSTRUMENTS.indexOf('kick');
  beats.forEach((step) => { pattern[kickIdx][step] = true; });

  const snareIdx = INSTRUMENTS.indexOf('snare');
  [beats[1], beats[3]].forEach((step) => { pattern[snareIdx][step] = true; });

  const hhIdx = INSTRUMENTS.indexOf('hh_c');
  for (let step = 0; step < steps; step += 2) {
    pattern[hhIdx][step] = true;
  }

  return pattern;
}

/**
 * Redimensiona un patrón a un nuevo número de pasos, preservando los
 * hits existentes en el rango que se mantiene (trunca o rellena con false).
 * @param {boolean[][]} pattern
 * @param {number} newStepCount
 * @returns {boolean[][]}
 */
export function resizePattern(pattern, newStepCount) {
  return pattern.map((row) => {
    const next = Array(newStepCount).fill(false);
    for (let i = 0; i < Math.min(row.length, newStepCount); i++) {
      next[i] = row[i];
    }
    return next;
  });
}

/** Código de instrumento (notación de libros de patrones) → nombre del instrumento */
const HIT_CODE_TO_INSTRUMENT = {
  BD: 'kick', SN: 'snare', CH: 'hh_c', OH: 'hh_o',
  CL: 'clap', HC: 'clap',
  HT: 'tom_hi', MT: 'tom_mid', LT: 'tom_lo',
  SH: 'shaker', RS: 'rimshot', CB: 'cowbell', CY: 'cymbal',
};

/**
 * Convierte un mapa compacto de código de instrumento → pasos activos
 * (1-indexado, como en la notación de libros de patrones) a la matriz
 * boolean[INSTRUMENT_COUNT][stepCount] que consume el Sequencer.
 * Códigos desconocidos o pasos fuera de rango se ignoran silenciosamente.
 * @param {Object<string, number[]>} hits
 * @param {number} [stepCount=STEP_COUNT]
 * @returns {boolean[][]}
 */
export function patternFromHitCodes(hits, stepCount = STEP_COUNT) {
  const pattern = createEmptyPattern(stepCount);
  Object.entries(hits).forEach(([code, steps]) => {
    const instrument = HIT_CODE_TO_INSTRUMENT[code];
    if (!instrument) return;
    const idx = INSTRUMENTS.indexOf(instrument);
    steps.forEach((step) => {
      if (step >= 1 && step <= stepCount) {
        pattern[idx][step - 1] = true;
      }
    });
  });
  return pattern;
}

/**
 * Clona un patrón para evitar mutaciones.
 * @param {boolean[][]} pattern
 * @returns {boolean[][]}
 */
export function clonePattern(pattern) {
  return pattern.map((row) => [...row]);
}

/**
 * Activa o desactiva un paso en el patrón (inmutable).
 * @param {boolean[][]} pattern
 * @param {number} instrumentIdx
 * @param {number} step
 * @returns {boolean[][]} nuevo patrón
 */
export function toggleStep(pattern, instrumentIdx, step) {
  const next = clonePattern(pattern);
  next[instrumentIdx][step] = !next[instrumentIdx][step];
  return next;
}

/**
 * Establece el estado de un paso explícitamente (inmutable).
 * @param {boolean[][]} pattern
 * @param {number} instrumentIdx
 * @param {number} step
 * @param {boolean} value
 * @returns {boolean[][]}
 */
export function setStep(pattern, instrumentIdx, step, value) {
  const next = clonePattern(pattern);
  next[instrumentIdx][step] = value;
  return next;
}

/**
 * Limpia una fila completa de instrumento (inmutable).
 * @param {boolean[][]} pattern
 * @param {number} instrumentIdx
 * @returns {boolean[][]}
 */
export function clearInstrument(pattern, instrumentIdx) {
  const next = clonePattern(pattern);
  next[instrumentIdx] = Array(pattern[instrumentIdx].length).fill(false);
  return next;
}

/**
 * Limpia el patrón completo (inmutable), preservando su número de pasos.
 * @param {boolean[][]} pattern
 * @returns {boolean[][]}
 */
export function clearPattern(pattern) {
  return createEmptyPattern(pattern[0]?.length ?? STEP_COUNT);
}

/**
 * Calcula el intervalo en segundos entre pasos a un BPM dado.
 * Un compás de 4/4 tiene 16 pasos de semicorchea.
 * @param {number} bpm
 * @returns {number} segundos por paso
 */
export function stepInterval(bpm) {
  return 60 / (bpm * 4); // 1/16 note = 1 beat / 4
}

/**
 * Cuenta los pasos activos en un patrón.
 * @param {boolean[][]} pattern
 * @returns {number}
 */
export function countActiveSteps(pattern) {
  return pattern.reduce((total, row) =>
    total + row.filter(Boolean).length, 0
  );
}

/**
 * Retorna los índices de pasos activos para un instrumento.
 * @param {boolean[][]} pattern
 * @param {number} instrumentIdx
 * @returns {number[]}
 */
export function getActiveSteps(pattern, instrumentIdx) {
  return pattern[instrumentIdx]
    .map((active, i) => (active ? i : -1))
    .filter((i) => i !== -1);
}

/**
 * Serializa un patrón a formato exportable para MidiExport.
 * Convierte boolean[][] → Object<string, boolean[]>
 * @param {boolean[][]} pattern
 * @returns {Object<string, boolean[]>}
 */
export function patternToMidiFormat(pattern) {
  return Object.fromEntries(
    INSTRUMENTS.map((name, i) => [name, [...pattern[i]]])
  );
}

/**
 * Deserializa un patrón desde formato MIDI/storage.
 * @param {Object<string, boolean[]>} midiPattern
 * @returns {boolean[][]}
 */
export function patternFromMidiFormat(midiPattern) {
  const stepCount = Object.values(midiPattern)[0]?.length ?? STEP_COUNT;
  return INSTRUMENTS.map((name) =>
    midiPattern[name]
      ? [...midiPattern[name]]
      : Array(stepCount).fill(false)
  );
}

/**
 * Valida que un BPM esté en el rango permitido.
 * @param {number} bpm
 * @returns {number} BPM clampeado a [60, 180]
 */
export function clampBpm(bpm) {
  return Math.min(180, Math.max(60, Math.round(bpm)));
}

/**
 * SequencerEngine — Motor de scheduling con Web Audio API.
 *
 * Uso:
 *   const engine = new SequencerEngine(audioEngine);
 *   engine.setPattern(pattern);
 *   engine.setBpm(120);
 *   engine.start();
 *   engine.stop();
 *
 * El engine emite callbacks onStep(stepIndex) y onStop()
 * para que el hook de React pueda actualizar el estado visual.
 */
export class SequencerEngine {
  /**
   * @param {import('./AudioEngine.js').AudioEngine} audioEngine
   */
  constructor(audioEngine) {
    this._audio       = audioEngine;
    this._bpm         = 120;
    this._pattern     = createEmptyPattern();
    this._currentStep = 0;
    this._isPlaying   = false;
    this._nextStepTime = 0;

    // Lookahead en segundos — cuánto tiempo adelante schedulamos
    this._lookahead   = 0.1;
    // Intervalo del scheduler en ms
    this._schedInterval = 25;
    this._timerId     = null;

    // Callbacks
    /** @type {((step: number) => void)|null} */
    this.onStep = null;
    /** @type {(() => void)|null} */
    this.onStop = null;
  }

  // ── Configuración ─────────────────────────────────────────────────────────

  /** @param {number} bpm */
  setBpm(bpm) {
    this._bpm = clampBpm(bpm);
  }

  /** @returns {number} */
  getBpm() { return this._bpm; }

  /** @param {boolean[][]} pattern */
  setPattern(pattern) {
    this._pattern = clonePattern(pattern);
  }

  /** @returns {boolean[][]} */
  getPattern() { return clonePattern(this._pattern); }

  /** @returns {number} paso actual (0-15) */
  getCurrentStep() { return this._currentStep; }

  /** @returns {boolean} */
  isPlaying() { return this._isPlaying; }

  // ── Control de reproducción ───────────────────────────────────────────────

  /**
   * Inicia la reproducción desde el paso 0.
   */
  start() {
    if (this._isPlaying) return;

    const ctx = this._audio.getContext();
    this._isPlaying    = true;
    this._currentStep  = 0;
    this._nextStepTime = ctx.currentTime + 0.05; // pequeño delay inicial

    this._timerId = setInterval(() => this._schedule(), this._schedInterval);
  }

  /**
   * Detiene la reproducción y resetea al paso 0.
   */
  stop() {
    if (!this._isPlaying) return;

    this._isPlaying = false;
    clearInterval(this._timerId);
    this._timerId    = null;
    this._currentStep = 0;

    if (this.onStop) this.onStop();
  }

  /**
   * Toggle play/stop.
   */
  toggle() {
    if (this._isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  // ── Scheduler interno ─────────────────────────────────────────────────────

  /**
   * Lookahead scheduler — schedula todos los pasos que caen dentro
   * de la ventana [now, now + lookahead].
   * Se llama cada _schedInterval ms.
   * @private
   */
  _schedule() {
    const ctx = this._audio.getContext();
    const now = ctx.currentTime;

    while (this._nextStepTime < now + this._lookahead) {
      this._scheduleStep(this._currentStep, this._nextStepTime);

      // Notificar al UI en el siguiente frame
      const step = this._currentStep;
      setTimeout(() => {
        if (this.onStep) this.onStep(step);
      }, Math.max(0, (this._nextStepTime - now) * 1000));

      // Avanzar al siguiente paso — el módulo respeta el stepCount real
      // del patrón cargado (no un STEP_COUNT fijo), para soportar patrones
      // de cualquier longitud.
      const stepCount = this._pattern[0]?.length || STEP_COUNT;
      this._nextStepTime += stepInterval(this._bpm);
      this._currentStep = (this._currentStep + 1) % stepCount;
    }
  }

  /**
   * Schedula los sonidos activos en un paso específico.
   * @param {number} step - índice del paso (0-15)
   * @param {number} time - tiempo absoluto de AudioContext
   * @private
   */
  _scheduleStep(step, time) {
    INSTRUMENTS.forEach((instrument, i) => {
      if (!this._pattern[i][step]) return;

      // Schedulamos cada drum con tiempo absoluto
      this._scheduleDrum(instrument, time);
    });
  }

  /**
   * Llama al método de drum correspondiente en AudioEngine.
   * @param {string} instrument
   * @param {number} time
   * @private
   */
  _scheduleDrum(instrument, time) {
    // AudioEngine no soporta scheduling con tiempo futuro nativo,
    // usamos un timeout preciso basado en AudioContext.currentTime
    const ctx   = this._audio.getContext();
    const delay = Math.max(0, (time - ctx.currentTime) * 1000);

    setTimeout(() => {
      if (!this._isPlaying) return;
      switch (instrument) {
        case 'kick':     this._audio.drumKick();       break;
        case 'snare':    this._audio.drumSnare();      break;
        case 'hh_c':     this._audio.drumHiHat(false); break;
        case 'hh_o':     this._audio.drumHiHat(true);  break;
        case 'clap':     this._audio.drumClap();       break;
        case 'tom_hi':   this._audio.drumTom(220);     break;
        case 'tom_mid':  this._audio.drumTom(180);     break;
        case 'tom_lo':   this._audio.drumTom(140);     break;
        case 'shaker':   this._audio.drumShaker();     break;
        case 'rimshot':  this._audio.drumRimshot();    break;
        case 'cowbell':  this._audio.drumCowbell();    break;
        case 'cymbal':   this._audio.drumCymbal();     break;
      }
    }, delay);
  }
}
