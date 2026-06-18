import React, { useState, useCallback } from 'react';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { useAudioEngine } from '../../hooks/useAudioEngine.js';
import { getScale, noteFreq } from '../../core/MusicTheory.js';
import '../../styles/modules/piano.css';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const BLACK_KEY_DEFS = [
  { note: 'C#', wIdx: 1 },
  { note: 'D#', wIdx: 2 },
  { note: 'F#', wIdx: 4 },
  { note: 'G#', wIdx: 5 },
  { note: 'A#', wIdx: 6 },
];

const WHITE_KEY_W = 28;
const OCTAVES = [3, 4, 5];

export default function Piano() {
  const { rootNote, scaleName } = useMusicContext();
  const { playTone } = useAudioEngine();
  const [pressedKey, setPressedKey] = useState(null);

  const scaleNotes = getScale(rootNote, scaleName);

  const handleKeyDown = useCallback((note, octave, e) => {
    e.preventDefault();
    const freq = noteFreq(note, octave);
    playTone(freq, 0.8, 'triangle', 0.5);
    setPressedKey({ note, octave });
  }, [playTone]);

  const handleKeyUp = useCallback(() => {
    setPressedKey(null);
  }, []);

  const isScaleNote = (note) => scaleNotes.includes(note);
  const isRootNote  = (note) => note === rootNote;
  const isPressed   = (note, octave) =>
    pressedKey !== null && pressedKey.note === note && pressedKey.octave === octave;

  const whiteKeys = OCTAVES.flatMap((oct) =>
    WHITE_KEYS.map((note) => ({ note, octave: oct })),
  );

  const blackKeys = OCTAVES.flatMap((oct, octIdx) =>
    BLACK_KEY_DEFS.map(({ note, wIdx }) => ({
      note,
      octave: oct,
      left: (octIdx * 7 + wIdx) * WHITE_KEY_W - 8,
    })),
  );

  function keyClasses(base, note, octave) {
    const cls = [base];
    if (isRootNote(note))        cls.push('root-note');
    else if (isScaleNote(note))  cls.push('scale-note');
    if (isPressed(note, octave)) cls.push('pressed');
    return cls.join(' ');
  }

  return (
    <div className="piano-module">

      <div className="piano-body">
        <div className="piano-brand">Harmony Lab Pro</div>
        <div className="piano-keys">

          {whiteKeys.map(({ note, octave }) => (
            <div
              key={`w-${note}${octave}`}
              className={keyClasses('piano-key-white', note, octave)}
              onMouseDown={(e) => handleKeyDown(note, octave, e)}
              onMouseUp={handleKeyUp}
              onMouseLeave={handleKeyUp}
              onTouchStart={(e) => handleKeyDown(note, octave, e)}
              onTouchEnd={handleKeyUp}
            >
              {note === 'C' && (
                <span className="piano-key-label">{note}{octave}</span>
              )}
            </div>
          ))}

          {blackKeys.map(({ note, octave, left }) => (
            <div
              key={`b-${note}${octave}`}
              className={keyClasses('piano-key-black', note, octave)}
              style={{ left: `${left}px` }}
              onMouseDown={(e) => handleKeyDown(note, octave, e)}
              onMouseUp={handleKeyUp}
              onMouseLeave={handleKeyUp}
              onTouchStart={(e) => handleKeyDown(note, octave, e)}
              onTouchEnd={handleKeyUp}
            />
          ))}

        </div>
      </div>

      <div className="piano-info-strip">
        <div className="piano-info-note">
          {pressedKey ? `${pressedKey.note}${pressedKey.octave}` : '—'}
        </div>
        <div className="piano-info-freq">
          {pressedKey
            ? `${noteFreq(pressedKey.note, pressedKey.octave).toFixed(1)} Hz`
            : ''}
        </div>
        <div className="piano-info-scale">
          {rootNote} {scaleName}
        </div>
      </div>

    </div>
  );
}
