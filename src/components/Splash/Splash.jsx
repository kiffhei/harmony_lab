import React from 'react';

/** @type {{ name: string, icon: string, desc: string, tab: number }[]} */
const MODULES = [
  { name: 'Key Explorer',    icon: '🗝',  desc: 'Tonalidades y escalas',   tab: 0 },
  { name: 'Harmony Map',     icon: '♾',  desc: 'Acordes diatónicos',      tab: 0 },
  { name: 'Progressions',    icon: '♩',  desc: 'Editor de progresiones',  tab: 0 },
  { name: 'Piano',           icon: '🎹', desc: 'Teclado interactivo',      tab: 1 },
  { name: 'Guitar',          icon: '🎸', desc: 'Diapasón y escalas',       tab: 1 },
  { name: 'Sequencer',       icon: '⚡',  desc: 'Drum machine 16 pasos',   tab: 2 },
  { name: 'Pattern Library', icon: '📂', desc: 'Biblioteca de ritmos',     tab: 2 },
  { name: 'Tuner',           icon: '🎯', desc: 'Afinador por micrófono',  tab: 3 },
  // Song Analyzer no se muestra a propósito — ver nota en DesktopLayout.jsx TABS.
];

const TONES = [
  'var(--c-tone-C)',  'var(--c-tone-G)',  'var(--c-tone-D)',  'var(--c-tone-A)',
  'var(--c-tone-E)',  'var(--c-tone-B)',  'var(--c-tone-Fs)', 'var(--c-tone-Cs)',
  'var(--c-tone-Gs)', 'var(--c-tone-Ds)', 'var(--c-tone-As)', 'var(--c-tone-F)',
];

/**
 * Splash — home screen showing all modules as navigable cards.
 * @param {{ onNavigate: (tabIndex: number, moduleName: string) => void }} props
 */
export default function Splash({ onNavigate }) {
  return (
    <>
      <style>{`
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter {
          animation: cardEnter 400ms ease-out both;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
        .dot-pulse {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          animation: dotPulse 2s ease-in-out infinite;
        }
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 0 32px;
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 style={{
            fontFamily:           'var(--font-display)',
            fontSize:             '3.5rem',
            fontWeight:           800,
            background:           'linear-gradient(135deg, var(--c-amber), var(--c-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            letterSpacing:        'var(--ls-tight)',
            lineHeight:           1.1,
          }}>
            H·LAB
          </h1>
          <p className="font-[family-name:var(--font-body)] text-[var(--c-text-secondary)] text-base tracking-[var(--ls-widest)] uppercase mt-2">
            Harmony Lab Pro
          </p>
        </div>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="w-[120px] h-px bg-[var(--c-border)]" />

        {/* ── Module cards ───────────────────────────────────────────────── */}
        <div className="modules-grid">
          {MODULES.map((mod, idx) => (
            <div
              key={mod.name}
              className="card-enter"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div
                onClick={() => onNavigate(mod.tab, mod.name)}
                className={[
                  'bg-[var(--c-elevated)] border border-[var(--c-border)]',
                  'rounded-[var(--r-lg)] p-5 cursor-pointer',
                  'flex flex-col items-center text-center',
                  'hover:bg-[var(--c-elevated-2)] hover:border-[var(--c-amber)] hover:-translate-y-1',
                  'transition-all duration-200 ease-out',
                ].join(' ')}
              >
                <span className="text-[2rem] leading-none mb-2" aria-hidden="true">
                  {mod.icon}
                </span>
                <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--c-text)] text-[0.875rem] leading-snug">
                  {mod.name}
                </p>
                <p className="font-[family-name:var(--font-body)] text-[var(--c-muted)] text-[0.75rem] mt-1 leading-snug">
                  {mod.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer — tonality dots + caption ───────────────────────────── */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            {TONES.map((tone, idx) => (
              <span
                key={tone}
                className="dot-pulse"
                style={{
                  backgroundColor: tone,
                  animationDelay:  `${idx * 0.15}s`,
                }}
              />
            ))}
          </div>
          <p className="font-[family-name:var(--font-mono)] text-[var(--c-dim)] text-[0.7rem]">
            --active-key-color reacts to your root note--
          </p>
        </div>

      </div>
    </>
  );
}
