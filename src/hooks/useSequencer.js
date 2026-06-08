/**
 * useSequencer.js — Harmony Lab Pro
 * Hook que conecta SequencerEngine con React y MusicContext.
 *
 * Responsabilidades:
 * - Inicializar y mantener el SequencerEngine en un ref
 * - Sincronizar BPM y isPlaying con MusicContext
 * - Exponer el estado de pasos activos para el render del grid
 * - Proveer handlers para toggle de pasos, play/stop, BPM
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMusicContext } from './useMusicContext.js';
import { useAudioEngine } from './useAudioEngine.js';
import {
  SequencerEngine,
  createEmptyPattern,
  createDefaultPattern,
  toggleStep,
  clearPattern,
  clearInstrument,
  patternToMidiFormat,
  INSTRUMENTS,
  STEP_COUNT,
} from '../core/SequencerEngine.js';

/**
 * useSequencer — Hook principal del Sequencer.
 *
 * @returns {{
 *   pattern: boolean[][],
 *   activeStep: number,
 *   isPlaying: boolean,
 *   bpm: number,
 *   handleToggleStep: (instrumentIdx: number, step: number) => void,
 *   handlePlay: () => void,
 *   handleStop: () => void,
 *   handleTogglePlay: () => void,
 *   handleBpmChange: (bpm: number) => void,
 *   handleClear: () => void,
 *   handleClearInstrument: (instrumentIdx: number) => void,
 *   handleLoadDefault: () => void,
 *   getMidiPattern: () => Object,
 * }}
 */
export function useSequencer() {
  const { bpm, setBpm, isPlaying, setIsPlaying } = useMusicContext();
  const { getEngine } = useAudioEngine();

  // Patrón de pasos — estado de React para re-render del grid
  const [pattern,    setPattern]    = useState(() => createEmptyPattern());
  // Paso activo actual — se actualiza en cada tick del engine
  const [activeStep, setActiveStep] = useState(-1);

  // Ref al engine — no causa re-render al actualizarse
  const engineRef = useRef(null);

  // ── Inicialización del engine ──────────────────────────────────────────────

  const getSequencerEngine = useCallback(() => {
    if (!engineRef.current) {
      const audio  = getEngine();
      engineRef.current = new SequencerEngine(audio);

      // Callback de step → actualizar el paso activo en UI
      engineRef.current.onStep = (step) => {
        setActiveStep(step);
      };

      // Callback de stop → limpiar paso activo
      engineRef.current.onStop = () => {
        setActiveStep(-1);
        setIsPlaying(false);
      };
    }
    return engineRef.current;
  }, [getEngine, setIsPlaying]);

  // ── Sincronización BPM → engine ───────────────────────────────────────────

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setBpm(bpm);
    }
  }, [bpm]);

  // ── Sincronización pattern → engine ──────────────────────────────────────

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPattern(pattern);
    }
  }, [pattern]);

  // ── Cleanup al desmontar ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (engineRef.current && engineRef.current.isPlaying()) {
        engineRef.current.stop();
      }
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Toggle de un paso en el grid.
   * @param {number} instrumentIdx
   * @param {number} step
   */
  const handleToggleStep = useCallback((instrumentIdx, step) => {
    setPattern((prev) => {
      const next = toggleStep(prev, instrumentIdx, step);
      // Actualizar el engine inmediatamente si está reproduciendo
      if (engineRef.current) {
        engineRef.current.setPattern(next);
      }
      return next;
    });
  }, []);

  /**
   * Inicia la reproducción.
   */
  const handlePlay = useCallback(() => {
    const engine = getSequencerEngine();
    engine.setBpm(bpm);
    engine.setPattern(pattern);
    engine.start();
    setIsPlaying(true);
  }, [getSequencerEngine, bpm, pattern, setIsPlaying]);

  /**
   * Detiene la reproducción.
   */
  const handleStop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsPlaying(false);
    setActiveStep(-1);
  }, [setIsPlaying]);

  /**
   * Toggle play/stop.
   */
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handleStop]);

  /**
   * Cambia el BPM.
   * @param {number} newBpm
   */
  const handleBpmChange = useCallback((newBpm) => {
    setBpm(newBpm);
    if (engineRef.current) {
      engineRef.current.setBpm(newBpm);
    }
  }, [setBpm]);

  /**
   * Limpia el patrón completo.
   */
  const handleClear = useCallback(() => {
    setPattern(clearPattern(pattern));
  }, [pattern]);

  /**
   * Limpia un instrumento específico.
   * @param {number} instrumentIdx
   */
  const handleClearInstrument = useCallback((instrumentIdx) => {
    setPattern((prev) => clearInstrument(prev, instrumentIdx));
  }, []);

  /**
   * Carga el patrón default.
   */
  const handleLoadDefault = useCallback(() => {
    setPattern(createDefaultPattern());
  }, []);

  /**
   * Retorna el patrón en formato para MidiExport.
   * @returns {Object<string, boolean[]>}
   */
  const getMidiPattern = useCallback(() => {
    return patternToMidiFormat(pattern);
  }, [pattern]);

  return {
    pattern,
    activeStep,
    isPlaying,
    bpm,
    instruments: INSTRUMENTS,
    stepCount:   STEP_COUNT,
    handleToggleStep,
    handlePlay,
    handleStop,
    handleTogglePlay,
    handleBpmChange,
    handleClear,
    handleClearInstrument,
    handleLoadDefault,
    getMidiPattern,
  };
}
