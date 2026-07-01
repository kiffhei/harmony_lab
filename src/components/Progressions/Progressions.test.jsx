import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Progressions from './Progressions.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';
import { useMusicContext } from '../../hooks/useMusicContext.js';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe:    vi.fn(),
  unobserve:  vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('../../hooks/useAudioEngine.js', () => ({
  useAudioEngine: () => ({
    playTone:  vi.fn(),
    playChord: vi.fn(),
    getEngine: vi.fn(() => ({ getContext: () => ({ currentTime: 0 }) })),
  }),
}));

vi.mock('../../core/MidiExport.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    exportProgression: vi.fn(),
  };
});

function chord(overrides) {
  return {
    id:      overrides.roman ?? Math.random().toString(36),
    root:    'C', quality: 'maj', roman: 'I', notes: ['C', 'E', 'G'],
    degree:  0, beats: 4, octave: 4,
    ...overrides,
  };
}

function renderWithProvider(ui) {
  return render(<MusicProvider>{ui}</MusicProvider>);
}

function renderWithChords(chords) {
  function Wrapper() {
    const { setProgression } = useMusicContext();
    return (
      <>
        <button onClick={() => setProgression(chords)}>load</button>
        <Progressions />
      </>
    );
  }
  const result = renderWithProvider(<Wrapper />);
  fireEvent.click(screen.getByText('load'));
  return result;
}

describe('Progressions', () => {
  it('renders without errors', () => {
    const { container } = renderWithProvider(<Progressions />);
    expect(container.querySelector('.progressions-module')).toBeInTheDocument();
  });

  it('shows empty state when progression is empty', () => {
    const { container } = renderWithProvider(<Progressions />);
    expect(container.querySelector('[data-testid="prog-empty"]')).toBeInTheDocument();
  });

  it('renders prog-controls bar', () => {
    const { container } = renderWithProvider(<Progressions />);
    expect(container.querySelector('.prog-controls')).toBeInTheDocument();
  });

  it('shows bpm in prog-tempo-value', () => {
    const { container } = renderWithProvider(<Progressions />);
    const tempo = container.querySelector('.prog-tempo-value');
    expect(tempo).toBeInTheDocument();
    expect(tempo.textContent).toBe('120');
  });

  it('renders chord cards when progression has items', () => {
    const { container } = renderWithChords([
      chord({ id: 'a', roman: 'I',  root: 'C', notes: ['C', 'E', 'G'] }),
      chord({ id: 'b', roman: 'IV', root: 'F', notes: ['F', 'A', 'C'] }),
    ]);
    const cards = container.querySelectorAll('.prog-chord-card');
    expect(cards).toHaveLength(2);
  });

  it('chord card shows roman numeral', () => {
    const { container } = renderWithChords([chord({ id: 'a', roman: 'I', root: 'C' })]);
    const roman = container.querySelector('.prog-chord-roman');
    expect(roman.textContent).toBe('I');
  });

  it('chord card shows chord name', () => {
    const { container } = renderWithChords([chord({ id: 'a', roman: 'I', root: 'C' })]);
    const name = container.querySelector('.prog-chord-name');
    expect(name.textContent).toContain('C');
  });

  it('delete button removes a chord', () => {
    const { container } = renderWithChords([chord({ id: 'a', roman: 'I', root: 'C' })]);
    const deleteBtn = container.querySelector('.prog-chord-delete');
    fireEvent.click(deleteBtn);
    expect(container.querySelectorAll('.prog-chord-card')).toHaveLength(0);
    expect(container.querySelector('[data-testid="prog-empty"]')).toBeInTheDocument();
  });

  it('deleting one of two chords leaves one remaining', () => {
    const { container } = renderWithChords([
      chord({ id: 'a', roman: 'I',  root: 'C' }),
      chord({ id: 'b', roman: 'IV', root: 'F' }),
    ]);
    const deleteBtns = container.querySelectorAll('.prog-chord-delete');
    fireEvent.click(deleteBtns[0]);
    const cards = container.querySelectorAll('.prog-chord-card');
    expect(cards).toHaveLength(1);
    expect(container.querySelector('.prog-chord-roman').textContent).toBe('IV');
  });

  it('play button is disabled when progression is empty', () => {
    const { container } = renderWithProvider(<Progressions />);
    const playBtn = container.querySelector('[data-testid="prog-play-btn"]');
    expect(playBtn).toBeDisabled();
  });

  it('play button is enabled when progression has chords', () => {
    const { container } = renderWithChords([chord({ id: 'a', roman: 'I', root: 'C' })]);
    const playBtn = container.querySelector('[data-testid="prog-play-btn"]');
    expect(playBtn).not.toBeDisabled();
  });

  it('clicking play sets playing state', () => {
    const { container } = renderWithChords([chord({ id: 'a', roman: 'I', root: 'C' })]);
    const playBtn = container.querySelector('[data-testid="prog-play-btn"]');
    fireEvent.click(playBtn);
    expect(playBtn.textContent).toContain('Stop');
  });

  it('clicking stop resets playing state', () => {
    const { container } = renderWithChords([chord({ id: 'a', roman: 'I', root: 'C' })]);
    const playBtn = container.querySelector('[data-testid="prog-play-btn"]');
    fireEvent.click(playBtn);
    fireEvent.click(playBtn);
    expect(playBtn.textContent).toContain('Play');
  });

  it('export MIDI button is present', () => {
    const { container } = renderWithProvider(<Progressions />);
    expect(container.querySelector('[data-testid="prog-export-btn"]')).toBeInTheDocument();
  });

  it('prog-slots container is rendered', () => {
    const { container } = renderWithProvider(<Progressions />);
    expect(container.querySelector('.prog-slots')).toBeInTheDocument();
  });

  it('loop toggle button is present and toggles aria-pressed', () => {
    renderWithProvider(<Progressions />);
    const loopBtn = screen.getByLabelText('Toggle loop');
    expect(loopBtn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(loopBtn);
    expect(loopBtn.getAttribute('aria-pressed')).toBe('true');
  });
});
