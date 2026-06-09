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

SEMANA 2 — MÓDULOS PRINCIPALES
├── HarmonyMap + ChordNode
├── Piano
├── Guitar
├── KeyExplorer
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

### Pendiente — Semana 2 (continuación)
- Componentes UI de módulos (HarmonyMap, Piano, Guitar, KeyExplorer, Progressions)
- Semana 3: Sequencer, PatternLibrary
- Semana 4: Tuner, SongAnalyzer, backgrounds animados, Framer Motion
- Semana 5: TabletLayout, MobileLayout, CI/CD, deploy EasyPanel

---

## 🚨 Bug activo — EasyPanel "Service is not reachable"

### Fecha: 2026-06-09
### Estado: BUILD ✅ — PROXY ❌

### Qué se hizo
1. Se confirmó que el código fuente está 100% limpio — cero CDN en index.html, src/, public/
2. Se descubrió que EasyPanel servía un HTML antiguo de 840 líneas con React CDN + Tailwind CDN
   — ese archivo NO existía en el repo, era una imagen Docker cacheada de una sesión anterior
3. Se destruyó y recreó el servicio `harmony-lab` en EasyPanel desde cero
4. Build Docker exitoso: `dist/index.html 1.06 kB`, `79.28 kB CSS`, `0 errores`
5. Se actualizó el secret `EASYPANEL_WEBHOOK_URL` en GitHub Actions con el nuevo webhook:
   `http://89.116.167.180:3000/api/deploy/8783735a2ab991b4b131b9a3570d34503eed3d11836f7669`
6. Se configuró el dominio en EasyPanel:
   `https://clawdbot-harmony-lab.u555aa.easypanel.host → http://clawdbot_harmony-lab:4000/`

### Problema actual
El proxy de EasyPanel devuelve "Service is not reachable" a pesar de que:
- El build termina con `### Success`
- El contenedor corre (CPU 0.1%, Memoria 31.7 MB)
- El puerto configurado es 4000 (correcto según Dockerfile y server.js)

### Posibles causas a investigar en la próxima sesión
1. **Nombre del contenedor incorrecto** — EasyPanel puede usar `harmony-lab` sin prefijo
   en su red Docker interna. Probar cambiar destino a `http://harmony-lab:4000/`
2. **server.js falla al arrancar** — Verificar logs del contenedor en EasyPanel → 
   harmony-lab → ícono de terminal (>_). Buscar: `Harmony Lab Pro corriendo en puerto 4000`
3. **package.json `type: "module"`** — server.js usa `import` (ESM). Verificar que
   `package.json` tenga `"type": "module"` para que Node lo ejecute correctamente
4. **`npm ci --omit=dev` falla** — Si framer-motion u otras deps están en dependencies
   (no devDependencies), el servidor de producción las necesita

### Comando de diagnóstico rápido
En EasyPanel → harmony-lab → pestaña terminal (ícono >_):
```bash
node server.js
```
Si falla, el error indicará la causa exacta.

### Webhook de deploy (nueva URL tras recrear servicio)
```
http://89.116.167.180:3000/api/deploy/8783735a2ab991b4b131b9a3570d34503eed3d11836f7669
```
