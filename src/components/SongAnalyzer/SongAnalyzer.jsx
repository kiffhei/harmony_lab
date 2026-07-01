import React, { useState, useCallback } from 'react';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import '../../styles/modules/song-analyzer.css';

const SUPPORTED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'];
const MAX_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB

function simulateAnalysis() {
  const KEYS  = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const MODES = ['Major', 'Minor'];
  return {
    bpm:          Math.round(90 + Math.random() * 80),
    key:          KEYS[Math.floor(Math.random() * KEYS.length)],
    mode:         MODES[Math.floor(Math.random() * MODES.length)],
    energy:       Math.round(40 + Math.random() * 60),
    danceability: Math.round(40 + Math.random() * 60),
  };
}

function isSupported(file) {
  return SUPPORTED_TYPES.includes(file.type) || /\.(mp3|wav|ogg)$/i.test(file.name);
}

export default function SongAnalyzer() {
  const { setRootNote, setScaleName } = useMusicContext();

  const [dragOver,   setDragOver]   = useState(false);
  const [file,       setFile]       = useState(null);
  const [analyzing,  setAnalyzing]  = useState(false);
  const [results,    setResults]    = useState(null);
  const [error,      setError]      = useState(null);

  const processFile = useCallback((f) => {
    setError(null);
    setResults(null);

    if (!isSupported(f)) {
      setError('Formato no soportado. Usa MP3, WAV u OGG.');
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError('Archivo demasiado grande. Máximo 5 MB.');
      return;
    }

    setFile(f);
    setAnalyzing(true);

    setTimeout(() => {
      setResults(simulateAnalysis());
      setAnalyzing(false);
    }, 2000);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileInput = useCallback((e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  }, [processFile]);

  function handleLoadToContext() {
    if (!results) return;
    setRootNote(results.key);
    setScaleName(results.mode);
  }

  function handleReset() {
    setFile(null);
    setResults(null);
    setError(null);
    setAnalyzing(false);
  }

  return (
    <div className="analyzer-module">

      {!file && !analyzing && (
        <div
          className={`analyzer-upload${dragOver ? ' drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('song-file-input').click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivo de audio"
          onKeyDown={(e) => e.key === 'Enter' && document.getElementById('song-file-input').click()}
        >
          <input
            id="song-file-input"
            type="file"
            accept=".mp3,.wav,.ogg,audio/*"
            style={{ display: 'none' }}
            onChange={handleFileInput}
            aria-hidden="true"
          />
          <span className="analyzer-upload-icon" aria-hidden="true">🎵</span>
          <span className="analyzer-upload-text">Arrastra un archivo de audio aquí</span>
          <span className="analyzer-upload-sub">MP3, WAV, OGG — máximo 5 MB</span>
        </div>
      )}

      {error && (
        <div role="alert" className="analyzer-error">
          {error}
          <button onClick={handleReset} style={{ marginLeft: '8px' }}>Reintentar</button>
        </div>
      )}

      {analyzing && (
        <div className="analyzer-loading">
          <div className="analyzer-spinner" aria-hidden="true" />
          <p className="analyzer-loading-text">Analizando: {file?.name}</p>
        </div>
      )}

      {results && !analyzing && (
        <div className="analyzer-results-panel">
          <p className="analyzer-filename">{file?.name}</p>

          <div className="analyzer-results">
            <div className="analyzer-data-cell bpm">
              <span className="analyzer-data-label">BPM</span>
              <span className="analyzer-data-value">{results.bpm}</span>
            </div>
            <div className="analyzer-data-cell key">
              <span className="analyzer-data-label">Tonalidad</span>
              <span className="analyzer-data-value">{results.key} {results.mode}</span>
            </div>
            <div className="analyzer-data-cell">
              <span className="analyzer-data-label">Energía</span>
              <span className="analyzer-data-value">{results.energy}%</span>
            </div>
            <div className="analyzer-data-cell">
              <span className="analyzer-data-label">Bailabilidad</span>
              <span className="analyzer-data-value">{results.danceability}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={handleLoadToContext}
              className="analyzer-load-btn"
              aria-label="Cargar en Harmony Lab"
            >
              Cargar en Harmony Lab
            </button>
            <button onClick={handleReset} className="analyzer-reset-btn">
              Nuevo análisis
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
