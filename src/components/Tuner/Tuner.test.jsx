import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Tuner from './Tuner.jsx';

const mockStart = vi.fn();
const mockStop  = vi.fn();

const makeState = (overrides = {}) => ({
  status:      'idle',
  note:        null,
  noteName:    null,
  octave:      4,
  cents:       0,
  freq:        0,
  targetFreq:  440,
  inTune:      false,
  tuning:      'in_tune',
  barPosition: 0.5,
  error:       null,
  ...overrides,
});

let mockState = makeState();

vi.mock('../../hooks/useTuner.js', () => ({
  useTuner: () => ({
    state:    mockState,
    start:    mockStart,
    stop:     mockStop,
    isActive: mockState.status === 'active',
  }),
}));

beforeEach(() => {
  mockState = makeState();
  vi.clearAllMocks();
});

describe('Tuner', () => {
  it('renders without errors in idle state', () => {
    const { container } = render(<Tuner />);
    expect(container.querySelector('.tuner-module')).toBeInTheDocument();
  });

  it('shows start microphone button when idle', () => {
    render(<Tuner />);
    expect(screen.getByLabelText('Iniciar micrófono')).toBeInTheDocument();
  });

  it('shows dash when no note detected', () => {
    render(<Tuner />);
    const noteEl = document.querySelector('.tuner-note-name');
    expect(noteEl.textContent).toContain('—');
  });

  it('shows cents meter track', () => {
    const { container } = render(<Tuner />);
    expect(container.querySelector('.tuner-meter-track')).toBeInTheDocument();
  });

  it('shows frequency display', () => {
    const { container } = render(<Tuner />);
    expect(container.querySelector('.tuner-freq-display')).toBeInTheDocument();
  });

  it('calls start() when microphone button clicked', () => {
    render(<Tuner />);
    fireEvent.click(screen.getByLabelText('Iniciar micrófono'));
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('shows error message when status is error', () => {
    mockState = makeState({ status: 'error', error: 'Acceso al micrófono denegado' });
    render(<Tuner />);
    expect(screen.getByRole('alert').textContent).toBe('Acceso al micrófono denegado');
  });

  it('in active+inTune state shows In Tune badge', () => {
    mockState = makeState({
      status: 'active', noteName: 'A', octave: 4,
      cents: 2, freq: 440.5, inTune: true, tuning: 'in_tune',
    });
    render(<Tuner />);
    expect(screen.getByText(/In Tune/)).toBeInTheDocument();
  });

  it('in active+inTune state, note name has intune class', () => {
    mockState = makeState({
      status: 'active', noteName: 'A', octave: 4,
      cents: 2, freq: 440, inTune: true, tuning: 'in_tune',
    });
    const { container } = render(<Tuner />);
    expect(container.querySelector('.tuner-note-name.intune')).toBeInTheDocument();
  });

  it('shows reference pitch line', () => {
    render(<Tuner />);
    expect(screen.getByText('A4 = 440 Hz')).toBeInTheDocument();
  });

  it('meter needle is present', () => {
    const { container } = render(<Tuner />);
    expect(container.querySelector('.tuner-meter-needle')).toBeInTheDocument();
  });
});
