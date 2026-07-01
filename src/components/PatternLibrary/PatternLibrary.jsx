import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import '../../styles/modules/pattern-library.css';

// INSTRUMENTS order: kick=0 snare=1 hh_c=2 hn_o=3 clap=4 tom1=5 tom2=6 shaker=7
const MINI_STEP_CLS = ['kick', 'snare', 'hh', 'hh', 'clap', 'tom', 'tom', ''];

function makePattern(steps) {
  const IDX = { kick: 0, snare: 1, hh_c: 2, hn_o: 3, clap: 4, tom1: 5, tom2: 6, shaker: 7 };
  const p = Array.from({ length: 8 }, () => Array(16).fill(false));
  Object.entries(steps).forEach(([inst, active]) => {
    const i = IDX[inst];
    if (i !== undefined) active.forEach((s) => { p[i][s] = true; });
  });
  return p;
}

const PRESET_PATTERNS = [
  {
    id: 'four-on-floor', name: '4 on the Floor', genre: 'House', bpm: 128,
    pattern: makePattern({ kick: [0,4,8,12], hh_c: [0,2,4,6,8,10,12,14] }),
  },
  {
    id: 'boom-bap', name: 'Boom Bap', genre: 'Hip-Hop', bpm: 90,
    pattern: makePattern({ kick: [0,6,10], snare: [4,12], hh_c: [0,2,4,6,8,10,12,14] }),
  },
  {
    id: 'trap-808', name: 'Trap 808', genre: 'Trap', bpm: 140,
    pattern: makePattern({ kick: [0,3,6,9], snare: [4,12], hh_c: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }),
  },
  {
    id: 'techno-basic', name: 'Techno Basic', genre: 'Techno', bpm: 135,
    pattern: makePattern({ kick: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], hh_c: [0,4,8,12] }),
  },
  {
    id: 'dnb-amen', name: 'Jungle Break', genre: 'Drum & Bass', bpm: 174,
    pattern: makePattern({ kick: [0,2], snare: [4,14], hh_c: [0,2,4,6,8,10,12,14] }),
  },
  {
    id: 'boom-clap', name: 'Boom Clap', genre: 'House', bpm: 122,
    pattern: makePattern({ kick: [0,8], clap: [4,12], hh_c: [0,2,4,6,8,10,12,14] }),
  },
];

const GENRES = ['All', 'House', 'Hip-Hop', 'Trap', 'Techno', 'Drum & Bass'];

const GENRE_FILTER_CLS = {
  House:         'active-house',
  'Hip-Hop':     'active-hiphop',
  Trap:          'active-trap',
  Techno:        'active-techno',
  'Drum & Bass': 'active-dnb',
};

const GENRE_STRIPE_CLS = {
  House:         'stripe-house',
  'Hip-Hop':     'stripe-hiphop',
  Trap:          'stripe-trap',
  Techno:        'stripe-techno',
  'Drum & Bass': 'stripe-dnb',
};

function MiniGrid({ pattern }) {
  return (
    <div className="pattern-mini-grid">
      {pattern.map((row, instrIdx) => (
        <div key={instrIdx} className="pattern-mini-row">
          {row.map((active, step) => (
            <div
              key={step}
              className={`pattern-mini-step${active ? ` ${MINI_STEP_CLS[instrIdx]}` : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

MiniGrid.propTypes = {
  pattern: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
};

export default function PatternLibrary() {
  const { setPattern } = useMusicContext();

  const [activeGenre,  setActiveGenre]  = useState('All');
  const [selectedId,   setSelectedId]   = useState(null);

  const visible = activeGenre === 'All'
    ? PRESET_PATTERNS
    : PRESET_PATTERNS.filter((p) => p.genre === activeGenre);

  function handleLoad(preset) {
    setSelectedId(preset.id);
    setPattern(preset.pattern);
  }

  return (
    <div className="pattern-library-module">

      <div className="pattern-library-header">
        <div className="pattern-filters">
          {GENRES.map((g) => {
            const isActive = activeGenre === g;
            const activeCls = isActive && g !== 'All' ? ` ${GENRE_FILTER_CLS[g]}` : '';
            const baseCls = isActive && g === 'All' ? ' active-all' : '';
            return (
              <button
                key={g}
                className={`pattern-filter-btn${activeCls}${baseCls}`}
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
              <div
                className={`pattern-card-stripe ${GENRE_STRIPE_CLS[preset.genre] || ''}`}
              />
              <div className="pattern-card-header">
                <span className="pattern-card-genre">{preset.genre}</span>
                <span className="pattern-card-bpm">{preset.bpm} BPM</span>
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
