# AUDIT.md — Harmony Lab Pro
> Auditoría: 2026-06-17. Criterio: reclutador externo revisando repo en 5 minutos.

---

## 1. Funcionalidad — ¿corre end-to-end?

**BIEN:**
- Build: `npm run build` ✓ (3.92s, 0 errores, 0 warnings)
- Tests: 489 passing, 9 suites, cobertura >99% en core/ — el punto más fuerte del proyecto
- GitHub Actions configurado: pipeline test → build → deploy en push a main
- Docker multistage con health check — buena práctica visible
- Bundle eficiente: ~287KB (vs 676KB de un proyecto comparable) gracias a Vite 5 + tree-shaking

**PROBLEMAS CRÍTICOS:**
- **Deploy roto.** La URL de producción `https://clawdbot-harmony-lab.u555aa.easypanel.host` devuelve "Service is not reachable" según CLAUDE.md (bug documentado el 2026-06-09, sin resolver). Si el reclutador visita la URL, ve un error 502/503.
- **`npm run lint` falla.** El script existe en package.json (`eslint src --ext .js,.jsx`) pero no hay archivo de configuración ESLint en el repo. Salida: "ESLint couldn't find a configuration file." Para un reclutador que ejecute `npm run lint`, el proyecto parece mal configurado.
- **App incompleta (Semana 2 de 5).** Módulos implementados: 4 de 9+ (DesktopLayout, Splash, KeyExplorer, HarmonyMap). Pendientes: Piano, Guitar, Sequencer, PatternLibrary, Progressions, Tuner, SongAnalyzer, TabletLayout, MobileLayout. No hay ni una sola pantalla de entrada de audio funcional.

**BUGS DE UI CONOCIDOS (sin resolver):**
- KeyExplorer: columna derecha desborda la viewport en viewports < 800px de alto
- HarmonyMap: nodos en elipse aplastada en viewports wide (> 1000px). Fix vía ResizeObserver implementado, documentado como "en revisión"

---

## 2. Seguridad — CRÍTICO

**BLOQUEANTE:**
- **Webhook URL de EasyPanel en texto plano en CLAUDE.md público.** En la sección "Bug activo" del CLAUDE.md commiteado:
  ```
  [URL rotada — almacenada solo en GitHub Secret EASYPANEL_WEBHOOK_URL]
  ```
  Cualquier persona con acceso al repo puede hacer un POST a esa URL y triggerear un deploy de producción. Esto es una exposición de infraestructura en un repo público.

**BIEN:**
- `EASYPANEL_WEBHOOK_URL` en el workflow de GitHub Actions usa `${{ secrets.EASYPANEL_WEBHOOK_URL }}` — correcto
- Sin API keys hardcodeadas en el source
- `.env` en `.gitignore` ✓
- `.env.example` existe con PORT y NODE_ENV (aunque mínimo)

---

## 3. Calidad de código

**BIEN:**
- Estructura de carpetas respeta el CLAUDE.md: core/, components/ (carpeta propia por componente), hooks/, context/, layouts/, styles/
- Sin class components, solo hooks funcionales
- PropTypes declarados (documentado como elección consciente sobre TypeScript)
- Commits semánticos consistentes (feat, fix, docs, chore)
- 489 tests con cobertura >99% en lógica de negocio — genuinamente impresionante
- server.js sin Express (Node HTTP puro) — señal de competencia técnica

**PROBLEMAS:**
- **ESLint sin configurar** — el script existe pero el config no (ver Funcionalidad arriba)
- **No existen animations/transitions.js ni microinteractions.js** — el CLAUDE.md los referencia en la estructura de carpetas pero no existen en disco. Los 4 backgrounds animados (ParticlesBeat, TonalityGradient, etc.) tampoco están en `src/animations/backgrounds/` — no se encontraron en el tree de archivos actual.
- **CLAUDE.md en repo público** — expone webhook URL, historial de sesiones, notas de debug internas
- **HarmonyGraph.js** existe en `src/core/` pero no aparece en la estructura documentada en CLAUDE.md (que solo menciona MusicTheory, AudioEngine, MidiExport) — doc drift

---

## 4. Tests

**EXCEPCIONAL:**
- 489 tests en 9 suites — mejor coverage de todos los proyectos
- Tests de componentes UI (HarmonyMap.test.jsx, KeyExplorer.test.jsx) además de core
- Pipeline CI corre tests con coverage antes del deploy
- Artefacto de coverage se sube como artifact de CI
- TDD real: core/ implementado antes que la UI

**OBSERVACIÓN:**
- Tests de UI limitados a los 2 módulos implementados (HarmonyMap 17 tests, KeyExplorer 18 tests). Los módulos pendientes (Piano, Guitar, Sequencer...) obviamente no tienen tests aún.

---

## 5. Documentación

**BIEN:**
- README cubre stack, estado por semana, instrucciones de desarrollo local, infraestructura
- Estado de progreso visible en README (✅/⏳)
- URL de producción en README (aunque está rota)
- 489 tests y >99% cobertura documentados en README ✓

**PROBLEMAS:**
- Sin capturas de pantalla ni GIF (el app está incompleta, pero el Splash y los módulos implementados ya se ven bien)
- Sin badge de CI en README a pesar de tener GitHub Actions configurado
- Deploy roto no está anotado en README — el reclutador ve URL de producción, visita, ve error 502
- CLAUDE.md expone webhook URL de EasyPanel (ver Seguridad)

---

## 6. UI/UX

**BIEN:**
- Design system completo: tokens.css, globals.css, 9 CSS de módulos específicos, 4 backgrounds animados
- Tipografía con personalidad: Syne (display) + Barlow (body) + Space Mono (datos) — diferenciador visual
- 12 colores de tonalidad por nota (círculo de quintas → espectro) — feature técnica y visual única
- Identidad visual por módulo (piano = marfil, sequencer = drum machine industrial, etc.)
- Framer Motion para transiciones documentadas con timing exacto

**PROBLEMAS:**
- Los módulos más impresionantes (Piano, Sequencer, Tuner) no están implementados aún
- 2 bugs de layout visibles en módulos terminados (KeyExplorer, HarmonyMap)
- Solo DesktopLayout implementado — app no usable en mobile/tablet

---

## 7. ¿Qué tan lejos está de "listo para mostrar"?

**Veredicto: 55% listo.** Es el proyecto más ambicioso del portafolio en arquitectura y cobertura de tests, pero su estado de completitud lo aleja de "listo para mostrar":

**Lo que sí impresiona sin abrir la app:**
- 489 tests con >99% cobertura en una app musical compleja
- Web Audio API nativa (sin librerías)
- MIDI export binary manual
- CI/CD completo con GitHub Actions
- Design system con identidad visual de instrumento por módulo

**Lo que lo bloquea:**
1. Deploy roto — el reclutador ve 502 si visita la URL de producción
2. App al 40% — la primera impresión es "Splash + 2 módulos"
3. ESLint roto — `npm run lint` da error
4. Webhook URL de EasyPanel expuesto en repo público
