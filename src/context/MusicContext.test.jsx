import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MusicProvider } from './MusicContext.jsx';
import { useMusicContext } from '../hooks/useMusicContext.js';

const STORAGE_KEY = 'harmony-lab-session';

let contextRef;

function ContextProbe() {
  contextRef = useMusicContext();
  return null;
}

function renderProvider() {
  contextRef = null;
  return render(<MusicProvider><ContextProbe /></MusicProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
  contextRef = null;
});

describe('MusicContext persistence', () => {
  it('starts with defaults when localStorage is empty', () => {
    renderProvider();
    expect(contextRef.rootNote).toBe('C');
    expect(contextRef.scaleName).toBe('Major');
    expect(contextRef.bpm).toBe(120);
    expect(contextRef.progression).toEqual([]);
  });

  it('persists rootNote/scaleName/bpm changes to localStorage', () => {
    renderProvider();
    act(() => {
      contextRef.setRootNote('G');
      contextRef.setScaleName('Minor');
      contextRef.setBpm(140);
    });
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(saved.rootNote).toBe('G');
    expect(saved.scaleName).toBe('Minor');
    expect(saved.bpm).toBe(140);
  });

  it('persists progression changes to localStorage', () => {
    renderProvider();
    act(() => {
      contextRef.setProgression([
        { id: 'a', root: 'C', quality: 'maj', roman: 'I', notes: ['C', 'E', 'G'], degree: 0, beats: 4, octave: 4 },
      ]);
    });
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(saved.progression).toHaveLength(1);
    expect(saved.progression[0].roman).toBe('I');
  });

  it('persists drum pattern changes to localStorage', () => {
    renderProvider();
    act(() => {
      contextRef.setPattern((prev) => {
        const next = prev.map((row) => [...row]);
        next[0][0] = true;
        return next;
      });
    });
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(saved.pattern[0][0]).toBe(true);
  });

  it('rehydrates rootNote/scaleName/bpm/progression/pattern on a fresh mount', () => {
    renderProvider();
    act(() => {
      contextRef.setRootNote('D');
      contextRef.setScaleName('Dorian');
      contextRef.setBpm(96);
      contextRef.setProgression([
        { id: 'a', root: 'D', quality: 'min', roman: 'i', notes: ['D', 'F', 'A'], degree: 0, beats: 2, octave: 4 },
      ]);
      contextRef.setPattern((prev) => {
        const next = prev.map((row) => [...row]);
        next[1][4] = true;
        return next;
      });
    });

    // Nuevo montaje — simula un refresco del navegador
    renderProvider();

    expect(contextRef.rootNote).toBe('D');
    expect(contextRef.scaleName).toBe('Dorian');
    expect(contextRef.bpm).toBe(96);
    expect(contextRef.progression).toHaveLength(1);
    expect(contextRef.progression[0].roman).toBe('i');
    expect(contextRef.progression[0].beats).toBe(2);
    expect(contextRef.pattern[1][4]).toBe(true);
  });

  it('falls back to defaults when localStorage has corrupted JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json');
    renderProvider();
    expect(contextRef.rootNote).toBe('C');
    expect(contextRef.progression).toEqual([]);
  });
});
