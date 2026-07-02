import React, { useState, useEffect } from 'react';
import Splash from '../components/Splash/Splash.jsx';
import HarmonyMap from '../components/HarmonyMap/HarmonyMap.jsx';
import KeyExplorer from '../components/KeyExplorer/KeyExplorer.jsx';
import Piano from '../components/Piano/Piano.jsx';
import Guitar from '../components/Guitar/Guitar.jsx';
import Progressions from '../components/Progressions/Progressions.jsx';
import Sequencer from '../components/Sequencer/Sequencer.jsx';
import PatternLibrary from '../components/PatternLibrary/PatternLibrary.jsx';
import Tuner from '../components/Tuner/Tuner.jsx';
import SongAnalyzer from '../components/SongAnalyzer/SongAnalyzer.jsx';

const TABS = [
  { label: 'Armonía',      icon: '♩',  modules: ['Key Explorer', 'Harmony Map', 'Progressions'] },
  { label: 'Instrumentos', icon: '🎹', modules: ['Piano', 'Guitar'] },
  { label: 'Ritmo',        icon: '🥁', modules: ['Sequencer', 'Pattern Library'] },
  // Song Analyzer queda fuera de esta lista a propósito — sigue implementado y
  // referenciado más abajo (import + rama del ternario), pero no se muestra en
  // ninguna navegación mientras el análisis de audio siga siendo simulado.
  { label: 'Herramientas', icon: '🔧', modules: ['Tuner'] },
];

/** Tiempo antes de que la barra lateral expandida se repliegue sola. */
const SIDEBAR_AUTO_COLLAPSE_MS = 4000;

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
  const [showSplash,       setShowSplash]       = useState(true);
  const [activeTab,        setActiveTab]        = useState(0);
  const [activeModule,     setActiveModule]     = useState('Key Explorer');
  const [sidebarExpanded,  setSidebarExpanded]  = useState(true);

  // Auto-repliegue: cada vez que la barra pasa a expandida (al montar o al
  // desplegarla manualmente), agenda su repliegue automático. Si se retrae
  // antes manualmente, el cleanup cancela el timer pendiente.
  useEffect(() => {
    if (!sidebarExpanded) return;
    const timer = setTimeout(() => setSidebarExpanded(false), SIDEBAR_AUTO_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [sidebarExpanded]);

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

      {/* ── Sidebar — colapsable, 64px / 180px expandida ───────────────────── */}
      <nav className={`sidebar-nav${sidebarExpanded ? ' expanded' : ''}`}>

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
          {sidebarExpanded && <span className="sidebar-nav-label">Inicio</span>}
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
            {sidebarExpanded && <span className="sidebar-nav-label">{tab.label}</span>}
          </button>
        ))}

        {/* Spacer — empuja el botón de expandir/retraer al final de la barra */}
        <div className="flex-1" />

        {/* Expandir / retraer */}
        <button
          title={sidebarExpanded ? 'Retraer barra lateral' : 'Desplegar barra lateral'}
          aria-label={sidebarExpanded ? 'Retraer barra lateral' : 'Desplegar barra lateral'}
          onClick={() => setSidebarExpanded((prev) => !prev)}
          className="sidebar-nav-item sidebar-toggle-btn"
        >
          <span className="text-base leading-none" aria-hidden="true">
            {sidebarExpanded ? '«' : '»'}
          </span>
          {sidebarExpanded && <span className="sidebar-nav-label">Retraer</span>}
        </button>

      </nav>

      {/* ── Center panel — 260px sub-navigation, colapsa junto con el sidebar ── */}
      <div className={`center-panel${!sidebarExpanded ? ' collapsed' : ''} shrink-0 bg-[var(--c-elevated)] border-r border-[var(--c-border)] flex flex-col`}>

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
        <div className="app-content flex flex-col h-full min-h-0">
          {showSplash
            ? <Splash onNavigate={handleNavigate} />
            : activeModule === 'Harmony Map'
              ? <HarmonyMap />
              : activeModule === 'Key Explorer'
                ? <KeyExplorer />
                : activeModule === 'Progressions'
                  ? <Progressions />
                  : activeModule === 'Piano'
                    ? <Piano />
                    : activeModule === 'Guitar'
                      ? <Guitar />
                      : activeModule === 'Sequencer'
                        ? <Sequencer />
                        : activeModule === 'Pattern Library'
                          ? <PatternLibrary />
                          : activeModule === 'Tuner'
                            ? <Tuner />
                            : activeModule === 'Song Analyzer'
                              ? <SongAnalyzer />
                              : <ModulePlaceholder name={activeModule} />
          }
        </div>
      </main>

    </div>
  );
}
