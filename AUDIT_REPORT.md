# AUDIT REPORT — Harmony Lab Pro
> Rama: `audit/portfolio-readiness`  
> Fecha: 2026-06-30  
> Auditor: Claude Sonnet 4.6

---

## 🔄 Actualización post-auditoría (2026-07-01)

Resuelto desde esta auditoría (ver `CLAUDE.md` → "Estado al cierre de sesión — 2026-07-01"
para el detalle completo):

| Item | Estado |
|---|---|
| B-1 Webhook expuesto | ✅ Rotado por el usuario antes de esta sesión |
| B-2 PatternLibrary ↔ Sequencer desconectados | ✅ Arreglado — `pattern` vive en `MusicContext` |
| B-6 Test flaky de SongAnalyzer | ✅ Arreglado |
| I-3 README desactualizado | ✅ Reescrito con estado real |
| I-8 Estado de la URL de producción | ✅ Confirmado funcionando (HTTP 200, verificado por el usuario) |
| N-1 `harmony-lab-pro.tar.gz` trackeado | ⚠️ El archivo existe localmente pero **no está trackeado** en git — el hallazgo original era impreciso |
| N-5 `.env.example` ausente | ✅ Ya existía al momento de esta actualización |

**Sigue pendiente:** B-3 (SongAnalyzer simulado), B-4 (backgrounds animados), B-5 (responsive
tablet/mobile), I-1/I-2 (overflow de layout en HarmonyMap/KeyExplorer, sin re-verificar),
I-4 (PropTypes), I-5 (test de Splash), I-6 (og-image.png), I-7 (ternario de DesktopLayout),
N-2 (cobertura solo en `core/`), N-3, N-4, N-6.

**Fuera del alcance original de este audit, agregado por pedido del usuario en la misma sesión:**
Pattern Library con 242 patrones reales (no inventados) extraídos de un libro de patrones,
Sequencer expandido de 8 a 12 instrumentos, número de pasos configurable (antes fijo en 16).

---

## Resumen ejecutivo

El proyecto tiene una base técnica muy sólida: 9 módulos UI existen y compilan, el layer de `core/` supera 99% de cobertura con 454 tests, el build produce 0 errores y el Dockerfile es correcto. Sin embargo, quedan **6 bloqueantes críticos** que harían que un visitante del portafolio vea funciones rotas o comportamientos engañosos. Los más urgentes son el webhook de deploy expuesto en git, la desconexión silenciosa entre PatternLibrary y Sequencer, el análisis de audio completamente simulado sin disclamer, y la ausencia total de los 4 backgrounds animados y de los layouts responsive. Con la corrección de los items 🔴 y 🟡, el proyecto estaría listo para portafolio público.

---

## 🔴 Bloqueantes — rompen la demo o se ven rotos

### B-1: Webhook EasyPanel en texto plano en git history (SEGURIDAD)

**Archivos afectados:** `AUDIT.md`, `DEV_TASKS.md`, `PLAN.md`  
**Commits que lo contienen:** `1036aac`, `476540a`

```
[URL rotada — almacenada solo en GitHub Secret EASYPANEL_WEBHOOK_URL]
```

Cualquiera que clone el repo público puede disparar un deploy en producción. Adicionalmente, la IP del VPS (`89.116.167.180`) está en `CLAUDE.md` (commit `59e0b79`). El webhook está en el historial de git — borrarlo del working tree no basta.

**Acción requerida antes de hacer el repo público:**
1. Revocar y regenerar el webhook en EasyPanel inmediatamente.
2. Usar `git filter-repo` o BFG para limpiar `AUDIT.md`, `DEV_TASKS.md`, `PLAN.md` del historial, o hacer el repo privado y documentar la URL solo en GitHub Secrets.

---

### B-2: PatternLibrary → Sequencer completamente desconectados

**Archivo:** `src/layouts/DesktopLayout.jsx:53,162`

```jsx
const [seqPattern, setSeqPattern] = useState(null);  // ← estado muerto

// PatternLibrary llama setSeqPattern...
<PatternLibrary onLoadPattern={setSeqPattern} />

// ...pero Sequencer nunca recibe el patrón:
<Sequencer />  // ← no recibe props
```

Hacer click en "Cargar" en una pattern card parece funcionar (la card se selecciona), pero no carga nada en el Sequencer. El estado `seqPattern` nunca se consume. Un visitante del portafolio que intente cargar un patrón de batería y luego cambie al Sequencer encontrará el grid vacío. Este es el bug más visible en una demo.

---

### B-3: SongAnalyzer — análisis completamente simulado sin disclamer

**Archivo:** `src/components/SongAnalyzer/SongAnalyzer.jsx:8-18`

```javascript
function simulateAnalysis() {
  const KEYS  = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const MODES = ['Major', 'Minor'];
  return {
    bpm:  Math.round(90 + Math.random() * 80),   // ← completamente aleatorio
    key:  KEYS[Math.floor(Math.random() * KEYS.length)],
    mode: MODES[Math.floor(Math.random() * MODES.length)],
    ...
  };
}
```

La función no analiza el audio — devuelve valores aleatorios. El módulo procesa el archivo correctamente (valida formato, tamaño) pero el "análisis" es pura simulación. No hay ningún label en la UI que indique esto. Un visitante que suba su canción favorita verá resultados contradictorios que cambiarán si reintenta. Para portafolio esto es peor que no tener la feature.

**Opciones:** (a) Agregar un banner visible `"Demo — análisis simulado"` o (b) implementar detección real de BPM con WebAudio autocorrelación (el `TunerEngine.js` ya tiene la infraestructura).

---

### B-4: Animated backgrounds inexistentes — carpeta completamente vacía

**Directorio:** `src/animations/backgrounds/` (VACÍO)

Los 4 componentes de background especificados en CLAUDE.md no existen:
- `ParticlesBeat.jsx` — ❌ no existe
- `TonalityGradient.jsx` — ❌ no existe  
- `FrequencyWave.jsx` — ❌ no existe
- `GridPulse.jsx` — ❌ no existe

`src/animations/transitions.js` — ❌ no existe  
`src/animations/microinteractions.js` — ❌ no existe

La app actual funciona con Tailwind y un gradiente estático inline en `DesktopLayout.jsx`. Las micro-interacciones especificadas (spring en ChordNode, glow en Sequencer, pulse en Tuner) no están implementadas. Para portafolio visual esto es llamativo por ausencia.

---

### B-5: Sin layouts responsive — solo DesktopLayout existe

**Especificados en CLAUDE.md y ausentes:**
- `src/layouts/TabletLayout.jsx` — ❌
- `src/layouts/MobileLayout.jsx` — ❌

El criterio de aceptación `"iPhone 12 Pro (390×844): navegación y módulos usables"` no puede cumplirse. La app renderiza siempre el layout de escritorio. En mobile la experiencia es difícil de usar (teclas de piano de 28px, sin safe-area-inset, sidebar de 64px compitiendo con espacio de contenido).

---

### B-6: 1 test fallando — `npm test` sale con código 1

**Archivo:** `src/components/SongAnalyzer/SongAnalyzer.test.jsx:74`

```
FAIL  SongAnalyzer > shows results after analysis timeout
→ Test timed out in 5000ms.
```

El test usa `vi.useFakeTimers()` + `vi.advanceTimersByTime(2001)` + `waitFor(...)` pero el timeout de waitFor (que por defecto es 1000ms en jsdom) expira antes de que React actualice el estado. El test es válido — detecta comportamiento real — pero necesita `{ timeout: 3000 }` en el waitFor o un `await act(async () => {})` adicional.

```
Test Files  1 failed | 15 passed (16)
Tests       1 failed | 577 passed (578)
```

El CI en GitHub Actions fallará en `npm run test:coverage` lo que bloqueará el job de deploy.

---

## 🟡 Importantes — afectan percepción de calidad

### I-1: HarmonyMap — elipse aplastada en viewports anchos

**Documentado en:** `DESIGNER.md:528-550`

El fix con ResizeObserver fue commiteado (`dd36399`) pero DESIGNER.md aún lo marca como "Pendiente de revisión". El ratio calculado puede producir distribución horizontal aplastada en viewports >1000px de ancho. Requiere verificación en browser a pantalla completa.

---

### I-2: KeyExplorer — height overflow en columna derecha

**Documentado en:** `DESIGNER.md:505-526`

La columna derecha (lista de grados diatónicos + MoodBanner) desborda en viewports < 750px de altura sin scroll visible. Requiere `overflow-y: auto` con altura máxima explícita. Documentado como pendiente desde Semana 2.

---

### I-3: README desactualizado — no presenta el estado real del proyecto

**Archivo:** `README.md`

Problemas específicos:
- Dice `"489 tests passing"` → real: 577 passing + 1 failing
- Dice Piano/Guitar/Progressions son `"Pendientes Semana 2"` → están implementados
- Dice Sequencer/PatternLibrary son `"Semana 3"` → están implementados
- Tiene `⚠️ Deploy en revisión` hardcoded → necesita resolverse o eliminarse
- No hay screenshot, GIF ni video demo
- El contador del badge CI apunta a un repo que puede tener historial sensible

Para portafolio público el README es la primera impresión. El estado actual confunde más de lo que presenta.

---

### I-4: PropTypes faltantes en 6 componentes

**CLAUDE.md requiere** PropTypes o JSDoc en todos los componentes:

| Componente | Props que tiene | PropTypes declaradas |
|---|---|---|
| Piano.jsx | ninguna (consume context) | ❌ ausente |
| Guitar.jsx | ninguna | ❌ ausente |
| Sequencer.jsx | ninguna | ❌ ausente |
| SongAnalyzer.jsx | ninguna | ❌ ausente |
| Progressions.jsx | ninguna | ❌ ausente |
| Tuner.jsx | ninguna | ❌ ausente |
| Splash.jsx | `onNavigate: func` | ❌ solo JSDoc, sin PropTypes import |

Los componentes sin props pueden declarar `ComponentName.propTypes = {}` para cumplir el contrato. Splash sí recibe `onNavigate` y debería validarlo.

---

### I-5: Splash.jsx no tiene archivo de test

**Directorio:** `src/components/Splash/` — solo `Splash.jsx`, sin `Splash.test.jsx`

Es el único componente UI sin test. Según CLAUDE.md: "cada componente vive en su propia carpeta **con su test**."

---

### I-6: public/og-image.png ausente

**Especificado en CLAUDE.md en la estructura de `/public/`**

Solo existe `public/favicon.svg`. La imagen OG es crítica para portafolio — cuando alguien comparta el link en Twitter/LinkedIn/WhatsApp se verá genérico en lugar de una preview del producto.

---

### I-7: DesktopLayout routing — ternario de 10 niveles de profundidad

**Archivo:** `src/layouts/DesktopLayout.jsx:149-167`

```jsx
{showSplash ? <Splash />
  : activeModule === 'Harmony Map' ? <HarmonyMap />
    : activeModule === 'Key Explorer' ? <KeyExplorer />
      : activeModule === 'Progressions' ? <Progressions />
        : activeModule === 'Piano' ? <Piano />
          : activeModule === 'Guitar' ? <Guitar />
            : activeModule === 'Sequencer' ? <Sequencer />
              : activeModule === 'Pattern Library' ? <PatternLibrary onLoadPattern={setSeqPattern} />
                : activeModule === 'Tuner' ? <Tuner />
                  : activeModule === 'Song Analyzer' ? <SongAnalyzer />
                    : <ModulePlaceholder name={activeModule} />
}
```

Viola CLAUDE.md (no deep nesting >4 levels) y las coding-style rules. Un Map de nombre → componente resuelve esto en 3 líneas.

---

### I-8: Estado de la URL de producción desconocido

**URL:** `https://clawdbot-harmony-lab.u555aa.easypanel.host/`

CLAUDE.md documenta el bug `"Service is not reachable"` del 2026-06-09 sin resolución confirmada. El README tiene el warning activo. Este es probablemente el item más importante a resolver antes de compartir el portafolio — si la URL está caída, toda la demo visual no existe.

---

## 🟢 Nice-to-have — pulido, no crítico

### N-1: `harmony-lab-pro.tar.gz` trackeado en git

Un archivo de 2.7MB en la raíz del repo que no debería estar en control de versiones. Añadir a `.gitignore` y usar `git rm --cached`.

---

### N-2: Coverage solo trackea `src/core/**` — componentes no reportados

**Archivo:** `vitest.config.js:14`

```javascript
include: ['src/core/**/*.js'],
```

Los 9 componentes tienen tests pero su cobertura no se rastrea ni aparece en el reporte de CI. Añadir `src/components/**/*.jsx` y `src/hooks/**/*.js` al include daría visibilidad completa.

---

### N-3: No hay lazy loading para los módulos

Los 9 componentes se importan de forma estática en `DesktopLayout.jsx`. Con el bundle actual (58KB main) no es problema, pero a medida que crezca cada módulo podría beneficiarse de `React.lazy()` + `<Suspense>`.

---

### N-4: MusicContext usa `audioEngineRef` vs `audioEngine` del spec

**CLAUDE.md define:** `audioEngine` (ref, singleton)  
**Implementado como:** `audioEngineRef` (React ref)

Funciona igual, pero el naming difiere del contrato documentado. Menor inconsistencia.

---

### N-5: `.env.example` ausente

Especificado en la estructura de CLAUDE.md. El proyecto actualmente no usa variables de entorno en el frontend (el servidor solo usa `PORT`), pero el archivo sirve como documentación de qué variables espera el contenedor.

---

### N-6: TunerEngine.js:97 — console.log comentado en JSDoc

```javascript
 * if (result) console.log(result.freq, result.clarity);
```

Dentro de un comentario JSDoc. No es código real pero es ruido en el source visible en portafolio.

---

## Checklist de criterios de aceptación (CLAUDE.md)

| Criterio | Estado | Evidencia |
|---|---|---|
| `npm run build` sin errores ni warnings críticos | ✅ Cumplido | `built in 3.80s`, 0 errores |
| `npm test` con cobertura > 90% en core/ | ⚠️ Parcial | Core: 99.32% stmts ✅, pero 1 test falla → CI bloqueado |
| App carga en < 3 segundos en conexión normal | ⚠️ Parcial | Bundle total ~250KB gzip, no medido en browser |
| Todos los módulos funcionales sin errores en consola | ❌ Falta | B-2: PatternLibrary→Sequencer roto; B-3: SongAnalyzer simula |
| Piano reproduce audio en desktop, tablet y mobile | ⚠️ Parcial | Código correcto, no verificado en browser; tablet/mobile sin layout |
| Sequencer corre en loop 60-180 BPM | ⚠️ Parcial | Código correcto; carga de PatternLibrary desconectada |
| Tuner detecta notas en rango 50Hz-1200Hz | ⚠️ Parcial | TunerEngine testado; no verificado con micrófono real |
| Song Analyzer procesa MP3 < 5MB | ❌ Falta | Simula análisis con valores aleatorios, no procesa audio |
| MIDI export genera archivos válidos para Ableton | ⚠️ Parcial | Binary format testado (MidiExport tests); descarga no verificada en browser |
| Detección de dispositivo sirve layout correcto | ❌ Falta | Solo existe DesktopLayout |
| Docker build exitoso, contenedor corre en $PORT | ✅ Cumplido | Dockerfile correcto, healthcheck usa `node -e` (no wget) |
| URL de producción carga en Chrome, Safari, Firefox | ❌ Falta | Proxy bug activo desde 2026-06-09, estado desconocido |
| iPhone 12 Pro (390×844): usable | ❌ Falta | No existe MobileLayout |
| cafe-plus en EasyPanel sin cambios | ✅ Cumplido | No se tocaron otros servicios |

**Resumen: 3 ✅ / 5 ⚠️ / 6 ❌**

---

## Estado de módulos obligatorios

| Módulo | Existe | Test | Funciona | Notas |
|---|---|---|---|---|
| HarmonyMap | ✅ | ✅ | ✅ | Elipse posiblemente aplastada en wide |
| KeyExplorer | ✅ | ✅ | ✅ | Overflow vertical en desktop low-height |
| Piano | ✅ | ✅ | ✅ | Audio depende de gesto de usuario (correcto) |
| Guitar | ✅ | ✅ | ✅ | |
| Progressions | ✅ | ✅ | ✅ | MIDI export no verificado en browser |
| Sequencer | ✅ | ✅ | ⚠️ | PatternLibrary desconectada (B-2) |
| PatternLibrary | ✅ | ✅ | ❌ | "Cargar" no carga nada en Sequencer (B-2) |
| Tuner | ✅ | ✅ | ⚠️ | Requiere browser con micrófono |
| SongAnalyzer | ✅ | ⚠️ | ❌ | Análisis simulado sin disclamer (B-3) |
| Splash | ✅ | ❌ | ✅ | Sin test file |

---

## Estructura vs CLAUDE.md

### Faltantes críticos
```
src/animations/transitions.js                  ← no existe
src/animations/microinteractions.js            ← no existe
src/animations/backgrounds/ParticlesBeat.jsx   ← no existe
src/animations/backgrounds/TonalityGradient.jsx← no existe
src/animations/backgrounds/FrequencyWave.jsx   ← no existe
src/animations/backgrounds/GridPulse.jsx       ← no existe
src/layouts/TabletLayout.jsx                   ← no existe
src/layouts/MobileLayout.jsx                   ← no existe
src/components/Splash/Splash.test.jsx          ← no existe
public/og-image.png                            ← no existe
.env.example                                   ← no existe
```

### Extras presentes (no en spec, bienvenidos)
```
src/core/HarmonyGraph.js + tests       ← extra valioso
src/core/ProgressionEngine.js + tests  ← extra valioso
src/core/SequencerEngine.js + tests    ← extra valioso
src/core/TunerEngine.js + tests        ← extra valioso
src/hooks/ (8 hooks)                   ← extra valioso
harmony-lab-pro.tar.gz                 ← artefacto no deseado en git
AUDIT.md / PLAN.md / DEV_TASKS.md / PROMPT_KICKOFF.md ← docs internas con info sensible
```

---

## Cobertura de tests

```
Core (src/core/**/*.js) — único scope trackeado por vitest.config.js:
─────────────────────────────────────────────────────────────────
File               | % Stmts | % Branch | % Funcs | % Lines
─────────────────────────────────────────────────────────────────
AudioEngine.js     |   99.24 |   100.00 |   86.66 |   99.24
HarmonyGraph.js    |  100.00 |    96.22 |  100.00 |  100.00
MidiExport.js      |  100.00 |    97.87 |  100.00 |  100.00
MusicTheory.js     |   99.14 |    91.66 |  100.00 |   99.14
ProgressionEngine  |   98.04 |    87.00 |  100.00 |   98.04
SequencerEngine    |  100.00 |    88.70 |  100.00 |  100.00
TunerEngine.js     |   99.31 |    91.66 |  100.00 |   99.31
─────────────────────────────────────────────────────────────────
All files          |   99.32 |    91.93 |   98.26 |   99.32   ← ✅ supera threshold 90%
─────────────────────────────────────────────────────────────────

Componentes UI — SIN tracking de cobertura (scope excluido en vitest.config.js)
Total tests: 578 (577 passing, 1 failing)
```

---

## Build

```
dist/index.html               1.06 kB │ gzip:  0.54 kB
dist/assets/index.css        88.47 kB │ gzip: 15.73 kB
dist/assets/index.js         57.73 kB │ gzip: 19.09 kB
dist/assets/framer.js       122.18 kB │ gzip: 40.35 kB
dist/assets/react.js        133.93 kB │ gzip: 43.12 kB
```

0 errores, 0 warnings. Tamaños razonables. Framer Motion (40KB gzip) es el chunk más pesado pero esperado dado el stack. No se detectaron imports circulares ni dependencias duplicadas.

---

## Próximos pasos recomendados (en orden)

```
SESIÓN A — SEGURIDAD (urgente, 0.5 sesiones)
├── Rotar webhook en EasyPanel (antes de cualquier otra cosa)
├── Limpiar URLs sensibles de AUDIT.md, DEV_TASKS.md, PLAN.md
├── Añadir esos archivos a .gitignore si se regeneran por sesión
└── Evaluar si el historial de git necesita limpieza con git-filter-repo

SESIÓN B — BUG CRÍTICO PatternLibrary/Sequencer (0.5 sesiones)
├── Pasar seqPattern via MusicContext o prop directa al Sequencer
├── Verificar que useSequencer expone loadPattern()
└── Test: cargar pattern → cambiar a Sequencer → grid refleja el patrón

SESIÓN C — SongAnalyzer (0.5 sesiones)
├── Opción rápida: añadir banner "DEMO · Análisis simulado" visible en resultados
└── Opción completa: implementar BPM detection real via WebAudio autocorrelación

SESIÓN D — Fix test + PropTypes + Splash test (0.5 sesiones)
├── Añadir { timeout: 3000 } al waitFor en SongAnalyzer.test.jsx:81
├── Añadir PropTypes a Piano, Guitar, Sequencer, SongAnalyzer, Progressions, Tuner
├── Crear Splash.test.jsx básico
└── Crear public/og-image.png (screenshot o diseño del producto)

SESIÓN E — README + Deploy (1 sesión)
├── Actualizar README: 577 tests, módulos implementados, quitar ⚠️ si deploy resuelto
├── Añadir screenshot o GIF de demo (al menos HarmonyMap + Sequencer)
├── Verificar y resolver el bug de proxy de EasyPanel
└── Confirmar que la URL de producción carga correctamente

SESIÓN F — Animated Backgrounds + Transiciones (1-2 sesiones)
├── Implementar TonalityGradient (más simple, solo CSS + context)
├── Implementar GridPulse (CSS animation syncronizado con isPlaying)
├── Implementar FrequencyWave (Canvas + AnalyserNode)
├── Implementar ParticlesBeat (Canvas + step reactivo)
├── transitions.js con Framer Motion presets para módulos
└── microinteractions.js (spring ChordNode, pulse Tuner, glow Sequencer)

SESIÓN G — Layouts Responsive (2 sesiones)
├── TabletLayout (full height + bottom nav 4 tabs)
├── MobileLayout (iPhone 12 Pro 390×844, safe-area-inset)
├── useDevice hook ya existe — conectar al routing en App.jsx
└── Probar en Chrome DevTools mobile emulation mínimo

SESIÓN H — Refactoring (0.5 sesiones, opcional)
├── DesktopLayout: reemplazar ternario anidado con Map de nombre → componente
├── Añadir coverage de componentes al vitest.config.js
├── Remover harmony-lab-pro.tar.gz del tracking de git
└── Añadir .env.example
```

**Estimación total para portafolio-ready: 7-8 sesiones de trabajo enfocado.**  
Con A+B+C+D+E resueltos (3 sesiones) el proyecto ya puede mostrarse como demo funcional.  
F y G son necesarios para que el portafolio demuestre dominio completo del stack declarado.
