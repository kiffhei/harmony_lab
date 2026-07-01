import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SongAnalyzer from './SongAnalyzer.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';

vi.mock('../../hooks/useAudioEngine.js', () => ({
  useAudioEngine: () => ({
    playTone:  vi.fn(),
    playChord: vi.fn(),
    getEngine: vi.fn(),
  }),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}));

function renderSA() {
  return render(<MusicProvider><SongAnalyzer /></MusicProvider>);
}

function makeFile(name, type, sizeBytes) {
  return new File([new ArrayBuffer(sizeBytes)], name, { type });
}

beforeEach(() => vi.clearAllMocks());

describe('SongAnalyzer', () => {
  it('renders without errors', () => {
    const { container } = renderSA();
    expect(container.querySelector('.analyzer-module')).toBeInTheDocument();
  });

  it('shows drop zone initially', () => {
    renderSA();
    expect(screen.getByLabelText('Zona de carga de archivo de audio')).toBeInTheDocument();
  });

  it('drop zone has upload text', () => {
    renderSA();
    expect(screen.getByText(/Arrastra un archivo/i)).toBeInTheDocument();
  });

  it('shows max size hint', () => {
    renderSA();
    expect(screen.getByText(/máximo 5 MB/i)).toBeInTheDocument();
  });

  it('shows error when file is too large', () => {
    renderSA();
    const input = document.getElementById('song-file-input');
    const bigFile = makeFile('big.mp3', 'audio/mpeg', 6 * 1024 * 1024);
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByRole('alert').textContent).toMatch(/demasiado grande/i);
  });

  it('shows error when format is not supported', () => {
    renderSA();
    const input = document.getElementById('song-file-input');
    const badFile = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(input, { target: { files: [badFile] } });
    expect(screen.getByRole('alert').textContent).toMatch(/no soportado/i);
  });

  it('shows analyzing state for valid file', () => {
    renderSA();
    const input = document.getElementById('song-file-input');
    const goodFile = makeFile('song.mp3', 'audio/mpeg', 1024 * 1024);
    fireEvent.change(input, { target: { files: [goodFile] } });
    expect(screen.getByText(/Analizando/i)).toBeInTheDocument();
  });

  it('shows results after analysis timeout', async () => {
    vi.useFakeTimers();
    renderSA();
    const input = document.getElementById('song-file-input');
    const goodFile = makeFile('track.wav', 'audio/wav', 500 * 1024);
    fireEvent.change(input, { target: { files: [goodFile] } });
    await act(async () => { vi.advanceTimersByTime(2001); });
    expect(screen.getByText('BPM')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('error has retry button', () => {
    renderSA();
    const input = document.getElementById('song-file-input');
    fireEvent.change(input, { target: { files: [makeFile('x.pdf', 'application/pdf', 100)] } });
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });
});
