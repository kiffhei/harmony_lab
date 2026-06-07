/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokens base — se sobreescriben con tokens.css cuando llegue el handoff del diseñador
        bg:       'var(--c-bg)',
        surface:  'var(--c-surface)',
        elevated: 'var(--c-elevated)',
        amber:    'var(--c-amber)',
        violet:   'var(--c-violet)',
        green:    'var(--c-green)',
        red:      'var(--c-red)',
        text:     'var(--c-text)',
        muted:    'var(--c-muted)',
        dim:      'var(--c-dim)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body:    'var(--font-body)',
        mono:    'var(--font-mono)',
      },
      spacing: {
        // Escala 4px base
        0.5: '2px',
        1:   '4px',
        2:   '8px',
        3:   '12px',
        4:   '16px',
        5:   '20px',
        6:   '24px',
        8:   '32px',
        10:  '40px',
        12:  '48px',
        16:  '64px',
      },
      transitionDuration: {
        fast:   'var(--dur-fast)',
        normal: 'var(--dur-normal)',
        slow:   'var(--dur-slow)',
      },
      animation: {
        'pulse-beat': 'pulse-beat var(--dur-beat) ease-in-out infinite',
        'glow':       'glow 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-beat': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.04)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 4px var(--c-amber)' },
          '50%':      { boxShadow: '0 0 16px var(--c-amber), 0 0 32px var(--c-amber)' },
        },
      },
    },
  },
  plugins: [],
};
