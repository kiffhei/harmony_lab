# CLAUDE.md — Harmony Lab Pro · Agente Programador

## Identidad del proyecto
Harmony Lab Pro es una app web musical interactiva para composición 
asistida, exploración armónica y secuenciación rítmica. Desarrollada 
por Brian Eduardo Anaya Ruiz como parte de su portafolio público de 
consultoría en automatización y desarrollo.

Este CLAUDE.md es el contrato técnico del proyecto. Léelo completo 
antes de ejecutar cualquier acción. Si algo no está claro, pregunta 
antes de asumir.

---

## Stack tecnológico — no negociable

- **Framework**: React 18 con hooks únicamente
- **Build**: Vite 5
- **Estilos**: Tailwind CSS v3 via PostCSS — sin CDN
- **Animaciones**: Framer Motion para transiciones de módulos y 
  micro-interacciones. CSS custom properties para tokens animados.
  Canvas API o CSS para backgrounds animados según complejidad.
- **Audio**: Web Audio API nativa — sin librerías externas
- **Tipografía**: Google Fonts — fuentes definidas por el agente 
  diseñador en su handoff (ver DESIGNER.md)
- **Testing**: Vitest para core/, React Testing Library para componentes
- **Servidor**: Node.js HTTP puro (server.js) — sin Express
- **Infraestructura**: Docker multistage + EasyPanel en VPS Hostinger
- **CI/CD**: GitHub Actions → EasyPanel deploy automático
- **Sin**: Babel standalone, React CDN, Angular, Vue, jQuery, 
  ni ningún framework CSS distinto de Tailwind

---

## Estructura del proyecto — respetar estrictamente

```
harmony-lab/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── core/
│   │   ├── MusicTheory.js
│   │   ├── AudioEngine.js
│   │   └── MidiExport.js
│   ├── components/
│   │   ├── HarmonyMap/
│   │   │   ├── HarmonyMap.jsx
│   │   │   ├── ChordNode.jsx
│   │   │   └── HarmonyMap.test.jsx
│   │   ├── Piano/
│   │   ├── Guitar/
│   │   ├── Sequencer/
│   │   ├── PatternLibrary/
│   │   ├── Progressions/
│   │   ├── Tuner/
│   │   ├── SongAnalyzer/
│   │   └── shared/
│   ├── layouts/
│   │   ├── DesktopLayout.jsx
│   │   ├── TabletLayout.jsx
│   │   └── MobileLayout.jsx
│   ├── hooks/
│   │   ├── useMusicContext.js
│   │   ├── useAudioEngine.js
│   │   ├── useDevice.js
│   │   └── useAnimatedBackground.js
│   ├── context/
│   │   └── MusicContext.jsx
│   ├── animations/
│   │   ├── transitions.js
│   │   ├── backgrounds/
│   │   │   ├── ParticlesBeat.jsx
│   │   │   ├── TonalityGradient.jsx
│   │   │   ├── FrequencyWave.jsx
│   │   │   └── GridPulse.jsx
│   │   └── microinteractions.js
│   └── styles/
│       ├── tokens.css
│       ├── globals.css
│       └── fonts.css
├── src/core/__tests__/
│   ├── MusicTheory.test.js
│   ├── AudioEngine.test.js
│   └── MidiExport.test.js
├── dist/
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vitest.config.js
├── .gitignore
├── .env.example
├── CLAUDE.md
└── DESIGNER.md
```

---

## Input del agente diseñador

Antes de escribir cualquier componente visual, verifica que exista 
el handoff del agente diseñador (DESIGNER.md) con:

- [ ] src/styles/tokens.css con CSS custom properties completas
- [ ] Especificación tipográfica (3 fuentes con jerarquías)
- [ ] Logo en SVG con variantes dark/light/icon
- [ ] Sistema de animaciones documentado con timing y dirección
- [ ] Especificación de backgrounds animados por módulo
- [ ] Paleta expandida incluyendo los 12 colores de tonalidades

Si el handoff no está completo, implementa primero los módulos 
core/ con TDD y espera el diseño antes de construir UI.

---

## Módulos funcionales — todos obligatorios

### Core (sin UI — implementar primero con TDD)

**MusicTheory.js**
```javascript
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SCALES = {
  'Major':          [0,2,4,5,7,9,11],
  'Minor':          [0,2,3,5,7,8,10],
  'Harmonic Minor': [0,2,3,5,7,8,11],
  'Dorian':         [0,2,3,5,7,9,10],
  'Phrygian':       [0,1,3,5,7,8,10],
  'Lydian':         [0,2,4,6,7,9,11],
  'Mixolydian':     [0,2,4,5,7,9,10],
  'Pentatonic Maj': [0,2,4,7,9],
  'Pentatonic Min': [0,3,5,7,10],
  'Blues':          [0,3,5,6,7,10],
};
const ROMAN = ['I','ii','iii','IV','V','vi','vii°'];

// Funciones requeridas
getScale(root, scaleName)      → string[]
getDiatonic(root, scaleName)   → Chord[]
noteFreq(note, octave)         → number (Hz)
freqToNote(freq)               → string
freqCents(freq, note)          → number
getChordQuality(notes)         → 'maj'|'min'|'dim'|'aug'
```

**AudioEngine.js**
```javascript
// Singleton — inicializar solo tras gesto del usuario
class AudioEngine {
  getContext()           // lazy init de AudioContext
  playTone(freq, dur, type, vol)
  playChord(notes, octave)
  drumKick()             // osc sweep 160Hz → 0.5Hz en 450ms
  drumSnare()            // noise + highpass 900Hz
  drumHiHat(open)        // noise + highpass 8000Hz / 7000Hz
  drumClap()             // noise + highpass 1500Hz
  drumTom(freq)          // noise + highpass variable
  drumShaker()           // noise + highpass 6000Hz
  setMasterVolume(val)
  stopAll()
}
```

**MidiExport.js**
```javascript
// Sin librerías — implementación binaria manual
// Header: [0x4D,0x54,0x68,0x64,0,0,0,6,0,1,0,1,0,96]
// Drums: canal 9 (0x99/0x89)
// GM drum map: kick=36, snare=38, hh_c=42, hh_o=46,
//              clap=39, tom1=48, tom2=47, shaker=69

exportProgression(chords, bpm)  → descarga .mid
exportDrums(pattern, bpm)       → descarga .mid
```

### Componentes UI

Cada componente vive en su propia carpeta con su test.

| Componente | Descripción |
|---|---|
| HarmonyMap | Nodos de acordes diatónicos, clickables, con relaciones |
| Piano | 3 octavas, notas resaltadas por escala, audio en click |
| Guitar | 6 cuerdas 12 trastes, escala resaltada, audio por traste |
| Sequencer | Grid 16 pasos × 8 drums, BPM, play/stop, loop |
| PatternLibrary | Cards con mini-grid de kick, filtro por género y tags |
| Progressions | Editor visual, play secuencial, exportar MIDI |
| Tuner | Micrófono, autocorrelación FFT, nota + cents + barra visual |
| SongAnalyzer | Upload audio, BPM detection, key, timbre, sugerencias |
| KeyExplorer | Selector root + scale, notas, grados, funciones |

---

## Estado global — MusicContext

```javascript
{
  rootNote,     setRootNote,     // 'C' default
  scaleName,    setScaleName,    // 'Major' default
  activeChord,  setActiveChord,  // null default
  progression,  setProgression,  // [] default
  bpm,          setBpm,          // 120 default
  isPlaying,    setIsPlaying,    // false default
  audioEngine,                   // ref, singleton
}
```

---

## Sistema de animaciones

### Dirección de transiciones
```
Módulos con scroll horizontal (Piano, Guitar, Sequencer)
  → AnimatePresence slide horizontal
  → x: '100%' entrada, x: '-100%' salida

Módulos verticales (HarmonyMap, Tuner, Analyzer, KeyExplorer)
  → AnimatePresence fade + scale
  → opacity: 0→1, scale: 0.96→1

Navegación principal entre tabs
  → Seguir especificación del diseñador en DESIGNER.md
```

### Backgrounds animados
- **ParticlesBeat**: Canvas 2D, partículas en grid de 16 columnas, 
  opacidad reactiva al step activo del sequencer
- **TonalityGradient**: CSS custom property --active-key-color 
  cambia con rootNote. Transición 600ms ease.
- **GridPulse**: CSS animation, opacity y scale en sync con isPlaying
- **FrequencyWave**: Canvas 2D, AnalyserNode del AudioContext si 
  está activo, sinusoide suave si no
- Todos los backgrounds: z-index 0, pointer-events none, 
  opacity máxima 0.15 sobre el contenido

### Micro-interacciones mínimas
```
ChordNode click      → spring scale 1→1.08→1, 150ms
Piano key press      → translateY 2px, shadow inset
Sequencer step on    → glow animado color del instrumento
Tuner in-tune        → pulse verde 3 veces y detiene
Pattern card hover   → translateY -4px, shadow amber
Button primary       → brightness 1.1 hover, scale .97 active
```

---

## Diferencias por dispositivo

| Feature | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | sidebar 64px + panel 260px + main | full height + bottom nav | single column + bottom nav |
| Navegación | sidebar icons + tooltips | bottom nav 4 tabs | bottom nav + sub-tabs |
| Piano teclas blancas | 28px | 32px | 36px |
| Chord buttons | min 36px | min 44px | min 56px |
| Seq step height | 28px | 32px | 34px |
| Seq labels | completos | abreviados | ultracortos |
| Safe area iOS | no | no | env(safe-area-inset-bottom) |

---

## Infraestructura

### Dockerfile — multistage obligatorio
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.js package*.json ./
RUN npm ci --production
EXPOSE 4000
ENV PORT=4000
CMD ["node","server.js"]
```

### VPS
```
IP:       89.116.167.180
Panel:    EasyPanel puerto 3000
Proyecto: clawdbot
Servicio: harmony-lab
URL:      https://clawdbot-harmony-lab.u555aa.easypanel.host/
```

---

## Reglas de código — no negociables

- React funcional con hooks únicamente, cero class components
- useCallback y useMemo solo cuando el profiler lo justifique
- Props con PropTypes o JSDoc — no TypeScript en esta fase
- Un archivo por componente, carpeta propia, test incluido
- MusicContext para estado global, useState para UI local
- AudioContext se crea únicamente tras primer gesto del usuario
- Tailwind utility classes — cero CSS inline salvo valores dinámicos
- Cero styled-components, cero CSS modules
- Commits semánticos: feat / fix / refactor / docs / style / test / chore
- Una rama por feature — no pushear directamente a main
- core/ con cobertura > 90% antes de construir UI

---

## Orden de implementación

```
SEMANA 1 — FUNDAMENTOS
├── /init-project    → estructura, configs, Dockerfile
├── /ckm-design-system → cargar tokens del diseñador
├── /tdd → MusicTheory.js + tests completos
├── /tdd → AudioEngine.js + tests completos
├── /tdd → MidiExport.js + tests completos
└── MusicContext.jsx + hooks

SEMANA 2 — MÓDULOS PRINCIPALES (EN PROGRESO)
├── ✅ Bloque 1: DesktopLayout + Splash
├── ✅ Bloque 2: KeyExplorer
│     - Circle of Fifths SVG interactivo
│     - MoodBanner con 12 escalas (incl. Double Harmonic, Phrygian Dominant)
│     - Gradiente dual --active-key-color + --active-scale-color
│     ⚠️  PENDIENTE DISEÑO: layout height overflow en desktop (~691px)
│         Ver sección "Pendiente de revisión" en DESIGNER.md
├── ✅ Bloque 3: HarmonyMap
│     - 7 nodos diatónicos en elipse con aristas tipificadas
│     - Panel de sugerencias por acorde activo
│     - 10 progresiones comunes cargables con 1 click
│     ⚠️  PENDIENTE: elipse aplastada en desktop wide — fix en curso
├── Piano
├── Guitar
└── Progressions

SEMANA 3 — RHYTHM LAB
├── Sequencer (16 pasos × 8 drums)
├── PatternLibrary
└── Integración Sequencer ↔ backgrounds animados

SEMANA 4 — HERRAMIENTAS Y ANIMACIONES
├── Tuner (micrófono + autocorrelación)
├── SongAnalyzer (upload + análisis)
├── Backgrounds animados
└── Transiciones con Framer Motion

SEMANA 5 — LAYOUTS Y DEPLOY
├── DesktopLayout
├── TabletLayout
├── MobileLayout (iPhone 12 Pro 390×844)
├── server.js multientrada
├── GitHub Actions CI/CD
└── Deploy producción EasyPanel
```

---

## Skills de Claude Code

```
ARRANQUE
/brainstorming          → validar arquitectura
/plan                   → plan técnico con dependencias
/init-project           → scaffolding completo

DISEÑO
/ckm-design-system      → cargar tokens del diseñador
/ui-ux-pro-max          → antes de cada componente visual

DESARROLLO
/cc-dev-agent           → modo activo durante implementación
/tdd                    → todo lo que está en core/
/anthropic-skills:web-artifacts-builder → componentes complejos

CALIDAD
/verify                 → después de cada módulo
/frontend-code-review   → antes de cada PR
/security-review        → antes del deploy
/simplify               → después de tener todo funcional

GIT
/commit-push-pr         → después de cada feature
/finishing-a-development-branch → al cerrar cada semana
/update-docs            → README actualizado por fase

CIERRE
/session-wrap           → resumen y próximos pasos
```

---

## Estado de la Semana 2 — registro de incidencias

### Patrón de deploy identificado
EasyPanel no siempre dispara build nuevo con cada push.
Síntoma: deploy completa en <5s (restart) en lugar de ~60s (build).
Solución probada: `git commit --allow-empty -m "chore: force rebuild"`
Causa raíz: aún sin confirmar — puede ser caché de capas Docker.

### Flujo de ramas establecido
- Una rama por bloque: feat/key-explorer, feat/harmony-map, etc.
- Tag de backup antes de cada bloque: backup/pre-bloqueN
- Merge --no-ff a main al aprobar screenshot
- NUNCA push directo a main durante desarrollo activo
- El snapshot pre-sesión NO va a main — solo como tag local

### Escalas agregadas a MusicTheory.js
Semana 2 extendió el sistema con 2 escalas nuevas:
- Double Harmonic [0,1,4,5,7,8,11] — Raga Bhairav / Glass Beams
- Phrygian Dominant [0,1,4,5,7,8,10] — Makam Hüseyni / King Gizzard
Total escalas: 12. Tests de MusicTheory: 85 passing.

### Módulos con layout pendiente de revisión de diseño
- KeyExplorer: columna derecha desborda en viewports < 750px alto
- HarmonyMap: elipse de nodos aplastada en viewports wide (>1000px)
Ambos documentados en DESIGNER.md sección "Pendiente de revisión".

---

## Criterios de aceptación — Fase 1 completa

- [ ] `npm run build` sin errores ni warnings críticos
- [ ] `npm test` con cobertura > 90% en core/
- [ ] App carga en < 3 segundos en conexión normal
- [ ] Todos los módulos funcionales sin errores en consola
- [ ] Piano reproduce audio en desktop, tablet y mobile
- [ ] Sequencer corre en loop entre 60 y 180 BPM
- [ ] Tuner detecta notas en rango 50Hz-1200Hz
- [ ] Song Analyzer procesa MP3 menor a 5MB
- [ ] MIDI export genera archivos válidos para Ableton
- [ ] Detección de dispositivo sirve el layout correcto
- [ ] Docker build exitoso, contenedor corre en $PORT
- [ ] URL de producción carga en Chrome, Safari y Firefox
- [ ] iPhone 12 Pro (390×844): navegación y módulos usables
- [ ] cafe-plus en EasyPanel sigue funcionando sin cambios

---

## Contexto del autor

Brian Eduardo Anaya Ruiz — Consultor de automatización y 
transformación digital. Cuautitlán, Estado de México.
Stack principal: n8n, EasyPanel, Evolution API, Supabase, 
OpenAI, Google Workspace, Aspel ERP.
Portafolio técnico público — el código debe ser legible, 
bien documentado y presentable.
Rama main siempre deployable.

---

## Estado al cierre de sesión — Semana 2 · Block 1 completado

### Core completado (450 tests) — Semana 1
- MusicTheory.js, AudioEngine.js, MidiExport.js
- SequencerEngine.js, HarmonyGraph.js
- ProgressionEngine.js, TunerEngine.js

### Hooks completados — Semana 1
- useMusicContext, useAudioEngine, useDevice
- useAnimatedBackground, useSequencer
- useHarmonyMap, useProgressions, useTuner

### Sistema de diseño completado — Semana 1
- src/styles/tokens.css — paleta, tipografía, tokens
- src/styles/globals.css — componentes base con estados
- src/styles/modules/ — identidad visual 9 módulos
- src/animations/backgrounds/ — 4 backgrounds animados
- components.json — registry @cult-ui configurado
- .mcp.json — MCP shadcn configurado

### Semana 2 · Block 1 — Shell de navegación + Splash ✅

**Commits:**
- `40c58b2` feat(layout): desktop shell with 4-tab navigation and tonality gradient
- `d1bef56` feat(splash): welcome screen with animated module cards and tonality dots

**Archivos creados/modificados:**
- `src/App.jsx` — MusicProvider + DesktopLayout + import globals.css
- `src/layouts/DesktopLayout.jsx` — shell 3 columnas: sidebar 64px + panel 260px + main flex-1
- `src/components/Splash/Splash.jsx` — pantalla de inicio con 9 cards animadas

**Decisiones de implementación:**
- Shell usa clases CSS del design system (`.app-layout`, `.sidebar-nav`, `.sidebar-nav-item`)
- Tailwind arbitrary values para tokens: `bg-[var(--c-elevated)]`, `text-[var(--c-amber)]`, etc.
- Splash abre por defecto (`showSplash = true`); botón ⌂ regresa a ella desde cualquier módulo
- Cards con stagger animation vía `<style>` keyframes: delay `idx * 60ms`
- 12 dots de tonalidad con `dotPulse` 2s infinite, delay `idx * 0.15s`
- TonalityGradient en placeholder: `radial-gradient` con `var(--active-key-color)` (reacciona a MusicContext)
- Panel muestra "Módulos" sin sub-nav cuando showSplash = true

**Navegación funcional:**
- 4 tabs: Armonía / Instrumentos / Ritmo / Herramientas
- Cambiar tab → primer módulo del tab queda activo
- Click en card del Splash → navega directo al módulo correcto
- `npm run build` ✅ — 0 errores, 0 warnings

### Pendiente — actualizado 2026-07-01
- ✅ Piano, Guitar, Progressions, Sequencer, PatternLibrary, Tuner, SongAnalyzer — completos
- SongAnalyzer: análisis de BPM/tonalidad sigue simulado — pendiente detección real
- Semana 5: TabletLayout, MobileLayout — fuera de alcance por ahora (desktop-first)
- Backgrounds animados (`ParticlesBeat`, `FrequencyWave`, `GridPulse`) y microinteracciones — no implementados
- Limpieza menor: PropTypes en Piano/Guitar/Sequencer/SongAnalyzer/Tuner, test de Splash,
  `public/og-image.png`, cobertura de Vitest ampliada a `components/`

---

## ✅ Resuelto — EasyPanel "Service is not reachable"

**Bug original:** 2026-06-09. **Resuelto:** confirmado en sesión del 2026-07-01 —
la URL de producción responde HTTP 200 y sirve el build correcto (verificado con curl
y con el usuario confirmando visualmente los módulos Sequencer/PatternLibrary/Tuner/
SongAnalyzer cargando en `https://clawdbot-harmony-lab.u555aa.easypanel.host/`).
No se identificó cuál de las causas candidatas (nombre de contenedor, server.js,
`type: module`, `npm ci --omit=dev`) fue la que se corrigió — probablemente se resolvió
junto con un redeploy posterior. Si reaparece, las hipótesis de la sección original
(antes de esta actualización) siguen siendo el punto de partida para diagnosticar.

El webhook de deploy fue rotado por el usuario antes de esta sesión (el valor expuesto
en `AUDIT.md`/`DEV_TASKS.md`/`PLAN.md` — señalado en `AUDIT_REPORT.md` B-1 — ya no es válido).
La URL vigente vive únicamente en el secret `EASYPANEL_WEBHOOK_URL` de GitHub Actions.

---

## Estado al cierre de sesión — 2026-07-01 · Post-auditoría

Rama de trabajo: `audit/portfolio-readiness` (mergeada a `main`). Commits de la sesión:
`a007eb1`, `c53a8d6`, `d39dba2`, `cec7cb4`, `f29147e`, `7b27f3e`, `5b8c503`, `3edaf77`,
`9077e28`, `ded6011`.

### Etapa 1 — Bugs P0 del audit + sesión unificada
- Fix B-6 (test flaky de SongAnalyzer) y B-2 (PatternLibrary → Sequencer desconectado,
  `pattern` ahora vive en `MusicContext` igual que `progression`)
- `Progressions.jsx` dejó de reinventar un scheduler con `setInterval` y usa el hook
  `useProgressions` (ya existía construido y sin usar, respaldado por `ProgressionPlayer`)
- Nuevo hook `useSessionTransport`: Play/Stop desde Sequencer o Progressions arranca/detiene
  ambos motores juntos; los engines viven en refs de `MusicContext` (no locales al
  componente) para seguir sonando al navegar a otro módulo
- KeyExplorer gana botón "+ Agregar a progresión" (antes solo HarmonyMap lo tenía)
- Persistencia de sesión en `localStorage` (rootNote, scaleName, bpm, progression, pattern)

### Fix visual — KeyExplorer
- El nodo central del Circle of Fifths usaba `motion.g` de Framer Motion con
  `originX/originY: 0`, que renderiza mal dentro de SVG — el texto se escapaba del
  círculo como una placa flotante recortada. Se reemplazó por un `<g>` estático;
  por pedido del usuario ahora solo muestra la tónica (la sensación de la escala ya
  se ve en el MoodBanner del panel derecho)
- La tónica central ahora cambia de color según `SCALE_MOOD[scaleName].color`

### Pattern Library real + Sequencer de 12 instrumentos + pasos variables
- 242 patrones de batería reales (no inventados), extraídos y deduplicados **por
  contenido real de grid** de "Pocket Operations" (Paul Wenzel) — 22 géneros reales.
  Los otros 3 libros en `pattern_books/` (200/260 patrones, Famous Drum Beats) son
  escaneos de imagen o prosa — decisión del usuario: no arriesgar transcripción manual
  imprecisa, quedaron fuera. `pattern_books/` está en `.gitignore` (material de terceros
  con copyright) — solo se commitea `drumPatternsData.js` (data numérica derivada)
- Sequencer pasó de 8 a 12 instrumentos: se separó el tom único en 3 (hi/mid/lo) y se
  agregaron rimshot, cowbell, cymbal (nuevos synths en `AudioEngine.js`), para que
  patrones como "SON CLAVE" suenen completos en vez de perder instrumentos
  - Bug encontrado de paso: `INSTRUMENTS` tenía `hn_o` pero el switch de reproducción
    buscaba `hh_o` — el hi-hat abierto nunca sonaba. Se corrigió al renombrar instrumentos
- Número de pasos ya no fijo en 16 — control numérico junto al BPM (1-64), redimensiona
  preservando los hits existentes (`resizePattern()`)

### Seguridad — limpieza de docs
- Se encontró el webhook de EasyPanel (ya rotado, pero en texto plano) expuesto también en
  `AUDIT.md`, `PLAN.md`, `DEV_TASKS.md`, `PROMPT_KICKOFF.md` y en el propio `AUDIT_REPORT.md`
  de esta sesión (el reporte de seguridad reproducía la vulnerabilidad que describía) —
  redactado en los 5 archivos trackeados, más `CLAUDE.internal.md` (local, gitignoreado)

### Song Analyzer oculto de la navegación
- El usuario pidió dejarlo como "fantasma": sigue implementado y referenciado (import +
  rama del ternario en `DesktopLayout.jsx`, componente y tests intactos) pero ya no aparece
  ni en Splash ni en el panel de Herramientas — esa pestaña cae directo en Tuner. Motivo:
  una feature simulada visible junto a herramientas reales le resta credibilidad a todas.
  Reactivar agregando `'Song Analyzer'` de vuelta a `TABS` (DesktopLayout.jsx) y `MODULES`
  (Splash.jsx) el día que tenga detección real

### Key Explorer — orden y feedback de audio
- Key Explorer pasó a ser el primer módulo de Armonía (antes Harmony Map) — es donde se
  elige la tonalidad de trabajo, tiene más sentido como punto de entrada
- Ninguna selección de tono reproducía audio (nodos del círculo, selects, filas de grado).
  Ahora: click en nodo o cambiar tónica reproduce esa nota; cambiar escala reproduce el
  acorde tónico de la nueva escala; click en fila de grado reproduce ese acorde

### Navegación colapsable
- Sidebar principal (64px) y panel de sub-navegación (260px) comparten un solo estado:
  arrancan expandidos, se repliegan solos a los 4s, y un botón `«`/`»` al final del sidebar
  los expande/retrae manualmente en cualquier momento. Detalle de diseño en `DESIGNER.md`
  sección "Navegación colapsable"

### Estado de tests y deploy
- 632 tests pasando (18 suites), build limpio, verificado end-to-end en navegador real
  (Playwright headless) en cada etapa antes de commitear
- Deploy a producción confirmado funcionando (ver sección "Resuelto" arriba)

### Pendiente real para portafolio 100% listo
- SongAnalyzer: implementar detección real de BPM/tonalidad (sigue simulado y oculto)
- Responsive (Tablet/Mobile), backgrounds animados, microinteracciones — fuera de
  alcance de esta sesión, no iniciados
- Limpieza menor listada en "Pendiente — actualizado 2026-07-01" arriba
- Sesión cerrada — retomar desde aquí en la próxima sesión
