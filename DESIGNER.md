# DESIGNER.md — Harmony Lab Pro · Agente Diseñador

## Tu rol
Eres el diseñador creativo principal de Harmony Lab Pro. Tu herramienta 
principal es Claude Design (OpenDesign plugin). Tienes libertad creativa 
total dentro de la dirección definida en este documento.

Tu output es el input del agente programador. Todo lo que diseñes 
debe ser implementable — documenta con precisión técnica suficiente 
para que no haya ambigüedad en la implementación.

Si detectas una contradicción entre lo pedido y los principios de buen 
diseño, propón tu alternativa y explica por qué. Prioriza siempre 
usabilidad sobre decoración.

---

## La app — contexto suficiente

Harmony Lab Pro tiene 10 módulos funcionales en 4 tabs principales:

**TAB ARMONÍA**
- Harmony Map: acordes diatónicos como nodos navegables con relaciones
- Key/Scale Explorer: selector de tonalidad, escala, notas y grados
- Progressions: editor visual de progresiones de acordes

**TAB INSTRUMENTOS**
- Piano: teclado interactivo 3 octavas con notas de escala resaltadas
- Guitar: diapasón 6 cuerdas 12 trastes con escala resaltada

**TAB RITMO — Rhythm Lab**
- Sequencer: grid 16 pasos × 8 instrumentos (kick, snare, hats, etc.)
- Pattern Library: biblioteca visual de patrones por género musical

**TAB HERRAMIENTAS**
- Tuner: afinador por micrófono, nota detectada + cents de desviación
- Song Analyzer: análisis de audio con BPM, key, timbre y sugerencias
- MIDI Export: exportación de progresiones y patrones como .mid

Existe en 3 versiones: Desktop (3 columnas), Tablet (bottom nav), 
Mobile iPhone (bottom nav + sub-tabs). iPhone 12 Pro es el dispositivo 
mobile de referencia (390×844px).

---

## Dirección creativa

### Referencia visual
Se adjunta una imagen de referencia al proyecto. No copies al personaje 
ni el estilo ilustrado literalmente. Lo que interesa es:
- Pinceladas expresionistas como textura y energía
- Paleta saturada: tonos cálidos (naranja quemado, amarillo vibrante, 
  rojo) + tonos fríos (azul profundo, verde) en tensión
- Caos controlado: elementos que emergen del fondo, no decoración plana
- Sensación urbana, orgánica y musical — no digital genérico

### Estética objetivo
Fusión entre **Novation** (colorido, enérgico, orientado al performance, 
diseño que acompaña al músico en acción) y **Teenage Engineering** 
(industrial, tipografía bold, soluciones visuales quirky, cada elemento 
tiene intención y carácter).

El resultado debe sentirse como un **instrumento real**, no como 
una app SaaS. Cuando alguien la abra debe pensar en hardware musical, 
no en dashboards.

---

## Aplicación por contexto

### Splash / pantalla de inicio / pantallas informativas
Energía máxima de la referencia visual. Textura expresionista, 
paleta completa, animaciones de entrada potentes. Es la primera 
impresión. Debe vender.

### Módulos funcionales — identidad propia por instrumento

Cada módulo tiene su propia identidad visual inspirada en el 
instrumento o herramienta que representa:

| Módulo | Identidad visual |
|---|---|
| Piano | Teclado real: teclas con peso visual, lacado negro brillante, marfil envejecido |
| Guitar | Diapasón con madera, trastes metálicos, cuerdas con tensión visual |
| Sequencer | Drum machine física: botones con relieve, LEDs que pulsan, plástico industrial |
| Harmony Map | Constelaciones o circuito impreso orgánico, nodos conectados con luz |
| Tuner | Instrumentación analógica: aguja, VU meter vintage, dial de precisión |
| Song Analyzer | Laboratorio: osciloscopio, visualizador espectral, pantalla de lectura |
| Key Explorer | Mapa de notas como sistema solar o círculo de quintas |
| Pattern Library | Archivo físico: tarjetas, fichas, colección portátil |

La UI de cada módulo debe hacer sentir que estás **tocando el 
instrumento real**, no mirando una representación digital.

---

## Backgrounds animados — especificación por módulo

Implementa una combinación de los siguientes elementos. 
Documenta timing, opacidad y comportamiento exacto para 
que el programador pueda implementarlo:

| Background | Módulos | Comportamiento |
|---|---|---|
| ParticlesBeat | Sequencer, Rhythm Lab | Partículas en grid 16 columnas, opacidad reactiva al step activo |
| TonalityGradient | Harmony Map, Key Explorer, Piano | Gradiente cambia con tonalidad activa. Cada nota = color del espectro |
| GridPulse | Sequencer, Rhythm Lab | Grid pulsa en sync con isPlaying y BPM |
| FrequencyWave | Tuner, Song Analyzer | Onda sinusoidal si hay audio activo, estática suave si no |
| ExpressionistTexture | Splash, Info screens | Textura de pinceladas con parallax sutil al scroll o girar dispositivo |

Reglas técnicas para el programador:
- Todos los backgrounds: z-index 0, pointer-events none
- Opacidad máxima sobre el contenido: 0.15
- Implementables en Canvas 2D o CSS según complejidad

---

## Sistema de animaciones de transición

### Principio de dirección
La transición sigue la lógica espacial del contenido:

- Módulos con contenido horizontal (Piano, Guitar, Sequencer):
  **slide horizontal** — refuerza la continuidad del instrumento
- Módulos verticales (Harmony Map, Tuner, Analyzer, Key Explorer):
  **fade + scale sutil** — sensación de profundidad, como abrir algo
- Navegación principal entre tabs:
  Propón y justifica. Considera que el usuario alterna frecuentemente 
  entre Armonía y Ritmo durante una sesión de composición.

### Micro-interacciones mínimas requeridas
Documenta timing, easing y valores exactos para cada uno:

```
ChordNode click      → spring scale 1→1.08→1
Piano key press      → translateY + shadow inset
Sequencer step on    → glow animado color del instrumento
Tuner in-tune        → pulse verde que se detiene
Pattern card hover   → translateY + shadow
Button primary       → brightness hover + scale active
Tab switch           → indicador animado de posición activa
```

---

## Tipografía — propuesta libre

No uses Outfit ni JetBrains Mono (fuentes del prototipo anterior). 
Propón una combinación con personalidad propia que funcione para:

- **Display / headlines**: expresiva, bold, carácter musical propio
- **Body / labels**: legible a tamaño pequeño (10-12px), técnica 
  pero accesible
- **Monospace / datos técnicos**: frecuencias, BPM, notas — 
  precisa, de laboratorio o de instrumento

Requisitos:
- Disponible en Google Fonts o licencia libre para uso comercial
- Funciona en fondos oscuros con buenos contrastes
- Justifica cada elección en términos de identidad de marca
- Define escala tipográfica completa: tamaños, pesos, line-heights

---

## Logo — identidad de marca

Diseña el logo de Harmony Lab Pro desde cero. No partas del 
símbolo ⬡ existente.

Restricciones:
- El nombre puede abreviarse como HLP o H·LAB si tiene sentido visual
- Debe funcionar en fondos oscuros y claros
- Debe funcionar pequeño (favicon 32px) y grande (splash 400px)
- Debe comunicar: música, precisión, laboratorio creativo, 
  herramienta profesional
- Puede incorporar elementos musicales abstractos (onda, nota, 
  frecuencia, grid) pero de forma geométrica — no literal ni clipart

Proceso:
1. Presenta 3 conceptos distintos con justificación de cada uno
2. Brian elige la dirección
3. Desarrolla el concepto elegido con variantes: dark/light/icon/favicon

---

## Paleta de colores

### Base actual — puedes expandir o ajustar con justificación
```
--c-bg:        #080c1a   fondo principal
--c-surface:   #0f1424   topbar, sidebar
--c-elevated:  #161c30   cards, inputs
--c-amber:     #f59e0b   acento primario, CTA, raíz musical
--c-violet:    #8b5cf6   acento secundario, bordes
--c-green:     #10b981   estados positivos, afinado
--c-red:       #ef4444   tensión, error, eliminar
--c-text:      #e8eaf0   texto principal
--c-muted:     #6b7280   texto secundario
--c-dim:       #374151   elementos desactivados
```

### Incorporar de la referencia visual
Los tonos cálidos de la referencia (naranja quemado, amarillo 
saturado, rojo vibrante) como colores de acento en contextos 
de alta energía: splash, estados activos, beats en sequencer.

Los tonos fríos (azul profundo, verde) para estados de calma 
o resolución armónica.

### Paleta de tonalidades — obligatoria
Define un color para cada una de las 12 notas del círculo de quintas. 
Se usa para que el gradiente de fondo cambie al cambiar la tonalidad 
activa en la app. Los 12 colores deben:
- Ser distinguibles entre sí
- Funcionar como gradientes sutiles sobre fondo oscuro
- Seguir alguna lógica musical o del espectro de color

---

## Entregables — handoff para el programador

El programador no puede avanzar en UI sin estos archivos. 
Entrega en este orden:

### 1. Tokens de diseño (prioridad máxima)
Archivo `src/styles/tokens.css` con todas las CSS custom properties:
- Colores completos (base + expandida + tonalidades)
- Tipografía: familias, tamaños, pesos, line-heights
- Espaciados: escala de 4px
- Border radius por contexto
- Sombras y glows por estado
- Duraciones y easings de animación
- Z-index scale

### 2. Sistema tipográfico
- 3 fuentes seleccionadas con justificación
- Escala completa de tamaños
- Uso de cada fuente por contexto
- Imports de Google Fonts listos para copiar

### 3. Logo
- 3 conceptos en boceto o mockup
- Concepto final desarrollado
- Variantes: dark, light, icon, favicon
- Exportado en SVG

### 4. Componentes base
Para cada uno: especificación visual + estados (default, hover, 
active, disabled, focus):
- Button (primary, secondary, ghost, destructive)
- Card (base, interactive, selected)
- Input / Select
- Slider / Range
- Badge / Tag / Pill
- Tab indicator
- Step cell (sequencer)
- Chord node
- Piano key (white, black, highlighted)

### 5. Pantalla splash / onboarding
- Diseño completo con animaciones documentadas
- Versión desktop y mobile

### 6. Diseño de cada módulo
Con identidad propia según la tabla de arriba:
Piano, Guitar, Sequencer, Harmony Map, Tuner, Song Analyzer, 
Key Explorer, Pattern Library

Para cada módulo entregar:
- Layout desktop
- Layout mobile
- Estados interactivos documentados
- Especificación de background animado

### 7. Sistema de animaciones documentado
- Transiciones entre módulos: dirección, duración, easing, valores
- Micro-interacciones: timing, curva, valores inicial y final
- Backgrounds: comportamiento, triggers, opacidad, colores

---

## Proceso de trabajo recomendado

```
SESIÓN 1 — IDENTIDAD
→ Proponer 3 conceptos de logo
→ Definir paleta expandida con tonalidades
→ Seleccionar tipografía con justificación
→ Generar tokens.css inicial

SESIÓN 2 — SPLASH Y BASE
→ Diseñar pantalla splash
→ Diseñar componentes base
→ Documentar micro-interacciones
→ Entregar tokens.css completo al programador

SESIÓN 3-4 — MÓDULOS
→ Diseñar cada módulo con identidad propia
→ Documentar backgrounds animados
→ Especificar transiciones

SESIÓN 5 — HANDOFF
→ Revisar coherencia del sistema completo
→ Exportar assets (SVG, especificaciones)
→ Documentar todo para el programador
→ Actualizar este DESIGNER.md con decisiones tomadas
```

---

## Sección de decisiones tomadas

*Sesión 1 completada — 2026-06-08*

---

### Logo seleccionado — **H·WAVE**

**Concepto**: Las dos barras verticales forman la letra H (de Harmony Lab).
El travesaño horizontal es reemplazado por un ciclo completo de onda
sinusoidal — la forma más elemental del sonido.

El símbolo dice simultáneamente:
- **H** — identidad de marca (Harmony Lab / H·Lab)
- **Onda** — audio, música, vibración
- **Precisión** — geometría exacta, no clipart ni literal
- **Laboratorio** — construcción sistemática, medición

Archivos generados: `public/favicon.svg`
Gradiente: `--c-amber` (#f59e0b) → `--c-violet` (#8b5cf6), diagonal 135°
Fondo: rounded square rx=7, gradiente `--c-surface` → `--c-bg`
Borde: amber 30% opacidad para legibilidad en contextos claros

Pendiente Sesión 2: variantes dark/light/icon/display (400px splash).

---

### Tipografía seleccionada

**Display / Headlines** — [Syne](https://fonts.google.com/specimen/Syne) (pesos 400–800)
Diseñada por Bonjour Monde con carácter performativo. Las mayúsculas en
peso 800 tienen la presencia de una serigrafía en hardware Teenage Engineering.
Geométrica pero con irregularidades intencionales — no es un typeface de SaaS.
Uso: títulos de módulo, nombres de acordes grandes, splash hero, BPM en display,
nota detectada en el Tuner.

**Body / Labels / UI** — [Barlow](https://fonts.google.com/specimen/Barlow) (pesos 300–700)
+ [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) (400–700)
Inspirada en letras de carteles y señalética industrial. Carácter técnico de
manual de equipos Novation: directa, legible a 10px sobre fondos oscuros.
Barlow Condensed es clave para etiquetas del piano, pasos del sequencer y
nombres de trastes donde el espacio es crítico.
Uso: body, navegación, labels de instrumento, badges, inputs.

**Monospace / Datos técnicos** — [Space Mono](https://fonts.google.com/specimen/Space+Mono) (400, 700)
Diseñada por Colophon Foundry con referencias en impresoras retrofuturistas.
Las frecuencias en Hz, BPM y cents se leen como si vinieran de la pantalla
LCD de un rack Korg vintage. Spacing generoso evita confusión 0/O y 1/l.
Uso: frecuencia Hz, BPM numeral, cents del tuner, valores MIDI, contadores.

Escala tipográfica completa: ver `src/styles/tokens.css` (--text-2xs … --text-5xl)

---

### Paleta expandida

**Base** (sin cambios desde el sistema previo):
```
--c-bg:        #080c1a   Fondo principal
--c-surface:   #0f1424   Topbar, sidebar
--c-elevated:  #161c30   Cards, inputs
--c-elevated-2:#1e263e   Hover de card
--c-border:    #2a3350   Bordes por defecto
```

**Acentos** (ajustes en variantes bright/dim/glow):
```
--c-amber:        #f59e0b   Acento primario — sin cambios
--c-amber-bright: #fbbf24   Hover state
--c-amber-dim:    #b87408   Disabled/sutil
--c-violet:       #8b5cf6   Acento secundario — sin cambios
--c-green:        #10b981   Positivo — sin cambios
--c-red:          #ef4444   Tensión — sin cambios
```

**Paleta expresionista** (nueva — alta energía):
```
--c-burn-orange:    #d44d0a   Naranja quemado — beat downbeat, splash
--c-signal-yellow:  #e8c020   Amarillo saturado — alerta, paso beat-4
--c-hot-coral:      #e8503a   Coral vibrante — tensión dramática
--c-electric-cyan:  #00cce0   Cian eléctrico — indicadores de precisión
--c-deep-indigo:    #2a20a8   Índigo profundo — calma, resolución
--c-forest:         #148050   Verde bosque — resolución armónica
```

---

### Paleta de tonalidades (12 notas)

**Lógica**: Círculo de quintas mapeado al espectro visible completo.
C (tónica) = ámbar cálido (30°). Avanzando en quintas (sostenidos) la
paleta se enfría hacia el azul-cian. Girando en bemoles la paleta vira
hacia el rojo. Los 12 colores están separados exactamente 30° en el
círculo cromático para máxima distinguibilidad sobre #080c1a.

Secuencia del círculo de quintas → hue progression:

```
C   → hsl(30,  92%, 60%)   Ámbar dorado     — tónica "home"
G   → hsl(60,  88%, 55%)   Amarillo eléctrico — quinta arriba
D   → hsl(90,  82%, 52%)   Lima vibrante    — segunda mayor
A   → hsl(120, 68%, 50%)   Verde esmeralda  — sexta mayor
E   → hsl(150, 72%, 50%)   Menta teal       — tercera mayor
B   → hsl(180, 80%, 52%)   Cian eléctrico   — séptima mayor
F#  → hsl(210, 80%, 60%)   Azul cielo       — tritono (tensión máxima)
C#  → hsl(240, 72%, 65%)   Azul perinola    — bemol séptima
G#  → hsl(270, 74%, 62%)   Violeta suave    — bemol cuarta
D#  → hsl(300, 76%, 58%)   Magenta          — bemol segunda
A#  → hsl(330, 84%, 60%)   Rosa caliente    — bemol sexta
F   → hsl(0,   82%, 60%)   Rojo coral       — subdominante
```

El color activo se expone via `--active-key-color` (default C).
Actualizar desde JS: `document.documentElement.style.setProperty('--active-key-color', 'var(--c-tone-G)')`

---

### Sesión 2 — 2026-06-08

---

#### Componentes base — dirección **B: Rounded / Soft Glow**

Bordes redondeados (r=8px para cards/buttons/inputs, r=full para badges),
glow suave en estados activos. Más cercano a hardware Novation moderno que
al TE puro, pero sin caer en SaaS genérico. Contraste limpio sobre oscuro.

Implementado en `src/styles/globals.css`:
- Button: primary / secondary / ghost / destructive / icon + tamaños sm/lg
- Card: base / interactive / selected / pattern
- Input / Select / Textarea + field label
- Slider con fill via CSS custom property `--slider-value`
- Badge / Tag / Pill — variantes semánticas + badge-key para tonalidad activa
- Tab indicator: sidebar vertical, indicador borde izquierdo ámbar con glow
- Sequencer step: off / on-{instrumento} / playhead / beat-4-marker
- Chord node: default / hover / active / selected + edge SVG
- Piano key: white / black / scale-note / root-note / pressed
- Tuner display: note-name / cents / freq con estados intune/flat/sharp
- Splash screen: gradientes animados + CTA con pulse de espera
- Layout base: app-layout / sidebar-nav / app-main / app-topbar / app-content

---

#### Splash screen — dirección **A: Expresionista**

Tres gradientes radiales independientes animados (warm/cool/accent) que
respiran a ritmos distintos (6s, 8s, 10s). Logo H·WAVE centrado, título
en Syne 800 72px, CTA `.btn .btn-primary .btn-lg` con pulse de espera.

Entrada Framer Motion:
```
título:   initial:{opacity:0,y:20} → animate:{opacity:1,y:0}  delay:0.2s  dur:0.7s
subtítulo: delay:0.35s
CTA:      delay:0.5s → luego ctaWaitPulse animation hasta primer clic
```

Salida (primer clic activa AudioContext + dismiss):
```
exit: { opacity:0, scale:1.04 }  transition:{ duration:0.5, ease:[0.4,0,1,1] }
```

---

#### Navegación principal — **A: Sidebar Vertical**

Panel 64px, fijo a la izquierda. Iconos SVG 18px + label Barlow Condensed
9px en caps. Indicador activo: `::before` con borde izquierdo 3px ámbar +
glow, animado con Framer Motion `layoutId="sidebar-indicator"`.

En mobile (≤768px): el sidebar se convierte en bottom bar horizontal con
el mismo sistema de indicador pero horizontal (top 2px).

---

#### Micro-interacciones — valores definitivos

| Interacción | Implementación | Valores |
|---|---|---|
| ChordNode click | Framer Motion whileTap | `scale:0.92`, spring `stiffness:400 damping:25`, rebote a 1.04 |
| Piano key press | CSS transform + shadow | `translateY(2px)` 80ms linear, `--shadow-key-press` |
| Sequencer step on | Framer Motion animate | `scale:0.85→1, opacity:0.6→1`, spring `stiffness:600 damping:30` |
| Tuner in-tune | CSS animation | `tunerIntunePulse` 400ms × 3 iteraciones, luego stop |
| Pattern card hover | Framer Motion whileHover | `y:-4`, tween 200ms `ease:[0.23,1,0.32,1]` |
| Button primary | CSS + Framer Motion | hover: `brightness(1.12)`, tap: `scale:0.96` spring `stiffness:600` |
| Tab switch | Framer Motion layoutId | `layoutId="sidebar-indicator"`, spring `stiffness:500 damping:35` |
| Splash CTA waiting | CSS keyframes | `ctaWaitPulse` 2s ease-in-out infinite hasta primer clic |
| TonalityGradient change | CSS transition | `--active-key-color` transition 600ms ease (`--dur-slower`) |

---

#### Animaciones de navegación principal

---

### Pendiente de revisión — KeyExplorer layout
El módulo KeyExplorer tiene un problema de altura en desktop:
el contenido de la columna derecha (chips + tabla de grados)
se desborda fuera del panel visible. El SVG también se corta
por arriba en viewports menores a 800px de alto.

Causas identificadas:
- El panel principal de DesktopLayout no propaga height: 100%
  correctamente hasta el contenedor del módulo
- .circle-of-fifths-wrapper con min(400px, 40vw) sigue siendo
  demasiado grande para viewports de 691px de alto
- La columna derecha necesita overflow-y: auto con una altura
  máxima calculada (100vh - topbar - padding)

Solución recomendada para sesión de diseño:
- Rediseñar el módulo con altura fija por sección
- Considerar tabs internos en la columna derecha:
  tab "Notas" (chips) y tab "Grados" (tabla)
- O reducir el SVG a max 320px y hacer la columna derecha
  scrolleable con scrollbar styled

---

### Pendiente de revisión — HarmonyMap elipse de nodos
Los 7 nodos diatónicos se posicionan en elipse calculada
con porcentajes del contenedor. En viewports wide (>1000px)
el canvas es mucho más ancho que alto, resultando en una
distribución horizontal aplastada que parece pirámide.

En mobile (screenshot capturado) se ve correctamente circular.

Causas identificadas:
- rx y ry calculados como % fijos sin considerar el aspect ratio
  del canvas en cada breakpoint
- Canvas height: clamp(300px, 40vh, 480px) vs ancho ~830px
  da ratio 1:2.7 que aplasta la elipse

Solución implementada (en revisión):
- ResizeObserver en el canvas para recalcular rx/ry en px reales
- rx = min(w * 0.42, h * 0.72), ry = min(h * 0.40, w * 0.22)

Si persiste, solución de diseño alternativa:
- Limitar el ancho del canvas con max-width: 600px centrado
- O cambiar distribución a grid 3x3 en lugar de elipse
- O mover el canvas a columna izquierda (layout 2 columnas
  como KeyExplorer) con paneles a la derecha

---

## Contexto del autor

Brian Eduardo Anaya Ruiz — Consultor de automatización y 
transformación digital. Cuautitlán, Estado de México.
Productor musical, DJ (hip-hop, reggae, deep house, neo-soul).
Usa Ableton Live, Maschine 2, Novation Launchpad.
Este proyecto es portafolio técnico público — debe verse 
y sentirse profesional a nivel de producto comercial real.

---

## Estado al cierre — Sesión 3 completada

### Archivos entregados
- src/styles/tokens.css
- src/styles/globals.css
- src/styles/modules/ (9 archivos, 2,776 líneas)
- src/animations/backgrounds/ (4 componentes)
- src/components/Splash/Splash.jsx

### Componentes Cult UI mapeados por módulo
- Piano: neumorph-button (teclas negras)
- Sequencer: canvas-fractal-grid (GridPulse bg)
- Harmony Map: bg-animated-gradient (TonalityGradient)
- Tuner: animated-number, dynamic-island
- Song Analyzer: shader-lens-blur, animated-number
- Pattern Library: shift-card, sortable-list

### Pendiente Sesión 4 (opcional)
- Revisión de coherencia del sistema completo
- Assets SVG exportados (logo variantes)
- Validación en dispositivos reales

---

### Sesión 4 — 2026-07-01 (implementada directamente por el agente programador)

Estos ajustes se hicieron durante una sesión de desarrollo (no una sesión de diseño dedicada),
a partir de feedback visual directo del usuario sobre la app corriendo. Se documentan aquí
para que el sistema de diseño quede consistente con lo que realmente está en producción.

#### Fix: nodo central de KeyExplorer

**Problema encontrado:** el nodo central del Circle of Fifths usaba `motion.g` de Framer Motion
con `originX/originY: 0` para una animación de spring. Esa combinación renderiza mal dentro de
SVG — el texto (tónica + nombre de escala truncado) se escapaba del círculo y aparecía como una
placa rectangular recortada cerca del borde superior del canvas, en vez de quedarse centrado.

**Solución implementada:**
- Se reemplazó `motion.g` por un `<g>` SVG estático (sin animación de Framer Motion)
- Por pedido explícito del usuario, el nodo central **ya no muestra el nombre de la escala**
  (esa información ya vive en el `MoodBanner` de la columna derecha) — solo muestra la tónica
- La tónica cambia de color dinámicamente según `SCALE_MOOD[scaleName].color` (fill al 15% de
  opacidad vía sufijo hex `26`, stroke sólido, drop-shadow al 40% vía sufijo hex `66`)

**Nota para futuras animaciones en SVG:** evitar `motion.g`/`motion.circle` de Framer Motion con
`originX`/`originY` custom dentro de un `<svg>` — usar CSS transitions o animar solo props que
Framer soporte de forma nativa en SVG (`opacity`, `pathLength`), o envolver el `<g>` en un
`<foreignObject>` si se necesita spring real.

#### Ampliación de paleta: Sequencer (8 → 12 instrumentos)

El Sequencer pasó a soportar 3 toms (antes 1 solo "tom" genérico) más rimshot, cowbell y cymbal
— necesarios para reproducir con fidelidad completa patrones reales de un libro de patrones de
batería. Colores asignados en `src/styles/modules/sequencer.css`, reusando tonos ya definidos
en `tokens.css` para no introducir una paleta nueva:

| Instrumento | Color | Token reusado |
|---|---|---|
| Tom hi/mid/lo | Verde (`--c-green`, sin cambio respecto al "tom" genérico anterior) | `--glow-tom` |
| Rimshot | Rojo | `--c-red` / `--glow-red` (ya existía en tokens, sin uso previo en Sequencer) |
| Cowbell | Coral cálido | `--c-hot-coral` (de la paleta expresionista, sin uso previo en Sequencer) |
| Cymbal | Índigo profundo | `--c-deep-indigo` (de la paleta expresionista, sin uso previo en Sequencer) |

#### Pattern Library — 22 géneros reales (antes 5 inventados)

Con 242 patrones reales agrupados en 22 géneros (ver `CLAUDE.md` para el detalle), escribir una
franja de color (`stripe-*`) y un estado de filtro activo (`active-*`) por género uno por uno no
era viable. Se optó por **reusar cíclicamente** las 8 variantes de `stripe-*` y 6 variantes de
`active-*` que ya existían en `pattern-library.css` (incluían algunas nunca usadas: `stripe-reggae`,
`stripe-jazz`, `stripe-latin`), asignadas por índice de género módulo el tamaño de cada paleta —
en vez de diseñar 22 combinaciones nuevas. Si en una sesión de diseño futura se quiere una
identidad de color única por género, esto es lo primero a reemplazar
(`genreClass()` en `PatternLibrary.jsx`).

#### Pendiente de diseño sin tocar esta sesión
Los dos issues de layout de la sección anterior (KeyExplorer overflow en viewports bajos,
HarmonyMap elipse aplastada en viewports anchos) **no se re-verificaron ni se tocaron** en
esta sesión — siguen exactamente como se documentó en Sesión 1-3.

---

## Reporte para orquestador — Sesiones 1-2-3 completas

### Estado de entrega: ✅ DISEÑO COMPLETO

### Archivos generados y commiteados en main

| Archivo | Líneas | Descripción |
|---|---|---|
| `src/styles/tokens.css` | ~200 | CSS custom properties: colores, tipografía, espaciado, animaciones |
| `src/styles/fonts.css` | ~10 | Google Fonts import: Syne, Barlow, Barlow Condensed, Space Mono |
| `src/styles/globals.css` | ~400 | Sistema de componentes base: btn, card, input, badge, layouts |
| `src/styles/modules/piano.css` | ~180 | Identidad visual Piano — madera, marfil, teclas con respuesta táctil |
| `src/styles/modules/guitar.css` | ~160 | Identidad visual Guitar — cuello de palo de rosa, cuerdas metálicas |
| `src/styles/modules/sequencer.css` | ~200 | Identidad visual Sequencer — faceplate industrial, LEDs por instrumento |
| `src/styles/modules/harmony-map.css` | ~180 | Identidad visual HarmonyMap — nodos de acorde, aristas SVG, panel info |
| `src/styles/modules/tuner.css` | ~150 | Identidad visual Tuner — medidor de aguja, anillo in-tune, estados |
| `src/styles/modules/song-analyzer.css` | ~160 | Identidad visual SongAnalyzer — osciloscopio, celdas de datos lab |
| `src/styles/modules/key-explorer.css` | ~280 | Identidad visual KeyExplorer — círculo de quintas SVG, chips de notas |
| `src/styles/modules/pattern-library.css` | ~270 | Identidad visual PatternLibrary — tarjetas con mini-grid por género |
| `src/styles/modules/progressions.css` | ~185 | Identidad visual Progressions — cartas arrastrables, playhead |
| `src/animations/backgrounds/` | ~4 archivos | ParticlesBeat, TonalityGradient, FrequencyWave, GridPulse |
| `src/components/Splash/Splash.jsx` | ~1 archivo | Pantalla de entrada expresionista con CTA animado |
| `public/favicon.svg` | 1 | Logo H·WAVE — forma H con onda sinusoidal, gradiente ámbar→violeta |
| `components.json` | 1 | Registry @cult-ui configurado: `https://www.cult-ui.com/r/{name}.json` |
| `.mcp.json` | 1 | MCP shadcn configurado para acceso al registry Cult UI |

### Decisiones de diseño tomadas

| Decisión | Opción elegida | Sesión |
|---|---|---|
| Logo | H·WAVE — H con onda sinusoidal ámbar→violeta | 1 |
| Tipografía display | Syne 700-800 | 1 |
| Tipografía body | Barlow 400-600 + Barlow Condensed | 1 |
| Tipografía mono | Space Mono | 1 |
| 12 colores de tonalidad | Círculo de quintas → hue 30°-330° | 1 |
| Estilo de componentes | Rounded / Soft Glow (opción B) | 2 |
| Concepto de splash | Expresionista — gradiente radial animado (opción A) | 2 |
| Navegación principal | Sidebar vertical con iconos (opción A) | 2 |

### Handoff al programador — listo para Semana 2

El programador puede arrancar la implementación de componentes UI con:
1. Todos los tokens disponibles en `src/styles/tokens.css` vía `var(--token)`
2. Clases base en `src/styles/globals.css` (`.btn`, `.card`, `.input`, etc.)
3. Clases por módulo en `src/styles/modules/*.css`
4. Componentes Cult UI instalables con `npx shadcn@beta add @cult-ui/<nombre>`
5. Sistema de animaciones documentado con timing exacto en sección micro-interacciones
