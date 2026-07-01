import React from 'react';
import { useTuner } from '../../hooks/useTuner.js';
import '../../styles/modules/tuner.css';

export default function Tuner() {
  const { state, start, stop, isActive } = useTuner();
  const { status, noteName, octave, cents, freq, inTune, tuning, error } = state;

  const tuningCls = inTune ? 'intune' : tuning === 'flat' ? 'flat' : tuning === 'sharp' ? 'sharp' : 'silent';

  const needleLeft = status === 'active'
    ? `${50 + (cents / 50) * 50}%`
    : '50%';

  function handleMicToggle() {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }

  return (
    <div className="tuner-module">

      <div className="tuner-display">
        <div className={`tuner-note-name ${tuningCls}`}>
          {noteName || '—'}
          {octave !== null && noteName && (
            <span className="tuner-octave">{octave}</span>
          )}
        </div>

        <div className="tuner-cents-display">
          <span className={`tuner-cents-value ${tuningCls}`}>
            {status === 'active' ? `${cents >= 0 ? '+' : ''}${cents}` : '0'}
          </span>
          <span className="tuner-cents-unit">cents</span>
        </div>
      </div>

      <div className="tuner-meter">
        <div className="tuner-meter-track">
          <div className="tuner-meter-center" />
          <div
            className={`tuner-meter-needle ${tuningCls}`}
            style={{ left: needleLeft }}
            aria-label={`Tuning needle at ${cents} cents`}
          />
        </div>
        <div className="tuner-meter-labels">
          <span className="tuner-meter-label">−50</span>
          <span className="tuner-meter-label">0</span>
          <span className="tuner-meter-label">+50</span>
        </div>
      </div>

      <div className={`tuner-freq-display${inTune ? ' intune' : ''}`}>
        <span className="freq-value">
          {status === 'active' ? freq.toFixed(1) : '—'}
        </span>
        <span className="freq-unit">Hz</span>
      </div>

      {error && (
        <p className="tuner-error" role="alert">{error}</p>
      )}

      {inTune && status === 'active' && (
        <p className="tuner-intune-badge" aria-live="polite">In Tune ✓</p>
      )}

      <button
        className={`tuner-mic-btn${isActive ? ' listening' : ''}`}
        onClick={handleMicToggle}
        aria-label={isActive ? 'Detener micrófono' : 'Iniciar micrófono'}
      >
        {isActive ? '⏹ Detener' : '🎙 Iniciar micrófono'}
      </button>

      <div className="tuner-reference">
        <span>Afinación de referencia</span>
        <span className="tuner-reference-value">A4 = 440 Hz</span>
      </div>

    </div>
  );
}
