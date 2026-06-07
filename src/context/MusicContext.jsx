import React, { createContext, useState, useRef, useCallback } from 'react';

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
 * @property {number}   bpm           - Tempo en BPM (60-180)
 * @property {Function} setBpm
 * @property {boolean}  isPlaying     - Estado del sequencer
 * @property {Function} setIsPlaying
 * @property {React.MutableRefObject} audioEngineRef - Singleton de AudioEngine
 */

export const MusicContext = createContext(null);

/**
 * MusicProvider — Envuelve la app y provee el estado musical global.
 * @param {{ children: React.ReactNode }} props
 */
export function MusicProvider({ children }) {
  const [rootNote,    setRootNote]    = useState('C');
  const [scaleName,   setScaleName]   = useState('Major');
  const [activeChord, setActiveChord] = useState(null);
  const [progression, setProgression] = useState([]);
  const [bpm,         setBpm]         = useState(120);
  const [isPlaying,   setIsPlaying]   = useState(false);

  // Singleton de AudioEngine — se inicializa tras primer gesto del usuario
  const audioEngineRef = useRef(null);

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

  const value = {
    rootNote,    setRootNote: handleSetRootNote,
    scaleName,   setScaleName,
    activeChord, setActiveChord,
    progression, setProgression,
    bpm,         setBpm: handleSetBpm,
    isPlaying,   setIsPlaying,
    audioEngineRef,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}
