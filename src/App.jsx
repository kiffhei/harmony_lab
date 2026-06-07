import React from 'react';
import { MusicProvider } from './context/MusicContext.jsx';

/**
 * App.jsx — Shell principal de Harmony Lab Pro.
 * Mínimo funcional: solo el Provider y un placeholder.
 * Los layouts reales se construyen en Semana 2 tras el handoff del diseñador.
 */
export default function App() {
  return (
    <MusicProvider>
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--c-bg)',
          color: 'var(--c-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ textAlign: 'center', gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--c-amber)', fontWeight: 700 }}>
            Harmony Lab Pro
          </h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem' }}>
            Core inicializado — UI en construcción
          </p>
        </div>
      </div>
    </MusicProvider>
  );
}
