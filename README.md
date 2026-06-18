# Harmony Lab Pro

App web musical interactiva para composición asistida, exploración 
armónica y secuenciación rítmica. Portafolio técnico de Brian Eduardo 
Anaya Ruiz.

**Producción:** https://clawdbot-harmony-lab.u555aa.easypanel.host  
**Repo:** https://github.com/kiffhei/harmony_lab  
**Rama principal:** main (siempre deployable)

---

## Stack

React 18 · Vite 5 · Tailwind CSS v3 · Framer Motion · Web Audio API  
Vitest · React Testing Library · Node.js HTTP · Docker multistage · EasyPanel

---

## Estado actual — Semana 2 en progreso

### ✅ Semana 1 — Completa
- 7 módulos core con TDD: MusicTheory, AudioEngine, MidiExport,
  HarmonyGraph, ProgressionEngine, SequencerEngine, TunerEngine
- 450+ tests, cobertura >99%
- MusicContext + 8 hooks
- Design system completo: tokens.css, globals.css, 9 CSS de módulos
- 4 backgrounds animados (componentes)

### ✅ Semana 2 — En progreso
**Completados:**
- DesktopLayout — sidebar 64px, panel 260px, 4 tabs, navegación
- Splash — 9 cards animadas, logo H·LAB, 12 tonality dots
- KeyExplorer — Circle of Fifths SVG, MoodBanner emocional,
  12 escalas incluyendo Double Harmonic y Phrygian Dominant
- HarmonyMap — 7 nodos diatónicos, aristas tipificadas,
  sugerencias de movimiento, 10 progresiones comunes

**Pendientes Semana 2:**
- Piano, Guitar, Progressions

**Pendientes de revisión de diseño:**
- KeyExplorer: layout height overflow en desktop
- HarmonyMap: elipse aplastada en viewports wide

### ⏳ Semana 3 — Rhythm Lab
Sequencer · PatternLibrary

### ⏳ Semana 4 — Herramientas
Tuner · SongAnalyzer · Backgrounds animados · Transiciones

### ⏳ Semana 5 — Layouts y deploy final
TabletLayout · MobileLayout · CI/CD · Deploy producción

---

## Tests

![CI](https://github.com/kiffhei/harmony_lab/actions/workflows/deploy.yml/badge.svg)

```
npm test
```

489 tests passing · 9 suites · cobertura >99% en core/

---

## Desarrollo local

```bash
npm install
npm run dev       # localhost:5173
npm run build     # build de producción
npm test          # suite completa
```

---

## Infraestructura

- **VPS:** Hostinger (EasyPanel)
- **Proyecto:** clawdbot / servicio: harmony-lab
- **CI/CD:** GitHub Actions → webhook EasyPanel en push a main
- **Docker:** multistage node:20-alpine, puerto 4000

> ⚠️ Deploy en revisión — ejecutar localmente con `npm run dev` mientras se restaura el servicio.

---

## Autor

Brian Eduardo Anaya Ruiz — Consultor de automatización  
Cuautitlán, Estado de México
