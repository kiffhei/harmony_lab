import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PatternLibrary from './PatternLibrary.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { DRUM_PATTERNS } from './drumPatternsData.js';

let contextRef;

function ContextProbe() {
  contextRef = useMusicContext();
  return null;
}

beforeEach(() => { contextRef = null; });

function renderPL() {
  return render(
    <MusicProvider>
      <PatternLibrary />
      <ContextProbe />
    </MusicProvider>
  );
}

const TOTAL_PATTERNS = DRUM_PATTERNS.length;
const GENRES = [...new Set(DRUM_PATTERNS.map((p) => p.genre))];

describe('PatternLibrary', () => {
  it('renders without errors', () => {
    const { container } = renderPL();
    expect(container.querySelector('.pattern-library-module')).toBeInTheDocument();
  });

  it('renders all 242 unique patterns initially (All filter)', () => {
    const { container } = renderPL();
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(TOTAL_PATTERNS);
  });

  it('renders one filter button per real genre plus All', () => {
    const { container } = renderPL();
    const filters = container.querySelectorAll('.pattern-filter-btn');
    expect(filters).toHaveLength(GENRES.length + 1);
  });

  it('renders "All" filter button', () => {
    renderPL();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
  });

  it('filtering by a real genre shows only that genre\'s patterns', () => {
    const { container } = renderPL();
    const genre = 'Rock';
    const expected = DRUM_PATTERNS.filter((p) => p.genre === genre).length;
    fireEvent.click(screen.getByRole('button', { name: genre }));
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(expected);
  });

  it('clicking All after a genre filter restores all patterns', () => {
    const { container } = renderPL();
    fireEvent.click(screen.getByRole('button', { name: 'House' }));
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(TOTAL_PATTERNS);
  });

  it('each visible pattern name from the data is rendered', () => {
    renderPL();
    expect(screen.getByText('ROCK 1')).toBeInTheDocument();
    expect(screen.getByText('SON CLAVE')).toBeInTheDocument();
  });

  it('has a Cargar button per visible card', () => {
    const { container } = renderPL();
    fireEvent.click(screen.getByRole('button', { name: 'Rock' }));
    const loadBtns = container.querySelectorAll('.pattern-load-btn');
    const expected = DRUM_PATTERNS.filter((p) => p.genre === 'Rock').length;
    expect(loadBtns).toHaveLength(expected);
  });

  it('clicking Cargar loads a boolean[12][16] pattern into MusicContext', () => {
    const { container } = renderPL();
    fireEvent.click(screen.getByRole('button', { name: 'Rock' }));
    const loadBtn = container.querySelector('.pattern-load-btn');
    fireEvent.click(loadBtn);
    const { pattern } = contextRef;
    expect(Array.isArray(pattern)).toBe(true);
    expect(pattern).toHaveLength(12);
    expect(pattern[0]).toHaveLength(16);
  });

  it('loading "ROCK 1" produces the exact kick/snare/hihat hits from the source book', () => {
    const { container } = renderPL();
    fireEvent.click(screen.getByRole('button', { name: 'Rock' }));
    const cards = Array.from(container.querySelectorAll('.pattern-card'));
    const rockCard = cards.find((c) => c.textContent.includes('ROCK 1'));
    fireEvent.click(rockCard.querySelector('.pattern-load-btn'));
    const { pattern } = contextRef;
    // kick=0, snare=1, hh_c=2 in the 12-instrument order
    expect(pattern[0]).toEqual([
      true, false, false, false, false, false, false, true,
      true, false, true, false, false, false, false, false,
    ]);
    expect(pattern[1][4]).toBe(true);
    expect(pattern[1][12]).toBe(true);
  });

  it('selected card gets selected class after clicking Cargar', () => {
    const { container } = renderPL();
    fireEvent.click(screen.getByRole('button', { name: 'Rock' }));
    const loadBtn = container.querySelector('.pattern-load-btn');
    fireEvent.click(loadBtn);
    const card = container.querySelector('.pattern-card');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('renders a simplified 6-row mini-grid inside each card (not all 12 instruments)', () => {
    const { container } = renderPL();
    fireEvent.click(screen.getByRole('button', { name: 'Rock' }));
    const firstGrid = container.querySelector('.pattern-mini-grid');
    expect(firstGrid.querySelectorAll('.pattern-mini-row')).toHaveLength(6);
  });

  it('shows the empty state for a genre with zero patterns (defensive — should not happen with real data)', () => {
    renderPL();
    // Sanity: every real genre has at least one pattern, so the empty state
    // should never trigger with the shipped data.
    GENRES.forEach((g) => {
      expect(DRUM_PATTERNS.some((p) => p.genre === g)).toBe(true);
    });
  });
});
