import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { patternFromHitCodes, INSTRUMENTS } from '../../core/SequencerEngine.js';
import { DRUM_PATTERNS } from './drumPatternsData.js';
import '../../styles/modules/pattern-library.css';

// Preview compacta — solo las filas más representativas (no las 12) para
// mantener las 242 cards livianas de renderizar.
const PREVIEW_INSTRUMENTS = ['kick', 'snare', 'hh_c', 'hh_o', 'clap', 'shaker'];
const PREVIEW_STEP_CLS    = { kick: 'kick', snare: 'snare', hh_c: 'hh', hh_o: 'hh', clap: 'clap', shaker: 'shaker' };

const STRIPE_CLASSES = [
  'stripe-hiphop', 'stripe-house', 'stripe-reggae', 'stripe-jazz',
  'stripe-dnb', 'stripe-techno', 'stripe-trap', 'stripe-latin',
];
const FILTER_CLASSES = [
  'active-hiphop', 'active-house', 'active-reggae',
  'active-jazz', 'active-dnb', 'active-techno',
];

// Géneros reales encontrados en la fuente, en el orden en que aparecen
// (agrupación temática del libro, no alfabética).
const GENRES = ['All', ...new Set(DRUM_PATTERNS.map((p) => p.genre))];

function genreClass(genre, palette) {
  const idx = GENRES.indexOf(genre) - 1; // -1 porque GENRES[0] es 'All'
  return palette[((idx % palette.length) + palette.length) % palette.length];
}

const PRESET_PATTERNS = DRUM_PATTERNS.map((p, i) => ({
  id:      `${p.genre}-${i}`,
  name:    p.name,
  genre:   p.genre,
  pattern: patternFromHitCodes(p.hits),
}));

function MiniGrid({ pattern }) {
  return (
    <div className="pattern-mini-grid">
      {PREVIEW_INSTRUMENTS.map((name) => {
        const row = pattern[INSTRUMENTS.indexOf(name)];
        return (
          <div key={name} className="pattern-mini-row">
            {row.map((active, step) => (
              <div
                key={step}
                className={`pattern-mini-step${active ? ` ${PREVIEW_STEP_CLS[name]}` : ''}`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

MiniGrid.propTypes = {
  pattern: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
};

export default function PatternLibrary() {
  const { setPattern } = useMusicContext();

  const [activeGenre, setActiveGenre] = useState('All');
  const [selectedId,  setSelectedId]  = useState(null);

  const visible = useMemo(
    () => activeGenre === 'All'
      ? PRESET_PATTERNS
      : PRESET_PATTERNS.filter((p) => p.genre === activeGenre),
    [activeGenre],
  );

  function handleLoad(preset) {
    setSelectedId(preset.id);
    setPattern(preset.pattern);
  }

  return (
    <div className="pattern-library-module">

      <div className="pattern-library-header">
        <div className="pattern-filters">
          {GENRES.map((g) => {
            const isActive  = activeGenre === g;
            const activeCls = isActive && g !== 'All' ? ` ${genreClass(g, FILTER_CLASSES)}` : '';
            const allCls    = isActive && g === 'All' ? ' active-all' : '';
            return (
              <button
                key={g}
                className={`pattern-filter-btn${activeCls}${allCls}`}
                onClick={() => setActiveGenre(g)}
                aria-pressed={isActive}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="pattern-library-empty">
          <p className="pattern-library-empty-text">Sin patrones para este género</p>
        </div>
      ) : (
        <div className="pattern-grid">
          {visible.map((preset) => (
            <div
              key={preset.id}
              className={`pattern-card${selectedId === preset.id ? ' selected' : ''}`}
              role="article"
              aria-label={preset.name}
            >
              <div className={`pattern-card-stripe ${genreClass(preset.genre, STRIPE_CLASSES)}`} />
              <div className="pattern-card-header">
                <span className="pattern-card-genre">{preset.genre}</span>
              </div>
              <p className="pattern-card-name">{preset.name}</p>
              <MiniGrid pattern={preset.pattern} />
              <div className="pattern-card-footer">
                <button
                  className="pattern-load-btn"
                  onClick={() => handleLoad(preset)}
                  aria-label={`Cargar ${preset.name}`}
                >
                  Cargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
