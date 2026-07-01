import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PatternLibrary from './PatternLibrary.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';
import { useMusicContext } from '../../hooks/useMusicContext.js';

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

describe('PatternLibrary', () => {
  it('renders without errors', () => {
    const { container } = renderPL();
    expect(container.querySelector('.pattern-library-module')).toBeInTheDocument();
  });

  it('renders 6 pattern cards initially (All filter)', () => {
    const { container } = renderPL();
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(6);
  });

  it('renders genre filter buttons', () => {
    const { container } = renderPL();
    const filters = container.querySelectorAll('.pattern-filter-btn');
    expect(filters.length).toBeGreaterThanOrEqual(5);
  });

  it('renders "All" filter button', () => {
    renderPL();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('filter by House shows only House patterns (2)', () => {
    const { container } = renderPL();
    const houseBtn = container.querySelector('.pattern-filter-btn[aria-pressed="false"]');
    fireEvent.click(houseBtn); // first non-active = House
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(2);
  });

  it('filter by Techno shows only Techno patterns (1)', () => {
    const { container } = renderPL();
    const filterBtns = container.querySelectorAll('.pattern-filter-btn');
    // GENRES = ['All','House','Hip-Hop','Trap','Techno','Drum & Bass'] → Techno = index 4
    fireEvent.click(filterBtns[4]);
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(1);
  });

  it('filter by Hip-Hop shows only Hip-Hop patterns (1)', () => {
    const { container } = renderPL();
    const filterBtns = container.querySelectorAll('.pattern-filter-btn');
    fireEvent.click(filterBtns[2]); // index 2 = Hip-Hop
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(1);
  });

  it('clicking All after genre filter restores all 6 patterns', () => {
    const { container } = renderPL();
    const filterBtns = container.querySelectorAll('.pattern-filter-btn');
    fireEvent.click(filterBtns[1]); // House
    fireEvent.click(filterBtns[0]); // All
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards).toHaveLength(6);
  });

  it('each card has a name visible', () => {
    renderPL();
    expect(screen.getByText('4 on the Floor')).toBeInTheDocument();
    expect(screen.getByText('Boom Bap')).toBeInTheDocument();
  });

  it('each card has a Cargar button', () => {
    const { container } = renderPL();
    const loadBtns = container.querySelectorAll('.pattern-load-btn');
    expect(loadBtns).toHaveLength(6);
  });

  it('clicking Cargar loads a boolean[][] pattern into MusicContext', () => {
    const { container } = renderPL();
    const loadBtns = container.querySelectorAll('.pattern-load-btn');
    fireEvent.click(loadBtns[0]);
    const { pattern } = contextRef;
    expect(Array.isArray(pattern)).toBe(true);
    expect(pattern).toHaveLength(8);
    expect(pattern[0]).toHaveLength(16);
  });

  it('clicking Cargar on second card loads that preset pattern into context', () => {
    const { container } = renderPL();
    const loadBtns = container.querySelectorAll('.pattern-load-btn');
    fireEvent.click(loadBtns[1]);
    const { pattern } = contextRef;
    expect(Array.isArray(pattern)).toBe(true);
    // Boom Bap preset: kick active on step 0
    expect(pattern[0][0]).toBe(true);
  });

  it('selected card gets selected class after clicking Cargar', () => {
    const { container } = renderPL();
    const loadBtns = container.querySelectorAll('.pattern-load-btn');
    fireEvent.click(loadBtns[0]);
    const cards = container.querySelectorAll('.pattern-card');
    expect(cards[0].classList.contains('selected')).toBe(true);
  });

  it('renders mini-grid inside each card', () => {
    const { container } = renderPL();
    const miniGrids = container.querySelectorAll('.pattern-mini-grid');
    expect(miniGrids).toHaveLength(6);
  });
});
