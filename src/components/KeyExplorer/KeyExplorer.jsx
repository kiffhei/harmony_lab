import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTES, getScale, getDiatonic, getScaleNames } from '../../core/MusicTheory.js';
import { createProgressionChord } from '../../core/ProgressionEngine.js';
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

export const SCALE_MOOD = {
  'Major': {
    label: 'Alegría · Confianza',
    desc:  'Energía solar, resolución, victoria',
    color: '#f59e0b',
    refs:  'Beethoven 9ª · Pop · Himnos',
  },
  'Minor': {
    label: 'Melancolía · Introspección',
    desc:  'Tristeza elegante, profundidad emocional',
    color: '#6366f1',
    refs:  'Chopin · R&B · Neo-soul',
  },
  'Harmonic Minor': {
    label: 'Tensión · Drama',
    desc:  'Suspenso, pasión intensa, conflicto',
    color: '#dc2626',
    refs:  'Flamenco · Metal sinfónico · Cine',
  },
  'Dorian': {
    label: 'Serenidad · Groove',
    desc:  'Minor con luz, fluidez, apertura',
    color: '#0ea5e9',
    refs:  'Miles Davis · Funk · Deep house',
  },
  'Phrygian': {
    label: 'Misterio · Oscuridad',
    desc:  'Exótico, amenazante, tierra árida',
    color: '#b45309',
    refs:  'Flamenco puro · Metal extremo · Glass Beams (Mahal)',
  },
  'Lydian': {
    label: 'Ensueño · Maravilla',
    desc:  'Flotante, etéreo, ciencia ficción',
    color: '#a78bfa',
    refs:  'John Williams · Joe Satriani · Dream pop',
  },
  'Mixolydian': {
    label: 'Euforia · Fiesta',
    desc:  'Mayor con tensión blues, apertura festiva',
    color: '#16a34a',
    refs:  'Rock clásico · Reggae · Blues-rock',
  },
  'Pentatonic Maj': {
    label: 'Libertad · Apertura',
    desc:  'Universal, sin tensión, folk del mundo',
    color: '#f97316',
    refs:  'Country · Folk · Pop universal',
  },
  'Pentatonic Min': {
    label: 'Blues · Resiliencia',
    desc:  'Grit, expresión cruda, alma urbana',
    color: '#0d9488',
    refs:  'Blues · Hip-hop · Reggae',
  },
  'Blues': {
    label: 'Angustia · Catarsis',
    desc:  'La nota blue, dolor consciente',
    color: '#1d4ed8',
    refs:  'Blues clásico · Jazz · Soul · Boom bap',
  },
  'Double Harmonic': {
    label: 'Espiritualidad · Amanecer',
    desc:  'Raga Bhairav — solemne, devocional, antiguo',
    color: '#c026d3',
    refs:  'Glass Beams · Música india clásica · Bollywood',
    note:  'Equivalente occidental del Raga Bhairav (Glass Beams)',
  },
  'Phrygian Dominant': {
    label: 'Hipnosis · Psicodelia',
    desc:  'Makam Hüseyni en 12 tonos — envolvente, sin fin',
    color: '#ea580c',
    refs:  'King Gizzard (proxy microtonal) · Música turca · Anatolian rock',
    note:  'Aproximación en 12 tonos al makam Hüseyni de King Gizzard',
  },
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

// ── MoodBanner ────────────────────────────────────────────────────────────────

function MoodBanner({ scaleName }) {
  const mood = SCALE_MOOD[scaleName];
  if (!mood) return null;

  return (
    <motion.div
      key={scaleName}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="key-mood-banner"
      style={{ '--mood-color': mood.color }}
    >
      <div className="key-mood-header">
        <span className="key-mood-label">{mood.label}</span>
        {mood.note && (
          <span className="key-mood-note">{mood.note}</span>
        )}
      </div>
      <p className="key-mood-desc">{mood.desc}</p>
      <p className="key-mood-refs">{mood.refs}</p>
    </motion.div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function KeyExplorer() {
  const {
    rootNote,    setRootNote,
    scaleName,   setScaleName,
    activeChord, setActiveChord,
    setProgression,
  } = useMusicContext();

  function handleAddToProgression(chord) {
    setProgression((prev) => [...prev, createProgressionChord(chord)]);
  }

  const scaleNotes = useMemo(() => getScale(rootNote, scaleName),    [rootNote, scaleName]);
  const diatonic   = useMemo(() => getDiatonic(rootNote, scaleName), [rootNote, scaleName]);
  const scaleSet   = useMemo(() => new Set(scaleNotes),              [scaleNotes]);
  const scaleNames = useMemo(() => getScaleNames(), []);

  // Actualiza --active-scale-color con el color emocional de la escala activa
  useEffect(() => {
    const mood = SCALE_MOOD[scaleName];
    if (mood) {
      document.documentElement.style.setProperty('--active-scale-color', mood.color);
    }
    return () => {
      document.documentElement.style.removeProperty('--active-scale-color');
    };
  }, [scaleName]);

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
    <div
      className="key-explorer-module"
      style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 'var(--s-4)',
        padding:             'var(--s-4)',
        height:              '100%',
        minHeight:           0,
        alignItems:          'start',
      }}
    >
      {/* Background reactivo a --active-key-color + --active-scale-color */}
      <div className="key-tonality-bg" aria-hidden="true" />

      {/* ── COLUMNA IZQUIERDA — solo el SVG ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', paddingTop: 'var(--s-3)' }}>
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
                  fill:        'rgba(245,158,11,0.15)',
                  stroke:      'var(--c-amber)',
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
      </div>

      {/* ── COLUMNA DERECHA — selectores + info ───────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', height: '100%', minHeight: 0, overflowY: 'auto', paddingRight: 'var(--s-2)' }}>

        {/* Selectores */}
        <div className="key-explorer-selectors">
          <div className="flex flex-col gap-[var(--s-1)] flex-1 min-w-0">
            <label
              htmlFor="ke-root"
              className="font-[family-name:var(--font-condensed)] text-[length:var(--text-2xs)] font-semibold tracking-[var(--ls-wide)] uppercase text-[var(--c-text-secondary)]"
            >
              ROOT NOTE
            </label>
            <select
              id="ke-root"
              name="ke-root"
              className="select w-full"
              value={rootNote}
              aria-label="Root note"
              onChange={(e) => setRootNote(e.target.value)}
            >
              {NOTES.map((note) => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-[var(--s-1)] flex-1 min-w-0">
            <label
              htmlFor="ke-scale"
              className="font-[family-name:var(--font-condensed)] text-[length:var(--text-2xs)] font-semibold tracking-[var(--ls-wide)] uppercase text-[var(--c-text-secondary)]"
            >
              SCALE
            </label>
            <select
              id="ke-scale"
              name="ke-scale"
              className="select w-full"
              value={scaleName}
              aria-label="Scale"
              onChange={(e) => setScaleName(e.target.value)}
            >
              {scaleNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MoodBanner */}
        <MoodBanner scaleName={scaleName} />

        {/* Scale notes chips */}
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

        {/* Degrees table */}
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
                  {isActive && (
                    <button
                      className="text-[var(--c-amber)] text-xs font-semibold hover:opacity-80 transition-opacity ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToProgression(chord);
                      }}
                      aria-label={`Agregar ${chord.root}${suffix} a la progresión`}
                    >
                      + Agregar a progresión
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

KeyExplorer.propTypes = {};
