# PROMPT_KICKOFF.md — Harmony Lab Pro | Prompts de inicio para sesiones dedicadas
> Generado: 2026-06-17 · Auditoría en AUDIT.md · Plan en PLAN.md

---

## KICKOFF A — Sesión Claude Code (seguridad + ESLint + README) `[30-45 min]`

```
Proyecto: Harmony Lab Pro — app web musical interactiva (React 18 + Vite 5 + Web Audio API).
Ruta local: ~/proyectos/harmony-lab/
Repo: https://github.com/kiffhei/harmony_lab
Lee CLAUDE.md antes de tocar cualquier archivo.

Esta sesión es de seguridad, configuración y documentación. No hay nueva funcionalidad.

TAREAS (en orden):

1. [DEV1] Eliminar webhook URL de EasyPanel de CLAUDE.md
   - Buscar: "http://89.116.167.180:3000/api/deploy/8783..."
   - Reemplazar con: "[URL almacenada en GitHub Secret: EASYPANEL_WEBHOOK_URL]"
   - Commit: "security: remove EasyPanel webhook URL from public doc"

2. [DEV2] Crear .eslintrc.json
   - El proyecto usa ESLint 8.x con react y react-hooks plugins
   - Ver DEV_TASKS.md DEV2 para el contenido exacto
   - Verificar: npm run lint (reportar qué encuentra, no forzar 0 errors sin revisar)

3. [DEV2 cont] Agregar paso de lint al CI
   - .github/workflows/deploy.yml, job "test", después de "Install dependencies"
   - Agregar step: name: Lint / run: npm run lint

4. [DEV3] Agregar CI badge al README
   - Badge de deploy.yml al inicio del README
   - Agregar nota de estado: "⚠️ Deploy en progreso — ejecutar localmente con npm run dev"

Verificación: npm run test (489/489 deben seguir pasando), npm run build (debe pasar).
Commit los 4 cambios por separado para trazabilidad.
```

---

## KICKOFF B — Sesión Claude Code (diagnóstico de deploy) `[sesión dedicada]`

```
Proyecto: Harmony Lab Pro.
Ruta local: ~/proyectos/harmony-lab/
Bug documentado en CLAUDE.md: "Service is not reachable" en EasyPanel.
URL afectada: https://clawdbot-harmony-lab.u555aa.easypanel.host

El objetivo de esta sesión es SOLO diagnosticar y resolver el deploy roto.
Lee CLAUDE.md sección "Bug activo" antes de empezar.

Checklist de diagnóstico (en orden de probabilidad):

1. Verificar en EasyPanel → harmony-lab → terminal (>_):
   node server.js
   Si falla, el error es la causa exacta.

2. Si corre: curl http://localhost:4000/health
   Si responde 200, el problema es el proxy de EasyPanel, no el servidor.
   Solución: cambiar hostname en la config de proxy de "clawdbot_harmony-lab" a "harmony-lab".

3. Si hay error en node server.js:
   - Verificar que framer-motion está en dependencies (no devDeps) → ya está ✓
   - Verificar que package.json tiene "type": "module" → ya está ✓
   - Revisar el error exacto del log

Después de resolver: verificar que https://clawdbot-harmony-lab.u555aa.easypanel.host carga correctamente.
Actualizar README removiendo la nota de "⚠️ Deploy en progreso".
```

---

## KICKOFF C — Sesión Claude Code (continuar Semana 2: Piano) `[90-120 min]`

```
Proyecto: Harmony Lab Pro. Ruta: ~/proyectos/harmony-lab/.
Lee CLAUDE.md antes de empezar. Estado: Semana 2, completados DesktopLayout + Splash + KeyExplorer + HarmonyMap.

Esta sesión implementa el módulo Piano.

PRE-REQUISITOS ANTES DE CODIFICAR:
1. Leer src/styles/modules/piano.css — el CSS con identidad visual ya existe
2. Leer src/core/AudioEngine.js — entender cómo usar playTone(freq, dur, type, vol)
3. Leer src/core/MusicTheory.js — entender getScale() y noteFreq()
4. Leer src/context/MusicContext.jsx — entender cómo acceder a rootNote, scaleName

ARQUITECTURA DEL MÓDULO:
- Archivo: src/components/Piano/Piano.jsx
- Test: src/components/Piano/Piano.test.jsx (ESCRIBIR TESTS PRIMERO)
- 3 octavas: C3 a B5 (teclas blancas 21, negras 15, total 36)
- Click/touch → audioEngine.playTone(noteFreq(note, octave), 0.5, 'triangle', 0.7)
- Notas de escala activa resaltadas (via useMusicContext)
- CSS identity: teclas blancas = marfil envejecido, negras = lacado oscuro, root = acento ámbar

REGLAS:
- Hooks únicamente (React funcional)
- PropTypes en lugar de TypeScript
- Clase CSS de piano.css — NO CSS inline
- AudioContext solo se inicializa tras gesto del usuario (ya manejado en AudioEngine)
- Tests con React Testing Library antes de implementar

npm run test (489 deben seguir pasando) antes de cada push.
```

---

## KICKOFF D — Sesión Claude Design (screenshots + fix layout bugs) `[60-90 min]`

```
Proyecto: Harmony Lab Pro. App musical interactiva.
Lee DESIGNER.md antes de empezar.
Ver DESIGN_TASKS.md para el alcance completo.

Con npm run dev corriendo (localhost:5173):

PRIORIDAD 1: Fix visual — HarmonyMap elipse aplastada en viewports wide (> 1000px)
- Ver DESIGN_TASKS.md DT1 para las 3 opciones de solución
- Verificar el fix vía ResizeObserver que ya está implementado (HarmonyMap.jsx)
- Si no funciona correctamente, implementar la solución de max-width: 600px en el contenedor

PRIORIDAD 2: Fix visual — KeyExplorer overflow en viewports < 800px de alto
- Ver DESIGN_TASKS.md DT2
- Solución recomendada: tabs internos en columna derecha (Notas / Grados)

PRIORIDAD 3: Screenshots para README
- Splash, KeyExplorer (con escala Double Harmonic para máximo impacto), HarmonyMap
- Guardar en /docs/screenshots/ como PNG 1440px de ancho
- Ver DESIGN_TASKS.md DT3

Verificar: npm run test (489/489) + npm run build antes de cada push.
```
