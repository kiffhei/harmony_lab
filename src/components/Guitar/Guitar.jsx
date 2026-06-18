import React, { useState, useCallback } from 'react';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { useAudioEngine } from '../../hooks/useAudioEngine.js';
import { getScale, noteFreq } from '../../core/MusicTheory.js';
import '../../styles/modules/guitar.css';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STRINGS = [
  { note: 'E', octave: 2, label: 'E2' },
  { note: 'A', octave: 2, label: 'A2' },
  { note: 'D', octave: 3, label: 'D3' },
  { note: 'G', octave: 3, label: 'G3' },
  { note: 'B', octave: 3, label: 'B3' },
  { note: 'E', octave: 4, label: 'E4' },
];

const MARKER_FRETS = new Set([3, 5, 7, 9]);
const DOUBLE_FRETS = new Set([12]);

function getNoteAtFret(stringNote, stringOctave, fret) {
  const openMidi = (stringOctave + 1) * 12 + NOTES.indexOf(stringNote);
  const fretMidi = openMidi + fret;
  return {
    note:   NOTES[fretMidi % 12],
    octave: Math.floor(fretMidi / 12) - 1,
  };
}

export default function Guitar() {
  const { rootNote, scaleName } = useMusicContext();
  const { playTone } = useAudioEngine();
  const [playingCell, setPlayingCell] = useState(null);
  const [lastPlayed,  setLastPlayed]  = useState(null);

  const scaleNotes = getScale(rootNote, scaleName);

  const handleCellClick = useCallback((stringIdx, fret) => {
    const { note, octave } = getNoteAtFret(
      STRINGS[stringIdx].note,
      STRINGS[stringIdx].octave,
      fret,
    );
    const freq = noteFreq(note, octave);
    playTone(freq, 0.5, 'triangle', 0.5);
    const cellKey = `${stringIdx}-${fret}`;
    setPlayingCell(cellKey);
    setLastPlayed({ note, octave, string: stringIdx, fret });
    setTimeout(() => setPlayingCell(prev => prev === cellKey ? null : prev), 500);
  }, [playTone]);

  return (
    <div className="guitar-module">

      <div className="guitar-neck">
        <div className="guitar-nut" />
        <div className="guitar-strings">
          {STRINGS.map((str, sIdx) => (
            <div
              key={`string-${sIdx}`}
              className={`guitar-string-row string-${sIdx}`}
            >
              <span className="guitar-string-label">{str.label}</span>
              <div className="guitar-fret-cells">
                {Array.from({ length: 12 }, (_, i) => {
                  const fret    = i + 1;
                  const cellKey = `${sIdx}-${fret}`;
                  const { note } = getNoteAtFret(str.note, str.octave, fret);
                  const isRoot  = note === rootNote;
                  const isScale = scaleNotes.includes(note);
                  const isPlay  = playingCell === cellKey;

                  const cls = ['guitar-cell'];
                  if (isRoot)       cls.push('root-note');
                  else if (isScale) cls.push('scale-note');
                  if (isPlay)       cls.push('playing');

                  return (
                    <div
                      key={cellKey}
                      className={cls.join(' ')}
                      onClick={() => handleCellClick(sIdx, fret)}
                    >
                      <div className="guitar-cell-dot">
                        {(isRoot || isScale) ? note : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="guitar-position-markers">
          {Array.from({ length: 12 }, (_, i) => {
            const fret     = i + 1;
            const isDouble = DOUBLE_FRETS.has(fret);
            const hasMark  = MARKER_FRETS.has(fret) || isDouble;
            return (
              <div
                key={fret}
                className={`guitar-pos-marker${isDouble ? ' double' : ''}`}
              >
                {hasMark && <div className="guitar-pos-dot" />}
                {isDouble && <div className="guitar-pos-dot" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="guitar-fret-labels">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i + 1} className="guitar-fret-label">{i + 1}</div>
        ))}
      </div>

      <div className="guitar-info">
        {lastPlayed ? (
          <>
            <div className="guitar-info-chord">
              {lastPlayed.note}{lastPlayed.octave}
            </div>
            <div className="guitar-info-position">
              <span>String </span>
              <span className="pos-value">{lastPlayed.string + 1}</span>
              <span> · Fret </span>
              <span className="pos-value">{lastPlayed.fret}</span>
            </div>
          </>
        ) : (
          <>
            <div className="guitar-info-chord">—</div>
            <div className="guitar-info-position">
              <span>{rootNote} {scaleName}</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
