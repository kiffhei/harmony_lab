/**
 * useSessionTransport.js — Harmony Lab Pro
 * Orquesta la reproducción conjunta de Sequencer (batería) y Progressions (acordes).
 *
 * No fusiona SequencerEngine y ProgressionPlayer en un solo reloj — cada uno
 * mantiene su propio scheduling interno. Este hook solo arranca/detiene ambos
 * juntos, para que tocar batería + acordes se sienta como una sola sesión en
 * vez de dos reproductores independientes que hay que accionar por separado.
 */

import { useCallback } from 'react';
import { useSequencer } from './useSequencer.js';
import { useProgressions } from './useProgressions.js';
import { countActiveSteps } from '../core/SequencerEngine.js';

/**
 * useSessionTransport — Play/Stop compartido entre Sequencer y Progressions.
 *
 * @returns {{
 *   isSessionPlaying: boolean,
 *   hasPattern: boolean,
 *   hasProgression: boolean,
 *   playAll: () => void,
 *   stopAll: () => void,
 *   toggleAll: () => void,
 * }}
 */
export function useSessionTransport() {
  const sequencer    = useSequencer();
  const progressions = useProgressions();

  const hasPattern     = countActiveSteps(sequencer.pattern) > 0;
  const hasProgression = progressions.progression.length > 0;

  const isSessionPlaying = sequencer.isPlaying || progressions.isPlaying;

  const playAll = useCallback(() => {
    if (hasPattern)     sequencer.handlePlay();
    if (hasProgression) progressions.handlePlay();
  }, [hasPattern, hasProgression, sequencer, progressions]);

  const stopAll = useCallback(() => {
    if (sequencer.isPlaying)    sequencer.handleStop();
    if (progressions.isPlaying) progressions.handleStop();
  }, [sequencer, progressions]);

  const toggleAll = useCallback(() => {
    if (isSessionPlaying) stopAll();
    else playAll();
  }, [isSessionPlaying, playAll, stopAll]);

  return {
    isSessionPlaying,
    hasPattern,
    hasProgression,
    playAll,
    stopAll,
    toggleAll,
  };
}
