# PLAN.md — Harmony Lab Pro | Plan de acción post-auditoría
> Criterio: portafolio para reclutadores. Fecha: 2026-06-17.

---

## CRÍTICO — Bloquea mostrar el proyecto

### C1 · Resolver deploy en EasyPanel `[M]`
**Problema:** URL de producción devuelve "Service is not reachable". Un reclutador que visite el link ve 502/503.
**Estado del bug:** documentado en CLAUDE.md desde 2026-06-09. Causas probables:
1. Nombre de contenedor incorrecto — EasyPanel puede usar `harmony-lab` sin el prefijo `clawdbot_`
2. server.js falla al arrancar en producción
3. `npm ci --omit=dev` excluye dependencias que se necesitan en runtime
4. Problema de red/proxy en el servicio recreado

**Diagnóstico rápido (en EasyPanel → harmony-lab → terminal >_):**
```bash
node server.js
# Si falla aquí, la causa es server.js o dependencias
# Si corre, el problema es el proxy de EasyPanel
```

**Verificar también:**
```bash
# En el host del VPS — verificar que el contenedor escucha en 4000
docker ps | grep harmony
curl http://localhost:4000/health
```

---

### C2 · Eliminar webhook URL de CLAUDE.md `[XS]`
**Problema:** `[URL rotada — almacenada solo en GitHub Secret EASYPANEL_WEBHOOK_URL]` en texto plano en CLAUDE.md público. Cualquiera puede triggerear un deploy.
**Acción:**
1. Reemplazar la URL específica por `[URL_EN_GITHUB_SECRETS]`
2. O mover CLAUDE.md a `.gitignore` (ver C3)

---

### C3 · Sacar CLAUDE.md del repo público `[S]`
Mismo patrón que cafe-plus. CLAUDE.md expone: webhook URL, historial de sesiones, notas de debug, estado de infraestructura.
**Acción:** igual que cafe-plus — agregar a `.gitignore`, `git rm --cached CLAUDE.md DESIGNER.md`.
**Alternativa:** crear CLAUDE.md "cara pública" (elevator pitch + stack + cómo correr), renombrar el interno a `CLAUDE.internal.md` en `.gitignore`.

---

### C4 · Crear archivo de configuración ESLint `[XS]`
**Problema:** `npm run lint` falla con "ESLint couldn't find a configuration file". El proyecto usa ESLint 8.x (flat config no es default).
**Acción:**
```bash
# En la raíz del proyecto, crear .eslintrc.json:
{
  "env": { "browser": true, "es2021": true },
  "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "plugins": ["react"],
  "settings": { "react": { "version": "detect" } },
  "rules": { "react/react-in-jsx-scope": "off" }
}
```
Verificar: `npm run lint` → 0 errores.

---

### C5 · Badge de CI en README `[XS]`
GitHub Actions está configurado pero no hay badge en el README. Para un reclutador es el primer indicador de calidad automatizada.
**Acción:** agregar al inicio del README:
```md
[![CI/CD](https://github.com/kiffhei/harmony_lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/kiffhei/harmony_lab/actions/workflows/deploy.yml)
```

---

## IMPORTANTE — Mejora sustancial de percepción

### I1 · Screenshot del estado actual para README `[S]`
Aunque la app está incompleta, el Splash y los módulos implementados (KeyExplorer, HarmonyMap) ya se ven visualmente impresionantes con el design system. Una screenshot vale más que la URL rota.
**Acción:**
- Screenshot de: Splash screen (con gradientes animados), KeyExplorer (Circle of Fifths SVG), HarmonyMap (nodos en elipse)
- Agregar sección "Preview" al README con 2-3 imágenes
- Caption honesto: "Work in progress — Week 2/5"

### I2 · Fix bug ESLint en CI `[XS]`
El pipeline de CI actualmente no tiene paso de lint (solo test + build). Agregar paso de lint al workflow después de crear .eslintrc.json (C4).

### I3 · Fix 2 bugs de layout conocidos `[S]`
- KeyExplorer: altura overflow en viewports < 800px — issue de layout con `overflow: hidden` y altura calculada
- HarmonyMap: elipse aplastada en viewports wide — el fix con ResizeObserver está "en revisión"; verificar que funciona y hacer merge

### I4 · Nota de estado en README sobre completitud `[XS]`
El README dice "Semana 2 en progreso" pero no aclara que la URL de producción puede estar rota.
Agregar una nota honesta: "⚠️ Deploy en progreso — ejecutar localmente para ver el estado actual."

---

## NICE-TO-HAVE — Pulido final (después de Semanas 3-5)

### N1 · Implementar módulos faltantes (Piano, Guitar, Sequencer) `[XL]`
Los módulos de instrumentos son los más impresionantes para portafolio. Un piano funcional con Web Audio API en un browser es un diferenciador de alto impacto.

### N2 · TabletLayout y MobileLayout `[L]`
La app solo funciona en desktop actualmente.

### N3 · Demo GIF o video corto `[M]`
Una vez el Sequencer y el Piano estén implementados, un GIF de 15s mostrando:
Splash → KeyExplorer (cambia tonalidad → gradiente de fondo cambia) → HarmonyMap → Piano → Sequencer
Ese GIF en el README es el diferenciador máximo de portafolio.

### N4 · Agregar HarmonyGraph.js a la documentación de estructura en CLAUDE.md `[XS]`
El archivo existe pero no está en la estructura documentada — doc drift menor.

---

## Orden de ejecución recomendado

1. **C2** — 5 min, eliminar webhook URL del CLAUDE.md ahora mismo
2. **C4** — 15 min, crear .eslintrc.json
3. **C5** — 5 min, agregar CI badge al README
4. **I4** — 5 min, nota de estado en README
5. **C1** — sesión dedicada de diagnóstico de deploy (requiere acceso a VPS o EasyPanel)
6. **I1** — screenshots para README (con la app corriendo en local)
7. **I2, I3** — fix bugs de layout y CI lint
8. **C3** — decisión sobre CLAUDE.md público
9. **N1-N3** — completar semanas 3-5 del roadmap
