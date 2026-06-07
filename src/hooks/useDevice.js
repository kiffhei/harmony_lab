import { useState, useEffect } from 'react';

const BREAKPOINTS = { tablet: 768, desktop: 1024 };

/**
 * useDevice — Detecta el tipo de dispositivo basado en el ancho de pantalla
 * y el query param ?v= para override manual (útil en desarrollo).
 *
 * @returns {{ device: 'mobile'|'tablet'|'desktop', isMobile: boolean, isTablet: boolean, isDesktop: boolean }}
 */
export function useDevice() {
  const getDevice = () => {
    // Override por query param — /?v=mobile | /?v=tablet | /?v=desktop
    if (typeof window !== 'undefined') {
      const v = new URLSearchParams(window.location.search).get('v');
      if (v === 'mobile' || v === 'tablet' || v === 'desktop') return v;
      const w = window.innerWidth;
      if (w < BREAKPOINTS.tablet) return 'mobile';
      if (w < BREAKPOINTS.desktop) return 'tablet';
    }
    return 'desktop';
  };

  const [device, setDevice] = useState(getDevice);

  useEffect(() => {
    const mql1 = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
    const mql2 = window.matchMedia(`(max-width: ${BREAKPOINTS.desktop - 1}px)`);

    const handler = () => setDevice(getDevice());
    mql1.addEventListener('change', handler);
    mql2.addEventListener('change', handler);

    return () => {
      mql1.removeEventListener('change', handler);
      mql2.removeEventListener('change', handler);
    };
  }, []);

  return {
    device,
    isMobile:  device === 'mobile',
    isTablet:  device === 'tablet',
    isDesktop: device === 'desktop',
  };
}
