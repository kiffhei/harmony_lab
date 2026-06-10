import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarmonyMap } from '../../hooks/useHarmonyMap.js';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { getHarmonicFunction } from '../../core/HarmonyGraph.js';
import ChordNode from './ChordNode.jsx';
import '../../styles/modules/harmony-map.css';

// ── Constantes ────────────────────────────────────────────────────────────────

const QUALITY_SUFFIX = { maj: '', min: 'm', dim: '°', aug: '+' };

const FUNC_LABEL = { T: 'Tónica', S: 'Subdominante', D: 'Dominante' };

// ── Helpers ───────────────────────────────────────────────────────────────────

function nodePosition(index, total) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: 50 + 42 * Math.cos(angle),
    y: 48 + 36 * Math.sin(angle),
  };
}

function labelRelacion(type) {
  const MAP = {
    resolution:   '→ Resolución',
    preparation:  '→ Preparación',
    prolongation: '→ Prolongación',
    subdominant:  '→ Subdominante',
    deceptive:    '→ Cadencia rota',
  };
  return MAP[type] ?? '→ Movimiento';
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function HarmonyMap() {
  const {
    nodes,
    relations,
    activeChord,
    suggestions,
    progression,
    commonProgressions,
    handleSelectChord,
    handleAddToProgression,
  } = useHarmonyMap();

  const { setProgression } = useMusicContext();

  const nodesWithPos = useMemo(
    () => nodes.map((node, i) => ({ ...node, ...nodePosition(i, nodes.length) })),
    [nodes]
  );

  const progressionSet = useMemo(
    () => new Set(progression.map((c) => c.roman)),
    [progression]
  );

  const suggestionSet = useMemo(
    () => new Set(suggestions.map((s) => s.node.roman)),
    [suggestions]
  );

  const activeSuffix = activeChord ? (QUALITY_SUFFIX[activeChord.quality] ?? '') : '';
  const funcLabel    = activeChord
    ? (FUNC_LABEL[getHarmonicFunction(activeChord.degree)] ?? '')
    : '';

  return (
    <div className="harmony-module">
      {/* Background reactivo a --active-key-color */}
      <div
        className={`harmony-tonality-bg${activeChord ? ' active' : ''}`}
        aria-hidden="true"
      />

      {/* ── Canvas SVG ─────────────────────────────────────────────────── */}
      <div className="harmony-canvas" style={{ height: '340px', minHeight: '340px' }}>

        {/* Aristas entre nodos */}
        <svg
          className="harmony-edges-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          data-testid="harmony-edges"
        >
          {relations.map((rel, i) => {
            const from = nodesWithPos[rel.fromDegree];
            const to   = nodesWithPos[rel.toDegree];
            if (!from || !to) return null;

            const isLit = activeChord !== null && (
              rel.fromDegree === activeChord.degree ||
              rel.toDegree   === activeChord.degree
            );

            const edgeClass = [
              'harmony-edge',
              rel.type === 'resolution'  ? 'dominant'   : '',
              rel.type === 'preparation' ? 'subdominant' : '',
              isLit ? 'lit' : '',
            ].filter(Boolean).join(' ');

            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={edgeClass}
              />
            );
          })}
        </svg>

        {/* Nodos de acordes */}
        {nodesWithPos.map((node) => (
          <ChordNode
            key={node.roman}
            node={node}
            isActive={activeChord?.roman === node.roman}
            isSelected={progressionSet.has(node.roman)}
            isSuggested={suggestionSet.has(node.roman)}
            onClick={() => handleSelectChord(node)}
          />
        ))}
      </div>

      {/* ── Panel de info del acorde activo ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeChord && (
          <motion.div
            key={activeChord.roman}
            className="harmony-chord-info"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <span className="harmony-chord-name-display">
              {activeChord.root}{activeSuffix}
            </span>
            <div className="harmony-chord-notes">
              {activeChord.notes.map((note) => (
                <span key={note} className="harmony-note-pill active">
                  {note}
                </span>
              ))}
            </div>
            <span className="harmony-chord-function">{funcLabel}</span>
            <button
              className="text-[var(--c-amber)] text-xs font-semibold hover:opacity-80 transition-opacity ml-auto"
              onClick={() => handleAddToProgression(activeChord)}
            >
              + Agregar a progresión
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel de sugerencias ───────────────────────────────────────── */}
      <AnimatePresence>
        {activeChord && suggestions.length > 0 && (
          <motion.div
            key={`suggestions-${activeChord.roman}`}
            className="harmony-suggestions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <span className="harmony-suggestions-label">
              Movimientos desde {activeChord.roman}
            </span>
            <div className="harmony-suggestions-list">
              {suggestions.map(({ node, relation }) => {
                const suf = QUALITY_SUFFIX[node.quality] ?? '';
                return (
                  <button
                    key={node.roman}
                    className="harmony-suggestion-chip"
                    onClick={() => handleSelectChord(node)}
                  >
                    <span className="suggestion-roman">{node.roman}</span>
                    <span className="suggestion-name">{node.root}{suf}</span>
                    <span className="suggestion-relation">{labelRelacion(relation.type)}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progresiones comunes ────────────────────────────────────────── */}
      {commonProgressions.length > 0 && (
        <div className="harmony-common-progressions">
          <span className="harmony-section-label">Progresiones comunes</span>
          <div className="harmony-prog-presets">
            {commonProgressions.map((prog) => (
              <button
                key={prog.name}
                className="harmony-prog-preset"
                onClick={() => setProgression(prog.chords)}
              >
                <span className="preset-name">{prog.name}</span>
                <span className="preset-chords">
                  {prog.chords.map((c) => c.roman).join(' – ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Barra de progresión ─────────────────────────────────────────── */}
      <div className="harmony-progression-bar">
        {progression.length === 0 ? (
          <span className="harmony-prog-empty">
            — agrega acordes desde el mapa —
          </span>
        ) : (
          <>
            {progression.map((chord, index) => (
              <motion.div
                key={`${chord.roman}-${index}`}
                className={`harmony-prog-chord${activeChord?.roman === chord.roman ? ' current' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  const node = nodesWithPos.find((n) => n.roman === chord.roman);
                  if (node) handleSelectChord(node);
                }}
              >
                <span className="harmony-prog-chord-name">
                  {chord.root}{QUALITY_SUFFIX[chord.quality] ?? ''}
                </span>
              </motion.div>
            ))}
            <button
              onClick={() => setProgression([])}
              className="ml-auto text-[var(--c-dim)] hover:text-[var(--c-muted)] transition-colors text-sm leading-none"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}

HarmonyMap.propTypes = {};
