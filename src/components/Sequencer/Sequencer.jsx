import React from 'react';
import { useSequencer } from '../../hooks/useSequencer.js';
import { useSessionTransport } from '../../hooks/useSessionTransport.js';
import '../../styles/modules/sequencer.css';

const INSTRUMENT_LABELS = [
  'KICK', 'SNARE', 'HH.C', 'HH.O', 'CLAP',
  'TOM.HI', 'TOM.MID', 'TOM.LO', 'SHKR',
  'RIM', 'CWBL', 'CYM',
];
const ON_CLASSES = [
  'on-kick', 'on-snare', 'on-hh-c', 'on-hh-o', 'on-clap',
  'on-tom', 'on-tom', 'on-tom', 'on-shaker',
  'on-rimshot', 'on-cowbell', 'on-cymbal',
];

const MIN_STEPS = 1;
const MAX_STEPS = 64;

export default function Sequencer() {
  const {
    pattern,
    activeStep,
    bpm,
    stepCount,
    handleToggleStep,
    handleBpmChange,
    handleClear,
    handleLoadDefault,
    handleStepCountChange,
  } = useSequencer();

  const { isSessionPlaying, toggleAll } = useSessionTransport();

  const steps = Array.from({ length: stepCount }, (_, i) => i);

  return (
    <div className="sequencer-module">
      <div className="sequencer-faceplate">

        <div className="seq-header">
          <span className="seq-brand">DRUM MACHINE</span>

          <div className="seq-bpm-display">
            <span className="seq-bpm-label">BPM</span>
            <span className="seq-bpm-value">{bpm}</span>
            <input
              type="range"
              min={60}
              max={180}
              value={bpm}
              className="sequencer-bpm-slider"
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              aria-label="BPM"
            />
          </div>

          <div className="seq-bpm-display">
            <span className="seq-bpm-label">STEPS</span>
            <input
              type="number"
              min={MIN_STEPS}
              max={MAX_STEPS}
              value={stepCount}
              className="sequencer-steps-input"
              aria-label="Número de pasos"
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next) && next >= MIN_STEPS && next <= MAX_STEPS) {
                  handleStepCountChange(next);
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
            <button className="sequencer-btn-util" onClick={handleLoadDefault}>Default</button>
            <button className="sequencer-btn-util" onClick={handleClear}>Clear</button>
            <button
              className={`seq-play-btn${isSessionPlaying ? ' playing' : ''}`}
              onClick={toggleAll}
              aria-label={isSessionPlaying ? 'Stop' : 'Play'}
            >
              <span className="seq-play-led" />
              <span style={{ fontSize: '14px' }}>{isSessionPlaying ? '■' : '▶'}</span>
            </button>
          </div>
        </div>

        <div className="seq-grid">
          {pattern.map((row, instrIdx) => (
            <div key={INSTRUMENT_LABELS[instrIdx]} className="seq-track">
              <span className="seq-track-label">{INSTRUMENT_LABELS[instrIdx]}</span>
              <div className="seq-steps">
                {steps.map((step) => {
                  const isActive   = row[step];
                  const isCurrent  = activeStep === step;
                  const cls = [
                    'seq-step',
                    isActive  ? `on ${ON_CLASSES[instrIdx]}` : '',
                    isCurrent ? 'playhead' : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <button
                      key={step}
                      className={cls}
                      onClick={() => handleToggleStep(instrIdx, step)}
                      aria-label={`${INSTRUMENT_LABELS[instrIdx]} step ${step + 1}`}
                      aria-pressed={isActive}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
