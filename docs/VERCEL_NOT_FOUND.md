# Resolver NOT_FOUND (404) en Vercel

## 1. La solución aplicada

Se hicieron estos cambios para que el despliegue en Vercel deje de devolver **NOT_FOUND** (404):

### A. Root Directory en Vercel = `frontend`

- En **Vercel** → tu proyecto → **Settings** → **General** → **Root Directory**.
- Pon **`frontend`** y guarda.
- Así Vercel usa la carpeta `frontend` como raíz del proyecto (donde están `index.html` y el `package.json` con el build).

### B. Build multi-página en Vite

- **Problema:** Por defecto Vite solo incluye `index.html` en el build. Las rutas `/create.html`, `/admin.html`, `/dashboard.html` no existían en `dist/` y Vercel devolvía 404.
- **Solución:** Se añadió **`frontend/vite.config.js`** con varias entradas HTML:

```js
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      create: resolve(__dirname, 'create.html'),
      admin: resolve(__dirname, 'admin.html'),
      dashboard: resolve(__dirname, 'dashboard.html'),
    },
  },
}
```

- Tras `npm run build`, en **`dist/`** quedan los cuatro HTML y sus assets, y todas esas URLs dejan de dar NOT_FOUND.

### C. Config en `dist` para producción

- **Problema:** En el build, los HTML seguían referenciando `./src/js/config.js`, que no se copia a `dist/`, así que en producción ese script podía fallar o no existir.
- **Solución:** Se creó **`frontend/public/config.js`** (mismo contenido que `src/js/config.js`). Vite copia todo `public/` a la raíz de `dist/`, así que en producción existe `/config.js`. En todos los HTML se cambió la referencia a **`/config.js`**.

### D. `vercel.json` en frontend

- **`frontend/vercel.json`** indica a Vercel que el build es `npm run build` y que el resultado está en **`dist`**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

---

## 2. Causa del error

### Qué estaba pasando

- **NOT_FOUND** en Vercel significa que la **ruta que pides no existe** en lo que se desplegó (HTTP 404).
- En tu caso ocurría una o ambas cosas:
  1. **Raíz del proyecto incorrecta:** Si en Vercel no se ponía **Root Directory = frontend**, la raíz era la del repo. Ahí no hay `index.html` (está en `frontend/`), así que hasta la URL principal podía devolver 404.
  2. **Solo se construía `index.html`:** Con la configuración por defecto de Vite, `vite build` solo procesa `index.html`. En `dist/` no había `create.html`, `admin.html` ni `dashboard.html`, así que rutas como `/create.html` o `/admin.html` no existían en el despliegue → NOT_FOUND.

### Qué hacía falta

- Que la **raíz del despliegue** fuera la carpeta que contiene `index.html` y el build (es decir, `frontend`).
- Que el **build incluyera todas las páginas** que quieres servir (multi-page), para que esas rutas existan en `dist/`.
- Que los **recursos referenciados** (como `config.js`) existan en `dist/` (por ejemplo vía `public/`).

### Resumen de la causa

- Se asumía que “subir el repo” era suficiente y que Vercel “encontraría” el sitio en la raíz.
- Se usaba Vite en modo por defecto (una sola entrada = solo `index.html`), así que el resto de páginas no se generaban.
- La combinación “raíz equivocada” y “solo index en dist” hace que casi cualquier ruta (o incluso la raíz) devuelva NOT_FOUND.

---

## 3. Concepto de fondo

### Por qué existe este error

- NOT_FOUND existe para indicar que **el recurso pedido no está en el servidor**. En despliegues, eso suele significar:
  - La ruta no existe en los archivos estáticos que subiste (p. ej. en `dist/`).
  - O el servidor no está configurado para servir esa ruta (por ejemplo, raíz del proyecto incorrecta).

### Modelo mental útil

- **Vercel** sirve lo que haya en la **carpeta de salida** (Output Directory) del **proyecto cuya raíz es Root Directory**.
- Cada **ruta** (por ejemplo `/create.html`) debe corresponder a un **archivo** en esa salida (por ejemplo `dist/create.html`), o a una regla de reescritura si usas SPA/rewrites.
- En un **multi-page** sin framework de rutas, “cada página = un HTML en la salida del build”. Si no está en el build, esa ruta no existe y obtienes NOT_FOUND.

### Cómo encaja en Vercel / Vite

- **Vercel:** Define “qué carpeta es el proyecto” (Root) y “qué carpeta es el resultado del build” (Output). Solo sirve lo que haya ahí.
- **Vite:** Por defecto es “single-page”: una sola entrada (`index.html`). Para varias páginas hay que declarar **todas** las entradas en `build.rollupOptions.input`.

---

## 4. Señales de alerta y cómo evitarlo

### Qué vigilar

- **Varios HTML en el repo pero solo uno en el build:** Si tienes `create.html`, `admin.html`, etc., pero en `vite.config.js` no los declaras como entradas, no estarán en `dist/` y esas URLs darán 404 en producción.
- **Repo con subcarpeta “frontend” o “web”:** Si el código del sitio está en una subcarpeta, en Vercel debes poner **Root Directory** a esa carpeta; si no, la raíz no tiene `index.html` y puedes ver NOT_FOUND hasta en `/`.
- **Scripts o assets con rutas a `src/` en el build:** En producción se sirve `dist/`, no `src/`. Si los HTML del build siguen apuntando a `./src/...`, esos archivos no existen en `dist/` y pueden dar 404 o fallos en runtime. Usa `public/` para lo que deba estar en la raíz de `dist/`.

### Errores parecidos

- **404 solo en rutas “directas”** (por ejemplo `/create.html`): típico de multi-page donde no se incluyeron todas las entradas en el build.
- **404 en la raíz** (`/`): suele ser Root Directory mal configurado o que el build no genera `index.html` en la carpeta de salida.
- **404 en un JS/CSS** después del deploy: el HTML del build referencia un path que no existe en `dist/` (por ejemplo algo que solo existe en `src/` y no se copia ni se incluye en el bundle).

### Patrones a evitar

- Dejar **Root Directory** vacío cuando el sitio está en una subcarpeta.
- Usar **Vite** con varios HTML sin configurar `build.rollupOptions.input`.
- Referenciar en los HTML de producción archivos que **no** están en `public/` ni incluidos en el bundle (por ejemplo `./src/js/config.js` en un build que no procesa ese script).

---

## 5. Otras formas de resolverlo (y trade-offs)

### Opción 1: Multi-page con Vite (la que aplicamos)

- **Qué es:** Añadir en `vite.config.js` todas las entradas HTML.
- **Ventajas:** Un solo comando de build, assets optimizados, todo en `dist/`.
- **Desventajas:** Hay que mantener la lista de entradas si añades más páginas.

### Opción 2: No usar build en Vercel (solo estáticos)

- **Qué es:** Root Directory = `frontend`, sin Build Command, Output = `.` (o la carpeta donde están los HTML).
- **Ventajas:** Configuración mínima, los HTML se sirven tal cual.
- **Desventajas:** No tienes minificación/optimización de Vite; además tendrías que asegurarte de que `config.js` y los demás assets estén en esa misma carpeta (por ejemplo copiando `src/` o usando solo `public/`).

### Opción 3: Un solo HTML (SPA) y rewrites

- **Qué es:** Una sola entrada (`index.html`) y en `vercel.json` configurar `rewrites` para que todas las rutas sirvan `index.html`.
- **Ventajas:** No necesitas multi-page en Vite; la app maneja rutas en el cliente.
- **Desventajas:** Tu proyecto actual es multi-página (varios HTML independientes), no una SPA; migrar a SPA sería un cambio de arquitectura.

Para tu caso (varios HTML ya existentes), la opción 1 es la más adecuada y es la que está aplicada.

---

## Checklist rápido después de los cambios

1. **Vercel** → Root Directory = **`frontend`**.
2. En local: `cd frontend && npm run build` → comprobar que en `dist/` están `index.html`, `create.html`, `admin.html`, `dashboard.html` y `config.js`.
3. Redesplegar en Vercel y probar:
   - `/`
   - `/create.html`
   - `/admin.html`
   - `/dashboard.html`
4. Si algo sigue en 404, revisar en **Deployments** → último deploy → **Building** y **Output** que la carpeta de salida sea `dist` y que el build haya terminado bien.
