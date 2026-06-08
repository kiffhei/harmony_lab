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

### Animaciones de navegación principal
<!-- Completar después de la sesión 2 -->

---

## Contexto del autor

Brian Eduardo Anaya Ruiz — Consultor de automatización y 
transformación digital. Cuautitlán, Estado de México.
Productor musical, DJ (hip-hop, reggae, deep house, neo-soul).
Usa Ableton Live, Maschine 2, Novation Launchpad.
Este proyecto es portafolio técnico público — debe verse 
y sentirse profesional a nivel de producto comercial real.
