# DEV_TASKS.md — Harmony Lab Pro | Tareas de código
> Para sesión dedicada de Claude Code.
> Fecha: 2026-06-17

---

## Contexto

Harmony Lab Pro: app web musical interactiva. React 18 + Vite 5 + Web Audio API.
Ruta local: `~/proyectos/harmony-lab/`
Repo: https://github.com/kiffhei/harmony_lab
Producción: https://clawdbot-harmony-lab.u555aa.easypanel.host (actualmente rota)

Leer CLAUDE.md antes de cualquier cambio.

Estado actual: Semana 2/5 — 489 tests, 4 módulos implementados, deploy roto.

---

## DEV1 · Eliminar webhook URL de CLAUDE.md `[XS]` — URGENTE

**Archivo:** CLAUDE.md
**Problema:** URL real de deploy de EasyPanel en texto plano en repo público.

Buscar y reemplazar la línea:
```
http://89.116.167.180:3000/api/deploy/8783735a2ab991b4b131b9a3570d34503eed3d11836f7669
```
Por:
```
[URL almacenada en GitHub Secret: EASYPANEL_WEBHOOK_URL]
```

Commit: `security: remove EasyPanel webhook URL from public doc`

---

## DEV2 · Crear archivo de configuración ESLint `[XS]`

**Archivo nuevo:** `.eslintrc.json` en raíz del proyecto.

El proyecto usa ESLint 8.x (no flat config). Crear:

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn"
  },
  "ignorePatterns": ["dist/", "coverage/", "node_modules/"]
}
```

Verificar: `npm run lint` → reporta issues si los hay (no 0 errors forçado).
Si hay errores, resolverlos. Si hay warnings de prop-types, son esperados (documentados en CLAUDE.md).

Agregar paso de lint al workflow de CI en `.github/workflows/deploy.yml`:
```yaml
# En el job "test", después de "Install dependencies":
- name: Lint
  run: npm run lint
```

---

## DEV3 · Agregar badge de CI al README `[XS]`

Añadir después del título en README.md:
```md
[![CI/CD](https://github.com/kiffhei/harmony_lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/kiffhei/harmony_lab/actions/workflows/deploy.yml)
```

También agregar nota de estado de deploy:
```md
> ⚠️ **Deploy en progreso** — Para ver el estado actual, ejecutar localmente con `npm run dev`.
```

---

## DEV4 · Diagnosticar y resolver deploy en EasyPanel `[M]` — CRÍTICO

El bug "Service is not reachable" está documentado pero sin resolver desde 2026-06-09.

**Checklist de diagnóstico (orden de probabilidad):**

1. **Verificar logs del contenedor en EasyPanel:**
   - EasyPanel → harmony-lab → ícono terminal (>_)
   - Ejecutar: `node server.js`
   - Si falla: el error indicará la causa exacta

2. **Verificar nombre del contenedor en la red Docker interna:**
   EasyPanel puede usar `harmony-lab` como hostname sin el prefijo `clawdbot_`.
   En la config de proxy de EasyPanel, cambiar destino de:
   `http://clawdbot_harmony-lab:4000/` a `http://harmony-lab:4000/`

3. **Verificar dependencias de producción:**
   ```bash
   # En el contenedor:
   node -e "import('./server.js').catch(e => console.error(e))"
   ```
   Si framer-motion u otra dep falta: verificar que estén en `dependencies` (no `devDependencies`).
   
   En package.json: `framer-motion` está en `dependencies` ✓

4. **Verificar puerto:**
   ```bash
   # En el contenedor:
   node server.js &
   curl http://localhost:4000/health
   ```
   Si responde 200 → el problema es el proxy de EasyPanel, no el servidor.

5. **Si el problema es el proxy:** destruir y recrear el servicio en EasyPanel, configurando:
   - Source: GitHub kiffhei/harmony_lab, branch main
   - Build: Docker
   - Port: 4000
   - Domain: clawdbot-harmony-lab.u555aa.easypanel.host

---

## DEV5 · Sacar CLAUDE.md y DESIGNER.md del repo público `[S]`

Mismo proceso que cafe-plus:
```bash
echo "CLAUDE.md" >> .gitignore
echo "DESIGNER.md" >> .gitignore
git rm --cached CLAUDE.md DESIGNER.md
git commit -m "security: remove internal docs from public tracking"
```

**Nota:** CLAUDE.md y DESIGNER.md de harmony-lab son más extensos y más valiosos
que los de cafe-plus. Si los sacas del repo, considera crear un CLAUDE.md "cara pública"
con: descripción del proyecto, arquitectura de módulos, instrucciones de contribución.
El DESIGNER.md tiene información de diseño que puede quedarse si se remueve la parte
de infraestructura (webhook URL, IPs).

---

## DEV6 · Continuar implementación Semana 2 — Piano, Guitar, Progressions `[L]`

Los 3 módulos pendientes de Semana 2 antes de arrancar con Rhythm Lab.

**Piano:**
- Archivo: `src/components/Piano/Piano.jsx` (crear)
- 3 octavas visibles (C3-B5), notas de la escala activa resaltadas
- Click/touch → AudioEngine.playTone(freq, dur, type, vol)
- Notas resaltadas reactivas a MusicContext (rootNote + scaleName)
- CSS: `src/styles/modules/piano.css` ya existe con la identidad visual
- Tests: `src/components/Piano/Piano.test.jsx` con React Testing Library

**Guitar:**
- Archivo: `src/components/Guitar/Guitar.jsx` (crear)
- 6 cuerdas × 12 trastes, notas de escala resaltadas
- CSS: `src/styles/modules/guitar.css` ya existe

**Progressions:**
- Archivo: `src/components/Progressions/Progressions.jsx` (crear)
- Editor visual de progresiones, play secuencial via AudioEngine, exportar MIDI
- CSS: `src/styles/modules/progressions.css` ya existe

---

## Orden de ejecución recomendado

1. **DEV1** — 5 min, ahora mismo (seguridad)
2. **DEV2 + DEV3** — 30 min, misma sesión
3. **DEV4** — sesión dedicada de diagnóstico de deploy (requiere acceso EasyPanel)
4. **DEV5** — decisión previa de Brian, luego 5 min
5. **DEV6** — semanas siguientes del roadmap
