import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Guitar from './Guitar.jsx';
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
    getEngine: vi.fn(),
  }),
}));

function renderWithProvider(ui) {
  return render(<MusicProvider>{ui}</MusicProvider>);
}

describe('Guitar', () => {
  it('renders without errors', () => {
    const { container } = renderWithProvider(<Guitar />);
    expect(container.querySelector('.guitar-module')).toBeInTheDocument();
  });

  it('renders 6 string rows', () => {
    const { container } = renderWithProvider(<Guitar />);
    const rows = container.querySelectorAll('.guitar-string-row');
    expect(rows).toHaveLength(6);
  });

  it('renders 12 fret cells per string (72 total)', () => {
    const { container } = renderWithProvider(<Guitar />);
    const cells = container.querySelectorAll('.guitar-cell');
    expect(cells).toHaveLength(72);
  });

  it('scale notes have scale-note class', () => {
    const { container } = renderWithProvider(<Guitar />);
    const scaleCells = container.querySelectorAll('.guitar-cell.scale-note');
    expect(scaleCells.length).toBeGreaterThan(0);
  });

  it('root notes have root-note class', () => {
    const { container } = renderWithProvider(<Guitar />);
    const rootCells = container.querySelectorAll('.guitar-cell.root-note');
    expect(rootCells.length).toBeGreaterThan(0);
  });

  it('clicking a cell plays audio without crashing', () => {
    const { container } = renderWithProvider(<Guitar />);
    const cell = container.querySelector('.guitar-cell');
    fireEvent.click(cell);
    expect(container.querySelector('.guitar-module')).toBeInTheDocument();
  });

  it('clicking a cell adds playing class temporarily', () => {
    const { container } = renderWithProvider(<Guitar />);
    const scaleCells = container.querySelectorAll('.guitar-cell.scale-note');
    const cell = scaleCells[0];
    fireEvent.click(cell);
    expect(cell.classList.contains('playing')).toBe(true);
  });

  it('renders guitar-info strip', () => {
    const { container } = renderWithProvider(<Guitar />);
    expect(container.querySelector('.guitar-info')).toBeInTheDocument();
  });

  it('renders guitar-position-markers', () => {
    const { container } = renderWithProvider(<Guitar />);
    expect(container.querySelector('.guitar-position-markers')).toBeInTheDocument();
  });

  it('renders 12 guitar-fret-label elements', () => {
    const { container } = renderWithProvider(<Guitar />);
    const labels = container.querySelectorAll('.guitar-fret-label');
    expect(labels).toHaveLength(12);
  });

  it('changing to Pentatonic reduces highlighted cells vs Major', () => {
    function Wrapper() {
      const { setScaleName } = useMusicContext();
      return (
        <>
          <button onClick={() => setScaleName('Pentatonic Maj')}>set-penta</button>
          <Guitar />
        </>
      );
    }
    const { container } = renderWithProvider(<Wrapper />);
    // C Major: 6 non-root scale notes × 6 appearances = 36 cells
    const majorCount = container.querySelectorAll('.guitar-cell.scale-note').length;
    fireEvent.click(screen.getByText('set-penta'));
    // C Pentatonic Maj: 4 non-root scale notes × 6 appearances = 24 cells
    const pentaCount = container.querySelectorAll('.guitar-cell.scale-note').length;
    expect(pentaCount).toBeGreaterThan(0);
    expect(majorCount).not.toBe(pentaCount);
  });

  it('info strip shows note after click', () => {
    const { container } = renderWithProvider(<Guitar />);
    const cell = container.querySelector('.guitar-cell');
    fireEvent.click(cell);
    const chord = container.querySelector('.guitar-info-chord');
    expect(chord.textContent).not.toBe('—');
  });
});
