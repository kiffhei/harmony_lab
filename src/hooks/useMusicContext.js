import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext.jsx';

/**
 * useMusicContext — Hook para consumir el estado musical global.
 * Lanza un error claro si se usa fuera del MusicProvider.
 *
 * @returns {import('../context/MusicContext.jsx').MusicContextValue}
 */
export function useMusicContext() {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error('useMusicContext debe usarse dentro de <MusicProvider>');
  }
  return ctx;
}
