# DESIGN_TASKS.md — Harmony Lab Pro | Tareas de diseño
> Para sesión de Claude Design (o open-design como herramienta de apoyo).
> Fecha: 2026-06-17 · Actualizado: 2026-07-01

---

## Contexto del proyecto

Harmony Lab Pro es una app musical interactiva (React 18 + Vite + Web Audio API).
Design system completo implementado: tokens.css, globals.css, 9 CSS de módulos.
Estética: fusión Novation (colorido, energético) + Teenage Engineering (industrial, bold).
Tipografía: Syne (display) · Barlow/Barlow Condensed (body) · Space Mono (datos técnicos).

**Actualización 2026-07-01:** los 9 módulos ya están completos (no solo Splash/KeyExplorer/
HarmonyMap como decía la versión original de este archivo). Ver `README.md` y `CLAUDE.md` para
el estado real. El deploy en producción **ya funciona** (DT3 de abajo tenía como premisa que
estaba roto — ya no es así). DT1 y DT2 (los dos bugs de layout) **siguen sin tocarse** — no se
re-verificaron en la sesión del 2026-07-01, que se enfocó en Sequencer/PatternLibrary/KeyExplorer
(un bug visual distinto, ver DT5 abajo).

App accesible localmente con `npm run dev` en `~/proyectos/harmony-lab/`.

---

## DT1 · Fix visual: HarmonyMap — elipse aplastada en viewports wide `[ALTA]`

**Problema:** los 7 nodos diatónicos en elipse se distribuyen horizontalmente cuando el viewport es > 1000px de ancho. La elipse parece una línea.

**Causa:** ResizeObserver implementado pero marcado como "en revisión". rx y ry calculados como % sin considerar el aspect ratio real del canvas.

**Opciones de solución (elegir una):**
1. **Limitar ancho del canvas:** agregar `max-width: 600px` centrado al contenedor `.harmony-map-canvas`. La elipse siempre tendrá aspect ratio 1:1.2 aproximadamente.
2. **ResizeObserver correcto:** `rx = Math.min(w * 0.42, h * 0.72)`, `ry = Math.min(h * 0.40, w * 0.22)` — verificar que el ResizeObserver actualmente hace esto y no está usando porcentajes CSS.
3. **Layout 2 columnas:** canvas en columna izquierda (max-width: 500px), panel de acordes/sugerencias en columna derecha. Análogo al layout de KeyExplorer.

Verificar en: `src/components/HarmonyMap/HarmonyMap.jsx`

---

## DT2 · Fix visual: KeyExplorer — overflow en viewports < 800px de alto `[ALTA]`

**Problema:** el contenido de la columna derecha (chips de notas + tabla de grados) desborda el panel visible. El SVG del Circle of Fifths se corta por arriba.

**Causa documentada en DESIGNER.md:**
- Panel principal no propaga `height: 100%` hasta el contenedor del módulo
- `.circle-of-fifths-wrapper` con `min(400px, 40vw)` demasiado grande en viewports de 691px de alto
- Columna derecha sin `overflow-y: auto` con altura máxima calculada

**Solución recomendada en DESIGNER.md:**
- Opción A: tabs internos en columna derecha — "Notas" (chips) y "Grados" (tabla)
- Opción B: reducir SVG a max 320px + columna derecha scrolleable con scrollbar styled

Verificar en: `src/components/KeyExplorer/KeyExplorer.jsx`, `src/styles/modules/key-explorer.css`

---

## DT3 · Screenshots para README `[MEDIA — impacto portafolio]`

**Actualización 2026-07-01:** el deploy ya no está roto (confirmado funcionando). Sigue
faltando el screenshot/GIF — ahora es aún más fácil de hacer porque hay más módulos que lucen bien
(Sequencer con 12 instrumentos, Pattern Library con 242 patrones reales agrupados por género).

Con `npm run dev` corriendo:

1. **Splash screen** — los 3 gradientes radiales animados + logo H·WAVE + tonality dots
2. **KeyExplorer** — Circle of Fifths SVG + tonalidad activa + MoodBanner (probar escala Double Harmonic o Phrygian Dominant para máximo impacto visual)
3. **HarmonyMap** — 7 nodos en elipse, aristas tipificadas, panel de sugerencias abierto

Guardar en `/docs/screenshots/` como PNG 1440px.
Agregar en README antes de la sección de Stack.
Caption sugerido: "Week 2/5 — Harmony + Rhythm Lab modules in progress"

---

## DT4 · Diseño de módulos pendientes (sesiones futuras) `[OBSOLETO — todos implementados al 2026-07-01]`

Todos los módulos de la tabla de abajo ya están implementados. Se deja la tabla como
referencia de qué identidad visual se usó para cada uno, no como pendiente.

El DESIGNER.md ya tiene identidad visual por módulo. Revisar antes de implementar:

| Módulo | Identidad visual definida en DESIGNER.md |
|--------|------------------------------------------|
| Piano | Teclas con peso visual, lacado negro, marfil envejecido |
| Guitar | Diapasón madera, trastes metálicos, cuerdas con tensión visual |
| Sequencer | Drum machine física: botones con relieve, LEDs por instrumento |
| Tuner | Instrumentación analógica: aguja, VU meter vintage |
| Song Analyzer | Laboratorio: osciloscopio, visualizador espectral |
| Pattern Library | Archivo físico: tarjetas, fichas coleccionables |

Para cada módulo antes de implementar:
1. Revisar `src/styles/modules/[nombre].css` — el CSS ya está generado
2. Verificar que el CSS usa las variables CSS del tokens.css
3. Documentar cualquier ajuste en DESIGNER.md sección "Decisiones tomadas"

---

## DT5 · Revisar identidad de color de Pattern Library por género `[BAJA]`

El Pattern Library pasó de 5 géneros inventados a 22 géneros reales (ver DESIGNER.md sección
"Sesión 4"). Por tiempo, se reusaron cíclicamente las 8 franjas de color (`stripe-*`) y 6 estados
de filtro (`active-*`) que ya existían en `pattern-library.css`, en vez de diseñar 22 identidades
de color únicas. Si se quiere una identidad de color propia por género (más fiel a la intención
original del sistema de diseño), es un rediseño de `genreClass()` en `PatternLibrary.jsx` +
las clases CSS correspondientes.

## DT6 · Auditar contraste del nodo central de KeyExplorer en las 12 escalas `[BAJA]`

La tónica central del Circle of Fifths ahora cambia de color según la escala activa
(`SCALE_MOOD[scaleName].color`, ver DESIGNER.md sección "Sesión 4"). No se verificó contraste de
texto (blanco) contra cada uno de los 12 colores posibles — algunos (ej. amarillos claros) podrían
tener contraste bajo. Revisar visualmente las 12 escalas y ajustar el color del texto si hace falta.
