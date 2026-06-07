import { useCallback } from 'react';
import { useMusicContext } from './useMusicContext.js';
import { AudioEngine } from '../core/AudioEngine.js';

/**
 * useAudioEngine — Provee acceso al singleton de AudioEngine.
 * El contexto de audio se inicializa SOLO tras el primer gesto del usuario
 * (click/tap) para cumplir con la política de autoplay de navegadores.
 *
 * @returns {{ getEngine: () => AudioEngine, playTone: Function, playChord: Function }}
 */
export function useAudioEngine() {
  const { audioEngineRef } = useMusicContext();

  /**
   * Obtiene o inicializa el singleton de AudioEngine.
   * Seguro llamarlo en cualquier event handler — nunca en render.
   */
  const getEngine = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new AudioEngine();
    }
    return audioEngineRef.current;
  }, [audioEngineRef]);

  const playTone = useCallback((freq, dur, type, vol) => {
    getEngine().playTone(freq, dur, type, vol);
  }, [getEngine]);

  const playChord = useCallback((notes, octave) => {
    getEngine().playChord(notes, octave);
  }, [getEngine]);

  return { getEngine, playTone, playChord };
}
