/**
 * ProgressionEngine.js — Harmony Lab Pro
 * Lógica pura para construcción, edición y reproducción de progresiones.
 * Sin UI, sin side effects externos, testeable con jsdom.
 *
 * Responsabilidades:
 * - Manipulación inmutable de progresiones (agregar, mover, eliminar)
 * - Cálculo de duración y timing por acorde
 * - Serialización para MidiExport y persistencia
 * - Validación de progresiones
 */

// ── Tipos y constantes ────────────────────────────────────────────────────────

/**
 * Duraciones disponibles por acorde en beats (pulsos de negra).
 */
export const CHORD_DURATIONS = [1, 2, 4, 8];

/** Duración default en beats */
export const DEFAULT_BEATS = 4;

/** Máximo de acordes en una progresión */
export const MAX_CHORDS = 16;

/**
 * @typedef {Object} ProgressionChord
 * @property {string}   id       - ID único del acorde en la progresión
 * @property {string}   root     - Nota raíz
 * @property {string}   quality  - 'maj'|'min'|'dim'|'aug'
 * @property {string}   roman    - Grado romano
 * @property {string[]} notes    - Notas del acorde
 * @property {number}   degree   - Índice del grado (0-6)
 * @property {number}   beats    - Duración en beats (1, 2, 4, 8)
 * @property {number}   octave   - Octava de reproducción (default 4)
 */

// ── Utilidades ────────────────────────────────────────────────────────────────

/**
 * Genera un ID único para un acorde en la progresión.
 * Usa timestamp + random para evitar colisiones.
 * @returns {string}
 */
export function generateChordId() {
  return `chord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Crea un ProgressionChord desde un ChordNode de HarmonyGraph.
 * @param {Object} chordNode - { root, quality, roman, notes, degree }
 * @param {number} [beats=4]
 * @param {number} [octave=4]
 * @returns {ProgressionChord}
 */
export function createProgressionChord(chordNode, beats = DEFAULT_BEATS, octave = 4) {
  return {
    id:      generateChordId(),
    root:    chordNode.root,
    quality: chordNode.quality,
    roman:   chordNode.roman   ?? '',
    notes:   [...(chordNode.notes ?? [])],
    degree:  chordNode.degree  ?? 0,
    beats:   CHORD_DURATIONS.includes(beats) ? beats : DEFAULT_BEATS,
    octave:  Math.min(7, Math.max(1, octave)),
  };
}

// ── Manipulación inmutable de progresiones ────────────────────────────────────

/**
 * Agrega un acorde al final de la progresión.
 * Respeta el límite de MAX_CHORDS.
 *
 * @param {ProgressionChord[]} progression
 * @param {Object} chordNode
 * @param {number} [beats=4]
 * @returns {ProgressionChord[]}
 */
export function addChord(progression, chordNode, beats = DEFAULT_BEATS) {
  if (progression.length >= MAX_CHORDS) return progression;
  return [...progression, createProgressionChord(chordNode, beats)];
}

/**
 * Elimina un acorde por su ID.
 *
 * @param {ProgressionChord[]} progression
 * @param {string} id
 * @returns {ProgressionChord[]}
 */
export function removeChord(progression, id) {
  return progression.filter((c) => c.id !== id);
}

/**
 * Mueve un acorde de posición (reordenamiento).
 *
 * @param {ProgressionChord[]} progression
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {ProgressionChord[]}
 */
export function moveChord(progression, fromIndex, toIndex) {
  if (
    fromIndex < 0 || fromIndex >= progression.length ||
    toIndex   < 0 || toIndex   >= progression.length ||
    fromIndex === toIndex
  ) {
    return progression;
  }

  const next = [...progression];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Actualiza la duración de un acorde.
 *
 * @param {ProgressionChord[]} progression
 * @param {string} id
 * @param {number} beats
 * @returns {ProgressionChord[]}
 */
export function setChordBeats(progression, id, beats) {
  if (!CHORD_DURATIONS.includes(beats)) return progression;
  return progression.map((c) =>
    c.id === id ? { ...c, beats } : c
  );
}

/**
 * Actualiza la octava de un acorde.
 *
 * @param {ProgressionChord[]} progression
 * @param {string} id
 * @param {number} octave
 * @returns {ProgressionChord[]}
 */
export function setChordOctave(progression, id, octave) {
  const clamped = Math.min(7, Math.max(1, octave));
  return progression.map((c) =>
    c.id === id ? { ...c, octave: clamped } : c
  );
}

/**
 * Duplica un acorde en la posición siguiente.
 *
 * @param {ProgressionChord[]} progression
 * @param {string} id
 * @returns {ProgressionChord[]}
 */
export function duplicateChord(progression, id) {
  if (progression.length >= MAX_CHORDS) return progression;
  const idx = progression.findIndex((c) => c.id === id);
  if (idx === -1) return progression;

  const copy = { ...progression[idx], id: generateChordId() };
  const next = [...progression];
  next.splice(idx + 1, 0, copy);
  return next;
}

/**
 * Limpia la progresión completa.
 * @returns {ProgressionChord[]}
 */
export function clearProgression() {
  return [];
}

/**
 * Invierte el orden de la progresión.
 * @param {ProgressionChord[]} progression
 * @returns {ProgressionChord[]}
 */
export function reverseProgression(progression) {
  return [...progression].reverse();
}

// ── Cálculos de timing ────────────────────────────────────────────────────────

/**
 * Calcula la duración total de la progresión en beats.
 * @param {ProgressionChord[]} progression
 * @returns {number}
 */
export function totalBeats(progression) {
  return progression.reduce((sum, c) => sum + c.beats, 0);
}

/**
 * Calcula la duración total en segundos a un BPM dado.
 * @param {ProgressionChord[]} progression
 * @param {number} bpm
 * @returns {number}
 */
export function totalDuration(progression, bpm) {
  if (bpm <= 0) return 0;
  return (totalBeats(progression) / bpm) * 60;
}

/**
 * Calcula el offset en beats de cada acorde en la progresión.
 * Útil para el reproductor y para la visualización.
 *
 * @param {ProgressionChord[]} progression
 * @returns {number[]} array de offsets en beats
 */
export function getBeatOffsets(progression) {
  let offset = 0;
  return progression.map((chord) => {
    const current = offset;
    offset += chord.beats;
    return current;
  });
}

/**
 * Retorna el acorde que debe estar sonando en un beat dado.
 * @param {ProgressionChord[]} progression
 * @param {number} beat - Beat actual (puede ser fraccional)
 * @returns {{ chord: ProgressionChord, index: number }|null}
 */
export function getChordAtBeat(progression, beat) {
  if (progression.length === 0) return null;

  const total = totalBeats(progression);
  // Loop: normalizar el beat al rango de la progresión
  const normalizedBeat = ((beat % total) + total) % total;

  let offset = 0;
  for (let i = 0; i < progression.length; i++) {
    const end = offset + progression[i].beats;
    if (normalizedBeat >= offset && normalizedBeat < end) {
      return { chord: progression[i], index: i };
    }
    offset = end;
  }
  return null;
}

// ── Serialización ─────────────────────────────────────────────────────────────

/**
 * Convierte la progresión al formato de MidiExport.buildProgressionBytes.
 *
 * @param {ProgressionChord[]} progression
 * @returns {Array<{notes: string[], octave: number, beats: number}>}
 */
export function toMidiFormat(progression) {
  return progression.map(({ notes, octave, beats }) => ({
    notes: [...notes],
    octave,
    beats,
  }));
}

/**
 * Serializa la progresión a JSON para persistencia.
 * @param {ProgressionChord[]} progression
 * @returns {string}
 */
export function serializeProgression(progression) {
  return JSON.stringify(progression);
}

/**
 * Deserializa una progresión desde JSON.
 * Valida la estructura básica de cada acorde.
 *
 * @param {string} json
 * @returns {ProgressionChord[]}
 * @throws {Error} Si el JSON es inválido
 */
export function deserializeProgression(json) {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('Formato inválido: se esperaba un array');

  return parsed.map((item) => {
    if (!item.root || !item.notes || !Array.isArray(item.notes)) {
      throw new Error(`Acorde inválido: ${JSON.stringify(item)}`);
    }
    return {
      id:      item.id      ?? generateChordId(),
      root:    item.root,
      quality: item.quality ?? 'maj',
      roman:   item.roman   ?? '',
      notes:   item.notes,
      degree:  item.degree  ?? 0,
      beats:   CHORD_DURATIONS.includes(item.beats) ? item.beats : DEFAULT_BEATS,
      octave:  item.octave  ?? 4,
    };
  });
}

// ── Validación ────────────────────────────────────────────────────────────────

/**
 * Valida que una progresión sea reproducible.
 * @param {ProgressionChord[]} progression
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProgression(progression) {
  const errors = [];

  if (!Array.isArray(progression)) {
    return { valid: false, errors: ['La progresión debe ser un array'] };
  }

  if (progression.length === 0) {
    errors.push('La progresión está vacía');
  }

  if (progression.length > MAX_CHORDS) {
    errors.push(`La progresión excede el máximo de ${MAX_CHORDS} acordes`);
  }

  progression.forEach((chord, i) => {
    if (!chord.notes || chord.notes.length === 0) {
      errors.push(`Acorde ${i + 1} no tiene notas`);
    }
    if (!CHORD_DURATIONS.includes(chord.beats)) {
      errors.push(`Acorde ${i + 1} tiene duración inválida: ${chord.beats}`);
    }
  });

  return { valid: errors.length === 0, errors };
}

// ── Reproductor ───────────────────────────────────────────────────────────────

/**
 * ProgressionPlayer — Motor de reproducción secuencial de progresiones.
 *
 * Usa setTimeout con AudioContext.currentTime para scheduling preciso.
 * Compatible con el AudioEngine existente.
 *
 * Uso:
 *   const player = new ProgressionPlayer(audioEngine);
 *   player.setProgression(progression);
 *   player.setBpm(120);
 *   player.play();
 *   player.stop();
 */
export class ProgressionPlayer {
  /**
   * @param {import('./AudioEngine.js').AudioEngine} audioEngine
   */
  constructor(audioEngine) {
    this._audio      = audioEngine;
    this._progression = [];
    this._bpm         = 120;
    this._loop        = false;
    this._isPlaying   = false;
    this._timers      = [];
    this._currentIdx  = 0;

    /** @type {((index: number, chord: ProgressionChord) => void)|null} */
    this.onChord = null;
    /** @type {(() => void)|null} */
    this.onEnd   = null;
  }

  // ── Configuración ──────────────────────────────────────────────────────────

  /** @param {ProgressionChord[]} progression */
  setProgression(progression) {
    this._progression = [...progression];
  }

  /** @param {number} bpm */
  setBpm(bpm) {
    this._bpm = Math.min(180, Math.max(60, bpm));
  }

  /** @param {boolean} loop */
  setLoop(loop) {
    this._loop = loop;
  }

  /** @returns {boolean} */
  isPlaying() { return this._isPlaying; }

  /** @returns {number} */
  getCurrentIndex() { return this._currentIdx; }

  // ── Reproducción ───────────────────────────────────────────────────────────

  /**
   * Inicia la reproducción desde el principio.
   */
  play() {
    if (this._isPlaying) this.stop();
    if (this._progression.length === 0) return;

    const { valid } = validateProgression(this._progression);
    if (!valid) return;

    this._isPlaying   = true;
    this._currentIdx  = 0;
    this._scheduleAll();
  }

  /**
   * Detiene la reproducción y cancela todos los timers pendientes.
   */
  stop() {
    this._isPlaying = false;
    this._timers.forEach(clearTimeout);
    this._timers    = [];
    this._currentIdx = 0;
  }

  /**
   * Schedula todos los acordes de la progresión.
   * @private
   */
  _scheduleAll() {
    const secPerBeat = 60 / this._bpm;
    const offsets    = getBeatOffsets(this._progression);

    this._progression.forEach((chord, i) => {
      const delayMs = offsets[i] * secPerBeat * 1000;

      const timer = setTimeout(() => {
        if (!this._isPlaying) return;
        this._currentIdx = i;
        this._playChord(chord);
        if (this.onChord) this.onChord(i, chord);
      }, delayMs);

      this._timers.push(timer);
    });

    // Callback de fin
    const totalMs = totalDuration(this._progression, this._bpm) * 1000;
    const endTimer = setTimeout(() => {
      if (!this._isPlaying) return;

      if (this._loop) {
        this._timers = [];
        this._scheduleAll();
      } else {
        this._isPlaying = false;
        this._currentIdx = 0;
        if (this.onEnd) this.onEnd();
      }
    }, totalMs);

    this._timers.push(endTimer);
  }

  /**
   * Reproduce un acorde vía AudioEngine.
   * @param {ProgressionChord} chord
   * @private
   */
  _playChord(chord) {
    try {
      this._audio.playChord(chord.notes, chord.octave);
    } catch (_) {
      // Ignorar errores de audio silenciosamente
    }
  }
}
