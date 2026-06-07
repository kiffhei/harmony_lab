import { useEffect, useRef } from 'react';
import { useMusicContext } from './useMusicContext.js';

/**
 * useAnimatedBackground — Activa/desactiva el background animado
 * correspondiente al módulo activo.
 *
 * @param {'particles'|'tonality'|'grid'|'wave'|'expressionist'} type
 * @param {boolean} active
 */
export function useAnimatedBackground(type, active = true) {
  const { rootNote, bpm, isPlaying } = useMusicContext();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  }, [active]);

  return { ref, rootNote, bpm, isPlaying };
}
