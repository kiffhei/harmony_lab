import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTES, getScale, getDiatonic, getScaleNames } from '../../core/MusicTheory.js';
import { useMusicContext } from '../../hooks/useMusicContext.js';

// ── Constantes ────────────────────────────────────────────────────────────────

const COF_ORDER   = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
const COF_CENTER  = 160;
const COF_RADIUS  = 120;
const NODE_RADIUS = 18;

const NOTE_TO_CSS_VAR = {
  'C':  '--key-C',  'G':  '--key-G',  'D':  '--key-D',
  'A':  '--key-A',  'E':  '--key-E',  'B':  '--key-B',
  'F#': '--key-Fs', 'C#': '--key-Cs', 'G#': '--key-Gs',
  'D#': '--key-Ds', 'A#': '--key-As', 'F':  '--key-F',
};

const QUALITY_SUFFIX = { maj: '', min: 'm', dim: '°', aug: '+' };

const DEGREE_FUNCTION = {
  'I':    'Tónica',
  'ii':   'Subdominante',
  'iii':  'Mediante',
  'IV':   'Subdominante',
  'V':    'Dominante',
  'vi':   'Relativa',
  'vii°': 'Sensible',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function cofPosition(index) {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return {
    cx: COF_CENTER + COF_RADIUS * Math.cos(angle),
    cy: COF_CENTER + COF_RADIUS * Math.sin(angle),
  };
}

function noteColor(note) {
  return `var(${NOTE_TO_CSS_VAR[note]})`;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function KeyExplorer() {
  const {
    rootNote,    setRootNote,
    scaleName,   setScaleName,
    activeChord, setActiveChord,
  } = useMusicContext();

  const scaleNotes = useMemo(() => getScale(rootNote, scaleName),    [rootNote, scaleName]);
  const diatonic   = useMemo(() => getDiatonic(rootNote, scaleName), [rootNote, scaleName]);
  const scaleSet   = useMemo(() => new Set(scaleNotes),              [scaleNotes]);
  const scaleNames = useMemo(() => getScaleNames(), []);

  // Polilínea que conecta los nodos en-escala en orden de la escala
  const scaleLinePoints = useMemo(() => {
    const pts = scaleNotes.map((note) => {
      const i = COF_ORDER.indexOf(note);
      const { cx, cy } = cofPosition(i);
      return `${cx.toFixed(2)},${cy.toFixed(2)}`;
    });
    if (pts.length < 2) return '';
    return [...pts, pts[0]].join(' ');
  }, [scaleNotes]);

  return (
    <div className="key-explorer-module">

      {/* Background reactivo a --active-key-color */}
      <div className="key-tonality-bg" aria-hidden="true" />

      {/* ── Sección 1 — Selectores ─────────────────────────────────────── */}
      <div className="key-explorer-selectors">
        <select
          className="select"
          value={rootNote}
          aria-label="Root note"
          onChange={(e) => setRootNote(e.target.value)}
        >
          {NOTES.map((note) => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>

        <select
          className="select"
          value={scaleName}
          aria-label="Scale name"
          onChange={(e) => setScaleName(e.target.value)}
        >
          {scaleNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* ── Sección 2 — Circle of Fifths ──────────────────────────────── */}
      <div className="circle-of-fifths-wrapper">
        <svg
          viewBox="0 0 320 320"
          className="circle-of-fifths-svg"
          data-testid="cof-svg"
        >
          {/* Anillos orbitales decorativos */}
          <circle cx="160" cy="160" r="130" className="cof-orbit-outer" />
          <circle cx="160" cy="160" r="110" className="cof-orbit-inner" />

          {/* Líneas de escala */}
          {scaleLinePoints && (
            <polyline
              points={scaleLinePoints}
              className="cof-scale-line visible"
            />
          )}

          {/* Nodos de notas */}
          {COF_ORDER.map((note, i) => {
            const { cx, cy } = cofPosition(i);
            const isActive  = note === rootNote;
            const isInScale = scaleSet.has(note);
            const nodeClass = [
              'cof-note-node',
              isActive  ? 'active'   : '',
              isInScale ? 'in-scale' : 'out-scale',
            ].filter(Boolean).join(' ');
            const color = noteColor(note);

            return (
              <g
                key={note}
                className={nodeClass}
                onClick={() => setRootNote(note)}
                data-testid={`cof-node-${note}`}
                role="button"
                aria-label={`Set root note to ${note}`}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS}
                  className="cof-note-circle"
                  style={{ fill: color, stroke: color }}
                />
                <text x={cx} y={cy} className="cof-note-text">
                  {note}
                </text>
              </g>
            );
          })}

          {/* Nodo central — spring animation al cambiar rootNote */}
          <motion.g
            key={rootNote}
            transform={`translate(${COF_CENTER}, ${COF_CENTER})`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ originX: 0, originY: 0 }}
          >
            <circle
              cx={0}
              cy={0}
              r={28}
              className="cof-center-circle"
              style={{
                fill:   'rgba(245,158,11,0.15)',
                stroke: 'var(--c-amber)',
                strokeWidth: 1.5,
              }}
            />
            <text className="cof-center-text" textAnchor="middle">
              <tspan x={0} dy="-4" fontSize="14" fontWeight="800">
                {rootNote}
              </tspan>
              <tspan x={0} dy="13" fontSize="9">
                {scaleName.length > 8 ? scaleName.slice(0, 8) : scaleName}
              </tspan>
            </text>
          </motion.g>
        </svg>
      </div>

      {/* ── Sección 3 — Chips de notas de la escala ───────────────────── */}
      <div className="key-explorer-scale-notes">
        <AnimatePresence mode="popLayout">
          {diatonic.map((chord, index) => (
            <motion.button
              key={`chip-${chord.root}-${index}`}
              className={`key-note-chip${chord.root === rootNote ? ' active' : ''}`}
              onClick={() => setRootNote(chord.root)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <span className="key-note-chip-name">{chord.root}</span>
              <span className="key-note-chip-degree">{chord.roman}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Sección 4 — Tabla de grados diatónicos ────────────────────── */}
      <div className="key-explorer-degrees">
        <AnimatePresence mode="popLayout">
          {diatonic.map((chord, index) => {
            const suffix   = QUALITY_SUFFIX[chord.quality] ?? '';
            const harmFunc = DEGREE_FUNCTION[chord.roman]  ?? '';
            const isActive = activeChord?.roman === chord.roman;

            return (
              <motion.div
                key={`row-${chord.root}-${index}`}
                className={`key-degree-row${isActive ? ' active' : ''}`}
                role="button"
                onClick={() => setActiveChord({
                  root:    chord.root,
                  quality: chord.quality,
                  roman:   chord.roman,
                  notes:   chord.notes,
                })}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <span className="key-degree-roman">{chord.roman}</span>
                <span className="key-degree-chord">{chord.root}{suffix}</span>
                <span className="key-degree-function">{harmFunc}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}

KeyExplorer.propTypes = {};
