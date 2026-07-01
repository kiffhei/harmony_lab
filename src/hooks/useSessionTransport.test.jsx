import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useSessionTransport } from './useSessionTransport.js';
import { useMusicContext } from './useMusicContext.js';
import { MusicProvider } from '../context/MusicContext.jsx';

vi.mock('./useAudioEngine.js', () => ({
  useAudioEngine: () => ({
    getEngine: () => ({
      getContext:  () => ({ currentTime: 0 }),
      playChord:   vi.fn(),
      drumKick:    vi.fn(),
      drumSnare:   vi.fn(),
      drumHiHat:   vi.fn(),
      drumClap:    vi.fn(),
      drumTom:     vi.fn(),
      drumShaker:  vi.fn(),
    }),
    playTone:  vi.fn(),
    playChord: vi.fn(),
  }),
}));

const ONE_CHORD = [
  { root: 'C', quality: 'maj', roman: 'I', notes: ['C', 'E', 'G'], degree: 0, beats: 4, octave: 4 },
];

function withPatternStep(pattern) {
  const next = pattern.map((row) => [...row]);
  next[0][0] = true; // kick en el paso 0
  return next;
}

function wrapper({ children }) {
  return <MusicProvider>{children}</MusicProvider>;
}

function useSetup() {
  const ctx       = useMusicContext();
  const transport = useSessionTransport();
  return { ctx, transport };
}

afterEach(() => vi.clearAllMocks());

describe('useSessionTransport', () => {
  it('reports nothing playing and no content when session is empty', () => {
    const { result } = renderHook(() => useSetup(), { wrapper });
    expect(result.current.transport.isSessionPlaying).toBe(false);
    expect(result.current.transport.hasPattern).toBe(false);
    expect(result.current.transport.hasProgression).toBe(false);
  });

  it('playAll starts the sequencer when the drum pattern has active steps', () => {
    const { result } = renderHook(() => useSetup(), { wrapper });

    act(() => result.current.ctx.setPattern(withPatternStep));
    act(() => result.current.transport.playAll());

    expect(result.current.transport.hasPattern).toBe(true);
    expect(result.current.transport.isSessionPlaying).toBe(true);
  });

  it('playAll starts progression playback when a progression exists', () => {
    const { result } = renderHook(() => useSetup(), { wrapper });

    act(() => result.current.ctx.setProgression(ONE_CHORD));
    act(() => result.current.transport.playAll());

    expect(result.current.transport.hasProgression).toBe(true);
    expect(result.current.transport.isSessionPlaying).toBe(true);
  });

  it('playAll starts both engines together when pattern and progression coexist', () => {
    const { result } = renderHook(() => useSetup(), { wrapper });

    act(() => {
      result.current.ctx.setPattern(withPatternStep);
      result.current.ctx.setProgression(ONE_CHORD);
    });
    act(() => result.current.transport.playAll());

    expect(result.current.transport.isSessionPlaying).toBe(true);
  });

  it('stopAll stops both engines regardless of which one started', () => {
    const { result } = renderHook(() => useSetup(), { wrapper });

    act(() => {
      result.current.ctx.setPattern(withPatternStep);
      result.current.ctx.setProgression(ONE_CHORD);
    });
    act(() => result.current.transport.playAll());
    expect(result.current.transport.isSessionPlaying).toBe(true);

    act(() => result.current.transport.stopAll());
    expect(result.current.transport.isSessionPlaying).toBe(false);
  });

  it('toggleAll flips session playback state', () => {
    const { result } = renderHook(() => useSetup(), { wrapper });

    act(() => result.current.ctx.setPattern(withPatternStep));
    act(() => result.current.transport.toggleAll());
    expect(result.current.transport.isSessionPlaying).toBe(true);

    act(() => result.current.transport.toggleAll());
    expect(result.current.transport.isSessionPlaying).toBe(false);
  });
});
