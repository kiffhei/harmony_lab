import React, { createContext, useState, useRef, useCallback, useEffect } from 'react';
import { createEmptyPattern } from '../core/SequencerEngine.js';
import { serializeProgression, deserializeProgression } from '../core/ProgressionEngine.js';

const STORAGE_KEY = 'harmony-lab-session';

/**
 * Carga la sesión guardada en localStorage (rootNote, scaleName, bpm,
 * progression, pattern). Falla en silencio si no hay datos, están corruptos,
 * o localStorage no está disponible (modo privado, SSR, etc.).
 * @returns {Object}
 */
function loadSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      rootNote:   parsed.rootNote,
      scaleName:  parsed.scaleName,
      bpm:        parsed.bpm,
      pattern:    Array.isArray(parsed.pattern) ? parsed.pattern : undefined,
      progression: parsed.progression
        ? deserializeProgression(JSON.stringify(parsed.progression))
        : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Persiste la sesión actual en localStorage.
 * @param {{rootNote: string, scaleName: string, bpm: number, progression: Array, pattern: boolean[][]}} session
 */
function saveSession(session) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      rootNote:    session.rootNote,
      scaleName:   session.scaleName,
      bpm:         session.bpm,
      progression: JSON.parse(serializeProgression(session.progression)),
      pattern:     session.pattern,
    }));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida) — ignorar
  }
}

/**
 * MusicContext — Estado global de Harmony Lab Pro.
 *
 * @typedef {Object} MusicContextValue
 * @property {string}   rootNote      - Nota raíz activa ('C' default)
 * @property {Function} setRootNote
 * @property {string}   scaleName     - Escala activa ('Major' default)
 * @property {Function} setScaleName
 * @property {Object|null} activeChord - Acorde seleccionado actualmente
 * @property {Function} setActiveChord
 * @property {Array}    progression   - Progresión de acordes en construcción
 * @property {Function} setProgression
 * @property {boolean[][]} pattern    - Patrón de batería (8 instrumentos x 16 pasos)
 * @property {Function} setPattern
 * @property {number}   bpm           - Tempo en BPM (60-180)
 * @property {Function} setBpm
 * @property {number}   activeStep        - Paso activo del Sequencer (0-15, -1 si detenido)
 * @property {Function} setActiveStep
 * @property {boolean}  isSequencerPlaying   - Estado de reproducción del Sequencer
 * @property {Function} setIsSequencerPlaying
 * @property {number}   activeChordIndex     - Índice del acorde activo en Progressions (-1 si detenido)
 * @property {Function} setActiveChordIndex
 * @property {boolean}  isProgressionPlaying - Estado de reproducción de Progressions
 * @property {Function} setIsProgressionPlaying
 * @property {React.MutableRefObject} audioEngineRef - Singleton de AudioEngine
 * @property {React.MutableRefObject} sequencerEngineRef - Singleton de SequencerEngine (persiste entre módulos)
 * @property {React.MutableRefObject} progressionPlayerRef - Singleton de ProgressionPlayer (persiste entre módulos)
 */

export const MusicContext = createContext(null);

/**
 * MusicProvider — Envuelve la app y provee el estado musical global.
 * @param {{ children: React.ReactNode }} props
 */
export function MusicProvider({ children }) {
  const [initialSession] = useState(() => loadSession());

  const [rootNote,    setRootNote]    = useState(initialSession.rootNote  ?? 'C');
  const [scaleName,   setScaleName]   = useState(initialSession.scaleName ?? 'Major');
  const [activeChord, setActiveChord] = useState(null);
  const [progression, setProgression] = useState(initialSession.progression ?? []);
  const [pattern,     setPattern]     = useState(initialSession.pattern ?? createEmptyPattern());
  const [bpm,         setBpm]         = useState(initialSession.bpm ?? 120);

  // Estado de reproducción del Sequencer — vive aquí (no en el hook) para que
  // el motor y su playhead sobrevivan a que el componente Sequencer se desmonte
  // al navegar a otro módulo (permite tocar batería + acordes mientras exploras).
  const [activeStep,          setActiveStep]          = useState(-1);
  const [isSequencerPlaying,  setIsSequencerPlaying]  = useState(false);

  // Estado de reproducción de Progressions — misma razón que arriba.
  const [activeChordIndex,    setActiveChordIndex]    = useState(-1);
  const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);
  const [progressionLoop,      setProgressionLoop]      = useState(false);

  // Singleton de AudioEngine — se inicializa tras primer gesto del usuario
  const audioEngineRef = useRef(null);

  // Singletons de motores de reproducción — persisten entre montajes de componentes
  const sequencerEngineRef   = useRef(null);
  const progressionPlayerRef = useRef(null);

  /**
   * Actualiza --active-key-color en el DOM al cambiar la tonalidad.
   * Se llama desde cualquier componente vía setRootNote.
   */
  const handleSetRootNote = useCallback((note) => {
    setRootNote(note);
    const keyMap = {
      'C': '--key-C', 'C#': '--key-Cs', 'D': '--key-D',
      'D#': '--key-Ds', 'E': '--key-E', 'F': '--key-F',
      'F#': '--key-Fs', 'G': '--key-G', 'G#': '--key-Gs',
      'A': '--key-A', 'A#': '--key-As', 'B': '--key-B',
    };
    const tokenVar = keyMap[note];
    if (tokenVar) {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(tokenVar).trim();
      document.documentElement.style.setProperty('--active-key-color', color);
    }
  }, []);

  /**
   * Actualiza --dur-beat en el DOM al cambiar el BPM.
   * Se usa para sincronizar animaciones CSS con el tempo.
   */
  const handleSetBpm = useCallback((val) => {
    const clamped = Math.min(180, Math.max(60, val));
    setBpm(clamped);
    const beatMs = Math.round(60000 / clamped);
    document.documentElement.style.setProperty('--dur-beat', `${beatMs}ms`);
  }, []);

  // Persiste la sesión (tonalidad, tempo, progresión, patrón de batería) en
  // cada cambio, para que sobreviva a un refresco del navegador.
  useEffect(() => {
    saveSession({ rootNote, scaleName, bpm, progression, pattern });
  }, [rootNote, scaleName, bpm, progression, pattern]);

  const value = {
    rootNote,    setRootNote: handleSetRootNote,
    scaleName,   setScaleName,
    activeChord, setActiveChord,
    progression, setProgression,
    pattern,     setPattern,
    bpm,         setBpm: handleSetBpm,
    activeStep,           setActiveStep,
    isSequencerPlaying,   setIsSequencerPlaying,
    activeChordIndex,     setActiveChordIndex,
    isProgressionPlaying, setIsProgressionPlaying,
    progressionLoop,      setProgressionLoop,
    audioEngineRef,
    sequencerEngineRef,
    progressionPlayerRef,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}
