import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Piano from './Piano.jsx';
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

describe('Piano', () => {
  it('renders without errors', () => {
    const { container } = renderWithProvider(<Piano />);
    expect(container.querySelector('.piano-module')).toBeInTheDocument();
  });

  it('renders 21 white keys (3 octaves × 7)', () => {
    const { container } = renderWithProvider(<Piano />);
    const whites = container.querySelectorAll('.piano-key-white');
    expect(whites).toHaveLength(21);
  });

  it('renders 15 black keys (3 octaves × 5)', () => {
    const { container } = renderWithProvider(<Piano />);
    const blacks = container.querySelectorAll('.piano-key-black');
    expect(blacks).toHaveLength(15);
  });

  it('renders piano-info-strip', () => {
    const { container } = renderWithProvider(<Piano />);
    expect(container.querySelector('.piano-info-strip')).toBeInTheDocument();
  });

  it('C Major scale notes are highlighted with scale-note class', () => {
    const { container } = renderWithProvider(<Piano />);
    const scaleNotes = container.querySelectorAll('.scale-note');
    expect(scaleNotes.length).toBeGreaterThan(0);
  });

  it('root note keys (C) have root-note class — 3 per 3 octaves', () => {
    const { container } = renderWithProvider(<Piano />);
    const roots = container.querySelectorAll('.root-note');
    expect(roots).toHaveLength(3);
  });

  it('changing root note updates root-note class', () => {
    function Wrapper() {
      const { setRootNote } = useMusicContext();
      return (
        <>
          <button onClick={() => setRootNote('A')}>set-A</button>
          <Piano />
        </>
      );
    }
    const { container } = renderWithProvider(<Wrapper />);
    fireEvent.click(screen.getByText('set-A'));
    const roots = container.querySelectorAll('.root-note');
    expect(roots.length).toBeGreaterThan(0);
  });

  it('clicking a white key triggers no crash', () => {
    const { container } = renderWithProvider(<Piano />);
    const key = container.querySelector('.piano-key-white');
    fireEvent.mouseDown(key);
    expect(container.querySelector('.piano-module')).toBeInTheDocument();
  });

  it('pressing a key shows note name in info strip', () => {
    const { container } = renderWithProvider(<Piano />);
    const key = container.querySelector('.piano-key-white');
    fireEvent.mouseDown(key);
    const noteDisplay = container.querySelector('.piano-info-note');
    expect(noteDisplay).toBeInTheDocument();
    expect(noteDisplay.textContent).not.toBe('—');
  });

  it('releasing a key resets info strip to placeholder', () => {
    const { container } = renderWithProvider(<Piano />);
    const key = container.querySelector('.piano-key-white');
    fireEvent.mouseDown(key);
    fireEvent.mouseUp(key);
    const noteDisplay = container.querySelector('.piano-info-note');
    expect(noteDisplay.textContent).toBe('—');
  });

  it('C key labels are rendered', () => {
    const { container } = renderWithProvider(<Piano />);
    const labels = container.querySelectorAll('.piano-key-label');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('info strip shows scale name', () => {
    const { container } = renderWithProvider(<Piano />);
    const scale = container.querySelector('.piano-info-scale');
    expect(scale).toBeInTheDocument();
    expect(scale.textContent).toContain('Major');
  });

  it('black keys have absolute left style set', () => {
    const { container } = renderWithProvider(<Piano />);
    const blacks = container.querySelectorAll('.piano-key-black');
    blacks.forEach((key) => {
      expect(key.style.left).not.toBe('');
    });
  });
});
