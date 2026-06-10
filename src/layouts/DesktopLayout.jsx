import React, { useState } from 'react';
import Splash from '../components/Splash/Splash.jsx';
import KeyExplorer from '../components/KeyExplorer/KeyExplorer.jsx';

const TABS = [
  { label: 'Armonía',      icon: '♩',  modules: ['Harmony Map', 'Key Explorer', 'Progressions'] },
  { label: 'Instrumentos', icon: '🎹', modules: ['Piano', 'Guitar'] },
  { label: 'Ritmo',        icon: '🥁', modules: ['Sequencer', 'Pattern Library'] },
  { label: 'Herramientas', icon: '🔧', modules: ['Tuner', 'Song Analyzer'] },
];

/**
 * ModulePlaceholder — centered name + TonalityGradient radial backdrop.
 * @param {{ name: string }} props
 */
function ModulePlaceholder({ name }) {
  return (
    <div className="flex-1 relative flex items-center justify-center">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.08]"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--active-key-color) 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10 text-center select-none">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-[var(--c-amber)] text-[length:var(--text-2xl)] tracking-[var(--ls-tight)]">
          {name}
        </h2>
        <p className="text-[var(--c-muted)] text-[length:var(--text-sm)] mt-3 font-[family-name:var(--font-body)]">
          — próximamente —
        </p>
      </div>
    </div>
  );
}

/**
 * DesktopLayout — 3-column shell: sidebar (64px) + panel (260px) + main (flex-1).
 * showSplash = true renders the home screen; false renders the active module placeholder.
 */
export default function DesktopLayout() {
  const [showSplash,   setShowSplash]   = useState(true);
  const [activeTab,    setActiveTab]    = useState(0);
  const [activeModule, setActiveModule] = useState('Harmony Map');

  function handleTabChange(idx) {
    setActiveTab(idx);
    setActiveModule(TABS[idx].modules[0]);
    setShowSplash(false);
  }

  function handleModuleClick(mod) {
    setActiveModule(mod);
    setShowSplash(false);
  }

  function handleNavigate(tabIdx, moduleName) {
    setActiveTab(tabIdx);
    setActiveModule(moduleName);
    setShowSplash(false);
  }

  return (
    <div className="app-layout">

      {/* ── Sidebar — 64px ───────────────────────────────────────────────── */}
      <nav className="sidebar-nav">

        {/* Logo mark */}
        <div className="flex items-center justify-center w-10 h-10 mb-2">
          <span className="font-[family-name:var(--font-display)] font-bold text-[var(--c-amber)] text-[length:var(--text-sm)] tracking-[var(--ls-tight)]">
            H·L
          </span>
        </div>

        {/* Inicio button */}
        <button
          title="Inicio"
          onClick={() => setShowSplash(true)}
          className={`sidebar-nav-item${showSplash ? ' active' : ''}`}
        >
          <span className="text-base leading-none" aria-hidden="true">⌂</span>
        </button>

        {/* Tab icons — active only when not on splash */}
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            title={tab.label}
            onClick={() => handleTabChange(idx)}
            className={`sidebar-nav-item${!showSplash && activeTab === idx ? ' active' : ''}`}
          >
            <span className="text-base leading-none" aria-hidden="true">{tab.icon}</span>
          </button>
        ))}

      </nav>

      {/* ── Center panel — 260px sub-navigation ──────────────────────────── */}
      <div className="w-[var(--panel-w)] shrink-0 bg-[var(--c-elevated)] border-r border-[var(--c-border)] overflow-y-auto flex flex-col">

        {/* Panel header */}
        <div className="px-4 py-3 border-b border-[var(--c-border-subtle)] shrink-0">
          <p className="font-[family-name:var(--font-condensed)] font-semibold text-[length:var(--text-xs)] tracking-[var(--ls-wide)] uppercase text-[var(--c-text-secondary)]">
            {showSplash ? 'Módulos' : TABS[activeTab].label}
          </p>
        </div>

        {/* Module list — hidden on splash */}
        {!showSplash && (
          <div className="flex flex-col py-2">
            {TABS[activeTab].modules.map((mod) => {
              const isActive = activeModule === mod;
              return (
                <button
                  key={mod}
                  onClick={() => handleModuleClick(mod)}
                  className={[
                    'block w-full text-left py-3 px-4 border-l-2 transition-colors duration-150 outline-none',
                    'font-[family-name:var(--font-body)] text-[length:var(--text-sm)]',
                    isActive
                      ? 'bg-[var(--c-elevated-2)] text-[var(--c-amber)] border-[var(--c-amber)]'
                      : 'text-[var(--c-text-secondary)] border-transparent hover:bg-[var(--c-elevated-2)]',
                  ].join(' ')}
                >
                  {mod}
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Main area — flex-1 ───────────────────────────────────────────── */}
      <main className="app-main bg-[var(--c-bg)]">
        <div className="app-content flex flex-col">
          {showSplash
            ? <Splash onNavigate={handleNavigate} />
            : activeModule === 'Key Explorer'
              ? <KeyExplorer />
              : <ModulePlaceholder name={activeModule} />
          }
        </div>
      </main>

    </div>
  );
}
