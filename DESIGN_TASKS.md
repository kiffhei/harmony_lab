# DESIGN_TASKS.md — Harmony Lab Pro | Tareas de diseño
> Para sesión de Claude Design (o open-design como herramienta de apoyo).
> Fecha: 2026-06-17

---

## Contexto del proyecto

Harmony Lab Pro es una app musical interactiva (React 18 + Vite + Web Audio API).
Design system completo implementado: tokens.css, globals.css, 9 CSS de módulos.
Estética: fusión Novation (colorido, energético) + Teenage Engineering (industrial, bold).
Tipografía: Syne (display) · Barlow/Barlow Condensed (body) · Space Mono (datos técnicos).
El estado actual (Semana 2) tiene: Splash screen, KeyExplorer, HarmonyMap. 

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

El deploy en producción está roto. Sin demo visual en README el proyecto es invisible para reclutadores.

Con `npm run dev` corriendo:

1. **Splash screen** — los 3 gradientes radiales animados + logo H·WAVE + tonality dots
2. **KeyExplorer** — Circle of Fifths SVG + tonalidad activa + MoodBanner (probar escala Double Harmonic o Phrygian Dominant para máximo impacto visual)
3. **HarmonyMap** — 7 nodos en elipse, aristas tipificadas, panel de sugerencias abierto

Guardar en `/docs/screenshots/` como PNG 1440px.
Agregar en README antes de la sección de Stack.
Caption sugerido: "Week 2/5 — Harmony + Rhythm Lab modules in progress"

---

## DT4 · Diseño de módulos pendientes (sesiones futuras) `[BAJA ahora — ALTA al implementar]`

Cuando se implemente cada módulo, coordinar sesión de diseño antes del código.
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
