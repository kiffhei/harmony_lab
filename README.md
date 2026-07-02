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

## Estado actual — 9 módulos completos, desktop-first

### Armonía
- **HarmonyMap** — 7 nodos diatónicos, aristas tipificadas, sugerencias de movimiento,
  10 progresiones comunes, envía acordes a Progressions
- **Key Explorer** — Circle of Fifths SVG, MoodBanner emocional (12 escalas incluyendo
  Double Harmonic y Phrygian Dominant), tónica central con color dinámico por escala,
  envía acordes a Progressions
- **Progressions** — editor con reproducción real (`ProgressionPlayer`), loop, duración
  variable por acorde, export MIDI/JSON

### Instrumentos
- **Piano** — 3 octavas, resalta escala/tónica activa
- **Guitar** — 6 cuerdas × 12 trastes, resalta escala/tónica activa

### Ritmo
- **Sequencer** — drum machine de **12 instrumentos** (kick, snare, hi-hat cerrado/abierto,
  clap, 3 toms, shaker, rimshot, cowbell, cymbal) con **número de pasos configurable**
  (no solo 16 — de 1 a 64, redimensiona preservando los hits existentes)
- **Pattern Library** — **242 patrones de batería reales**, extraídos y deduplicados por
  contenido real de grid (no por nombre) de un compendio de patrones de dominio educativo,
  agrupados en 22 géneros (Rock, Electro, House, Hip Hop, Funk and Soul, Afro-Cuban,
  Drum and Bass, EDM, Reggaeton, Breaks, Drum Rolls, etc.)
- Sequencer y Progressions comparten **transporte de sesión**: dar Play en cualquiera de
  los dos arranca ambos juntos, y el motor de audio sigue sonando aunque navegues a otro
  módulo

### Herramientas
- **Tuner** — afinador por micrófono, autocorrelación FFT, rango 50Hz–1200Hz
- **Song Analyzer** — implementado y con tests, pero **oculto a propósito** de toda
  navegación (Splash, panel de módulos): el análisis de BPM/tonalidad hoy es simulado, y
  mostrar una herramienta que no analiza audio real le resta credibilidad al resto de la
  suite. Vuelve a activarse en `src/layouts/DesktopLayout.jsx` (agregar `'Song Analyzer'`
  a los módulos de Herramientas) el día que tenga detección real, ver "Pendiente" abajo

### Estado global
- Progresión, patrón de batería, tonalidad y BPM **persisten en localStorage** — sobreviven
  a un refresco del navegador
- MusicContext + 9 hooks (`useHarmonyMap`, `useProgressions`, `useSequencer`,
  `useSessionTransport`, `useTuner`, `useAudioEngine`, `useMusicContext`, `useDevice`,
  `useAnimatedBackground`)

---

## Pendiente

- **Song Analyzer**: implementar detección real de BPM/tonalidad (hoy simulado con
  valores aleatorios, sin engañar al usuario pero tampoco analiza el audio real)
- **Responsive**: solo hay `DesktopLayout` — Tablet y Mobile quedaron fuera de alcance
  a propósito por ahora
- **Backgrounds animados y microinteracciones** (`ParticlesBeat`, `TonalityGradient`,
  `FrequencyWave`, `GridPulse`) — especificados en `CLAUDE.md`, no implementados
- Limpieza menor: PropTypes en algunos componentes, test de `Splash`, `og-image.png`,
  cobertura de Vitest ampliada a `components/`

---

## Tests

![CI](https://github.com/kiffhei/harmony_lab/actions/workflows/deploy.yml/badge.svg)

```
npm test
```

627 tests passing · 18 suites · cobertura >99% en core/

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

---

## Autor

Brian Eduardo Anaya Ruiz — Consultor de automatización
Cuautitlán, Estado de México
