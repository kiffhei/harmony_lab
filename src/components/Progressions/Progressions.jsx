import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { useAudioEngine } from '../../hooks/useAudioEngine.js';
import { exportProgression } from '../../core/MidiExport.js';
import '../../styles/modules/progressions.css';

const QUALITY_SUFFIX = { maj: '', min: 'm', dim: '°', aug: '+' };

export default function Progressions() {
  const { progression, setProgression, bpm } = useMusicContext();
  const { playChord } = useAudioEngine();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);
  const intervalRef               = useRef(null);
  const idxRef                    = useRef(0);

  const beatMs = Math.round(60000 / bpm) * 4;

  const stopPlayback = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
    setActiveIdx(null);
    idxRef.current = 0;
  }, []);

  const startPlayback = useCallback(() => {
    if (progression.length === 0) return;
    setIsPlaying(true);
    idxRef.current = 0;

    const step = () => {
      const chord = progression[idxRef.current];
      if (chord) {
        setActiveIdx(idxRef.current);
        playChord(chord.notes || [], 4);
      }
      idxRef.current = (idxRef.current + 1) % progression.length;
    };

    step();
    intervalRef.current = setInterval(step, beatMs);
  }, [progression, playChord, beatMs]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isPlaying && progression.length === 0) {
      stopPlayback();
    }
  }, [progression, isPlaying, stopPlayback]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  }, [isPlaying, startPlayback, stopPlayback]);

  const handleDelete = useCallback((idx) => {
    setProgression(progression.filter((_, i) => i !== idx));
  }, [progression, setProgression]);

  const handleExport = useCallback(() => {
    if (progression.length === 0) return;
    exportProgression(
      progression.map((c) => ({ notes: c.notes || [], octave: 4, beats: 4 })),
      bpm,
    );
  }, [progression, bpm]);

  return (
    <div className="progressions-module">

      <div className="prog-controls">
        <button
          data-testid="prog-play-btn"
          className="btn btn-primary"
          onClick={handleTogglePlay}
          disabled={progression.length === 0}
          aria-label={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>

        <button
          data-testid="prog-export-btn"
          className="btn btn-ghost"
          onClick={handleExport}
          disabled={progression.length === 0}
          aria-label="Export MIDI"
        >
          ↓ MIDI
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => setProgression([])}
          disabled={progression.length === 0}
          aria-label="Clear progression"
        >
          ✕ Clear
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
              key={idx}
              className={`prog-chord-card${activeIdx === idx ? ' playing' : ''}`}
            >
              {activeIdx === idx && (
                <div className="prog-playhead-indicator" />
              )}
              <div className="prog-chord-roman">{chord.roman}</div>
              <div className="prog-chord-name">
                {chord.root}{QUALITY_SUFFIX[chord.quality] ?? ''}
              </div>
              <button
                className="prog-chord-delete"
                onClick={() => handleDelete(idx)}
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
