/**
 * useProgressions.js — Harmony Lab Pro
 * Hook que conecta ProgressionEngine con React y MusicContext.
 */

import { useCallback } from 'react';
import { useMusicContext } from './useMusicContext.js';
import { useAudioEngine } from './useAudioEngine.js';
import {
  ProgressionPlayer,
  addChord, removeChord, moveChord,
  setChordBeats, setChordOctave,
  duplicateChord, clearProgression, reverseProgression,
  toMidiFormat, serializeProgression, deserializeProgression,
  validateProgression, getChordAtBeat, totalBeats,
} from '../core/ProgressionEngine.js';

/**
 * useProgressions — Hook principal del módulo Progressions.
 */
export function useProgressions() {
  const {
    bpm, setBpm, progression, setProgression,
    activeChordIndex: activeIndex, setActiveChordIndex: setActiveIndex,
    isProgressionPlaying: isPlaying, setIsProgressionPlaying: setIsPlaying,
    progressionLoop: loop, setProgressionLoop: setLoop,
    progressionPlayerRef: playerRef,
  } = useMusicContext();

  const { getEngine } = useAudioEngine();

  // ── Player ────────────────────────────────────────────────────────────────
  // El player vive en un ref del contexto (no local) para que siga sonando
  // aunque el componente Progressions se desmonte al navegar a otro módulo.

  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = new ProgressionPlayer(getEngine());
      playerRef.current.onChord = (index) => setActiveIndex(index);
      playerRef.current.onEnd   = () => {
        setIsPlaying(false);
        setActiveIndex(-1);
      };
    }
    return playerRef.current;
  }, [playerRef, getEngine, setActiveIndex, setIsPlaying]);

  // ── Edición de progresión ─────────────────────────────────────────────────

  const handleAddChord = useCallback((chordNode, beats) => {
    setProgression((prev) => addChord(prev, chordNode, beats));
  }, [setProgression]);

  const handleRemoveChord = useCallback((id) => {
    setProgression((prev) => removeChord(prev, id));
  }, [setProgression]);

  const handleMoveChord = useCallback((fromIndex, toIndex) => {
    setProgression((prev) => moveChord(prev, fromIndex, toIndex));
  }, [setProgression]);

  const handleSetBeats = useCallback((id, beats) => {
    setProgression((prev) => setChordBeats(prev, id, beats));
  }, [setProgression]);

  const handleSetOctave = useCallback((id, octave) => {
    setProgression((prev) => setChordOctave(prev, id, octave));
  }, [setProgression]);

  const handleDuplicate = useCallback((id) => {
    setProgression((prev) => duplicateChord(prev, id));
  }, [setProgression]);

  const handleClear = useCallback(() => {
    setProgression(clearProgression());
  }, [setProgression]);

  const handleReverse = useCallback(() => {
    setProgression((prev) => reverseProgression(prev));
  }, [setProgression]);

  // ── Reproducción ──────────────────────────────────────────────────────────

  const handlePlay = useCallback(() => {
    const player = getPlayer();
    player.setProgression(progression);
    player.setBpm(bpm);
    player.setLoop(loop);
    player.play();
    setIsPlaying(true);
  }, [getPlayer, progression, bpm, loop]);

  const handleStop = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);
    setActiveIndex(-1);
  }, []);

  const handleTogglePlay = useCallback(() => {
    isPlaying ? handleStop() : handlePlay();
  }, [isPlaying, handlePlay, handleStop]);

  const handleToggleLoop = useCallback(() => {
    setLoop((prev) => {
      const next = !prev;
      if (playerRef.current) playerRef.current.setLoop(next);
      return next;
    });
  }, []);

  // ── Exportación ───────────────────────────────────────────────────────────

  const getMidiFormat = useCallback(() => toMidiFormat(progression), [progression]);

  const handleExport = useCallback(() => {
    return serializeProgression(progression);
  }, [progression]);

  const handleImport = useCallback((json) => {
    try {
      const imported = deserializeProgression(json);
      const { valid } = validateProgression(imported);
      if (valid) setProgression(imported);
      return { success: valid };
    } catch {
      return { success: false };
    }
  }, [setProgression]);

  return {
    progression,
    isPlaying,
    activeIndex,
    loop,
    bpm,
    totalBeats:    totalBeats(progression),
    validation:    validateProgression(progression),
    handleAddChord,
    handleRemoveChord,
    handleMoveChord,
    handleSetBeats,
    handleSetOctave,
    handleDuplicate,
    handleClear,
    handleReverse,
    handlePlay,
    handleStop,
    handleTogglePlay,
    handleToggleLoop,
    getMidiFormat,
    handleExport,
    handleImport,
    getChordAtBeat: (beat) => getChordAtBeat(progression, beat),
  };
}
