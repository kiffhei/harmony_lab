import React from 'react';
import { useProgressions } from '../../hooks/useProgressions.js';
import { useSessionTransport } from '../../hooks/useSessionTransport.js';
import { exportProgression } from '../../core/MidiExport.js';
import '../../styles/modules/progressions.css';

const QUALITY_SUFFIX = { maj: '', min: 'm', dim: '°', aug: '+' };

export default function Progressions() {
  const {
    progression,
    activeIndex,
    loop,
    bpm,
    handleRemoveChord,
    handleClear,
    handleToggleLoop,
    getMidiFormat,
  } = useProgressions();

  const { isSessionPlaying, toggleAll } = useSessionTransport();

  const handleExportMidi = () => {
    if (progression.length === 0) return;
    exportProgression(getMidiFormat(), bpm);
  };

  return (
    <div className="progressions-module">

      <div className="prog-controls">
        <button
          data-testid="prog-play-btn"
          className="btn btn-primary"
          onClick={toggleAll}
          disabled={progression.length === 0}
          aria-label={isSessionPlaying ? 'Stop' : 'Play'}
        >
          {isSessionPlaying ? '■ Stop' : '▶ Play'}
        </button>

        <button
          data-testid="prog-export-btn"
          className="btn btn-ghost"
          onClick={handleExportMidi}
          disabled={progression.length === 0}
          aria-label="Export MIDI"
        >
          ↓ MIDI
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleClear}
          disabled={progression.length === 0}
          aria-label="Clear progression"
        >
          ✕ Clear
        </button>

        <button
          className={`btn btn-ghost${loop ? ' active' : ''}`}
          onClick={handleToggleLoop}
          aria-pressed={loop}
          aria-label="Toggle loop"
        >
          ↻ Loop
        </button>

        <div className="prog-tempo-display">
          <span className="prog-tempo-value">{bpm}</span>
          <span className="prog-tempo-label">BPM</span>
        </div>
      </div>

      <div className="prog-slots">
        {progression.length === 0 ? (
          <div
            data-testid="prog-empty"
            style={{
              color:    'var(--c-dim)',
              padding:  'var(--s-4)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Agrega acordes desde Harmony Map →
          </div>
        ) : (
          progression.map((chord, idx) => (
            <div
              key={chord.id ?? idx}
              className={`prog-chord-card${activeIndex === idx ? ' playing' : ''}`}
            >
              {activeIndex === idx && (
                <div className="prog-playhead-indicator" />
              )}
              <div className="prog-chord-roman">{chord.roman}</div>
              <div className="prog-chord-name">
                {chord.root}{QUALITY_SUFFIX[chord.quality] ?? ''}
              </div>
              <button
                className="prog-chord-delete"
                onClick={() => handleRemoveChord(chord.id)}
                aria-label={`Remove ${chord.root}`}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
