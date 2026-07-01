/**
 * useHarmonyMap.js — Harmony Lab Pro
 * Hook que conecta HarmonyGraph con React y MusicContext.
 *
 * Responsabilidades:
 * - Proveer nodos y relaciones del grafo para la tonalidad activa
 * - Manejar el acorde activo y las sugerencias de movimiento
 * - Sincronizar con MusicContext (rootNote, scaleName, activeChord)
 * - Reproducir acordes via AudioEngine al seleccionar un nodo
 */

import { useMemo, useCallback } from 'react';
import { useMusicContext } from './useMusicContext.js';
import { useAudioEngine } from './useAudioEngine.js';
import {
  buildHarmonyNodes,
  buildHarmonyRelations,
  getSuggestions,
  getPredecessors,
  getRelation,
  getRelativeKey,
  getParallelKey,
  getNeighborKeys,
  getCommonProgressions,
  degreesToChords,
} from '../core/HarmonyGraph.js';
import { createProgressionChord } from '../core/ProgressionEngine.js';

/**
 * useHarmonyMap — Hook principal del módulo HarmonyMap.
 *
 * @returns {{
 *   nodes: ChordNode[],
 *   relations: ChordRelation[],
 *   activeChord: ChordNode|null,
 *   suggestions: Array<{node, relation}>,
 *   predecessors: Array<{node, relation}>,
 *   relativeKey: string|null,
 *   parallelKey: {root, scaleName}|null,
 *   neighborKeys: {dominant, subdominant},
 *   commonProgressions: Array<{name, chords}>,
 *   handleSelectChord: (node: ChordNode) => void,
 *   handleClearChord: () => void,
 *   handleAddToProgression: (node: ChordNode) => void,
 *   getRelationBetween: (fromDegree: number, toDegree: number) => ChordRelation|null,
 * }}
 */
export function useHarmonyMap() {
  const {
    rootNote, scaleName,
    activeChord, setActiveChord,
    progression, setProgression,
  } = useMusicContext();

  const { playChord } = useAudioEngine();

  // ── Datos del grafo — memoizados por tonalidad ─────────────────────────────

  const nodes = useMemo(
    () => buildHarmonyNodes(rootNote, scaleName),
    [rootNote, scaleName]
  );

  const relations = useMemo(
    () => buildHarmonyRelations(rootNote, scaleName),
    [rootNote, scaleName]
  );

  const suggestions = useMemo(
    () => activeChord
      ? getSuggestions(activeChord.degree, rootNote, scaleName)
      : [],
    [activeChord, rootNote, scaleName]
  );

  const predecessors = useMemo(
    () => activeChord
      ? getPredecessors(activeChord.degree, rootNote, scaleName)
      : [],
    [activeChord, rootNote, scaleName]
  );

  const relativeKey = useMemo(
    () => getRelativeKey(rootNote, scaleName),
    [rootNote, scaleName]
  );

  const parallelKey = useMemo(
    () => getParallelKey(rootNote, scaleName),
    [rootNote, scaleName]
  );

  const neighborKeys = useMemo(
    () => getNeighborKeys(rootNote),
    [rootNote]
  );

  const commonProgressions = useMemo(
    () => getCommonProgressions(rootNote, scaleName),
    [rootNote, scaleName]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Selecciona un acorde y reproduce sus notas.
   * @param {ChordNode} node
   */
  const handleSelectChord = useCallback((node) => {
    setActiveChord(node);
    playChord(node.notes, 4);
  }, [setActiveChord, playChord]);

  /**
   * Limpia el acorde activo.
   */
  const handleClearChord = useCallback(() => {
    setActiveChord(null);
  }, [setActiveChord]);

  /**
   * Agrega el acorde activo a la progresión.
   * Lo normaliza a ProgressionChord (con beats/octave) para que sea
   * reproducible por ProgressionPlayer.
   * @param {ChordNode} node
   */
  const handleAddToProgression = useCallback((node) => {
    setProgression((prev) => [...prev, createProgressionChord(node)]);
  }, [setProgression]);

  /**
   * Carga una progresión completa (ej. un preset de "progresiones comunes"),
   * normalizando cada acorde a ProgressionChord.
   * @param {ChordNode[]} chords
   */
  const handleLoadProgression = useCallback((chords) => {
    setProgression(chords.map((c) => createProgressionChord(c)));
  }, [setProgression]);

  /**
   * Retorna la relación directa entre dos grados.
   * @param {number} fromDegree
   * @param {number} toDegree
   * @returns {ChordRelation|null}
   */
  const getRelationBetween = useCallback((fromDegree, toDegree) => {
    return getRelation(fromDegree, toDegree);
  }, []);

  return {
    nodes,
    relations,
    activeChord,
    suggestions,
    predecessors,
    relativeKey,
    parallelKey,
    neighborKeys,
    commonProgressions,
    progression,
    handleSelectChord,
    handleClearChord,
    handleAddToProgression,
    handleLoadProgression,
    getRelationBetween,
  };
}
