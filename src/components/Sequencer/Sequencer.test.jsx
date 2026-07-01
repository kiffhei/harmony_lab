import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sequencer from './Sequencer.jsx';

const mockHandleToggleStep   = vi.fn();
const mockHandleBpmChange    = vi.fn();
const mockHandleClear        = vi.fn();
const mockHandleLoadDefault  = vi.fn();
const mockToggleAll          = vi.fn();

const createPattern = (active = false) =>
  Array.from({ length: 8 }, () => Array(16).fill(active));

vi.mock('../../hooks/useSequencer.js', () => ({
  useSequencer: () => ({
    pattern:           createPattern(false),
    activeStep:        -1,
    bpm:               120,
    handleToggleStep:  mockHandleToggleStep,
    handleBpmChange:   mockHandleBpmChange,
    handleClear:       mockHandleClear,
    handleLoadDefault: mockHandleLoadDefault,
  }),
}));

vi.mock('../../hooks/useSessionTransport.js', () => ({
  useSessionTransport: () => ({
    isSessionPlaying: false,
    toggleAll:        mockToggleAll,
  }),
}));

beforeEach(() => vi.clearAllMocks());

describe('Sequencer', () => {
  it('renders without errors', () => {
    const { container } = render(<Sequencer />);
    expect(container.querySelector('.sequencer-module')).toBeInTheDocument();
  });

  it('renders the sequencer-faceplate', () => {
    const { container } = render(<Sequencer />);
    expect(container.querySelector('.sequencer-faceplate')).toBeInTheDocument();
  });

  it('renders 8 instrument track rows', () => {
    const { container } = render(<Sequencer />);
    const rows = container.querySelectorAll('.seq-track');
    expect(rows).toHaveLength(8);
  });

  it('renders 128 step buttons (8 × 16)', () => {
    const { container } = render(<Sequencer />);
    const steps = container.querySelectorAll('.seq-step');
    expect(steps).toHaveLength(128);
  });

  it('renders 8 instrument labels', () => {
    const { container } = render(<Sequencer />);
    const labels = container.querySelectorAll('.seq-track-label');
    expect(labels).toHaveLength(8);
  });

  it('play button renders with play icon when not playing', () => {
    render(<Sequencer />);
    const btn = screen.getByLabelText('Play');
    expect(btn).toBeInTheDocument();
  });

  it('clicking play button calls toggleAll', () => {
    render(<Sequencer />);
    fireEvent.click(screen.getByLabelText('Play'));
    expect(mockToggleAll).toHaveBeenCalledTimes(1);
  });

  it('clicking a step button calls handleToggleStep with correct indices', () => {
    const { container } = render(<Sequencer />);
    const steps = container.querySelectorAll('.seq-step');
    fireEvent.click(steps[0]);
    expect(mockHandleToggleStep).toHaveBeenCalledWith(0, 0);
  });

  it('clicking step 3 in second row calls handleToggleStep(1, 3)', () => {
    const { container } = render(<Sequencer />);
    const rows = container.querySelectorAll('.seq-track');
    const secondRowSteps = rows[1].querySelectorAll('.seq-step');
    fireEvent.click(secondRowSteps[3]);
    expect(mockHandleToggleStep).toHaveBeenCalledWith(1, 3);
  });

  it('BPM slider calls handleBpmChange on change', () => {
    render(<Sequencer />);
    const slider = screen.getByLabelText('BPM');
    fireEvent.change(slider, { target: { value: '140' } });
    expect(mockHandleBpmChange).toHaveBeenCalledWith(140);
  });

  it('BPM value is displayed', () => {
    render(<Sequencer />);
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('Clear button calls handleClear', () => {
    render(<Sequencer />);
    fireEvent.click(screen.getByText('Clear'));
    expect(mockHandleClear).toHaveBeenCalledTimes(1);
  });

  it('Default button calls handleLoadDefault', () => {
    render(<Sequencer />);
    fireEvent.click(screen.getByText('Default'));
    expect(mockHandleLoadDefault).toHaveBeenCalledTimes(1);
  });

  it('seq-grid is present', () => {
    const { container } = render(<Sequencer />);
    expect(container.querySelector('.seq-grid')).toBeInTheDocument();
  });

  it('seq-brand label is rendered', () => {
    render(<Sequencer />);
    expect(screen.getByText('DRUM MACHINE')).toBeInTheDocument();
  });
});
