# Guía de despliegue – Agenda (frontend + backend + MySQL)

Esta guía te lleva paso a paso a desplegar el proyecto en internet. Puedes hacerlo poco a poco.

---

## 1. Resumen de lo que tienes

| Parte      | Tecnología        | Qué hace |
|-----------|-------------------|----------|
| **Frontend** | HTML, JS, Bootstrap | create.html (agendar), admin.html (login), dashboard.html (panel) |
| **Backend**  | Node + Express     | API en `/api/...` (citas, auth, etc.) |
| **Base de datos** | MySQL            | Tablas: appointments, admins, blocked_slots |

Para producción necesitas:

1. **Un servidor (o servicio)** donde corra el **backend** (Node).
2. **Una base MySQL** en la nube (el backend se conecta por variables de entorno).
3. **El frontend** subido a un hosting estático **o** que los usuarios abran los HTML desde el mismo dominio que el API (para evitar CORS si lo restringes).

El proyecto ya está preparado para producción:

- La URL del API en el frontend se controla desde **un solo archivo**: `frontend/src/js/config.js` (variable `window.API_BASE_URL`).
- El backend usa variables de entorno para puerto, base de datos y JWT (`PORT`, `DB_*`, `JWT_SECRET`).
- El backend tiene script `npm start` para que los servicios en la nube lo ejecuten.

---

## 2. Variables de entorno del backend

Crea un archivo `.env` en la raíz de la carpeta **backend** (y en producción configúralas en el panel de tu servicio). No subas `.env` a Git.

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña
DB_NAME=appointment_manager
JWT_SECRET=una_frase_larga_y_secreta_aleatoria
```

- **En producción:** `DB_HOST` (y opcionalmente puerto) será la URL/host de tu MySQL en la nube. `DB_USER`, `DB_PASSWORD` y `DB_NAME` los da el proveedor de la base de datos.

---

## 3. Base de datos MySQL en la nube

Tienes que crear la base y las tablas en un MySQL accesible por internet. Algunas opciones:

- **PlanetScale** – MySQL compatible, tiene plan gratuito (suele requerir ajustar conexión SSL).
- **TiDB Cloud** – MySQL compatible, se suele usar junto con Render para tener backend + DB gratis.
- **Railway** – Ofrece MySQL y Node en el mismo sitio; tiene créditos gratuitos.
- **Render** – No tiene MySQL gratis; puedes usar Render solo para el backend y otra parte para MySQL (p. ej. TiDB Cloud o PlanetScale).

Pasos típicos:

1. Crear una base de datos MySQL en el proveedor.
2. Anotar: host, puerto, usuario, contraseña y nombre de la base.
3. Ejecutar tu script SQL (por ejemplo `backend/Scripts.sql`) en esa base para crear tablas e índices. Si tu proveedor usa un panel web, pega ahí el contenido del script (ajustando si usan sintaxis distinta para ENUM, etc.).
4. Crear al menos un usuario admin (según cómo tengas la tabla `admins` y el registro de usuarios; si tienes un seed o script para el primer admin, ejecutarlo).

---

## 4. Desplegar el backend (Node + Express)

Cualquier servicio que soporte Node.js sirve (Render, Railway, Fly.io, etc.). Idea general:

1. **Subir el código**  
   Solo la carpeta **backend** (o un repo que en la raíz tenga el backend). No hace falta subir `node_modules`; el servicio hará `npm install` al desplegar.

2. **Configurar variables de entorno**  
   En el panel del servicio, define las mismas que en `.env`:  
   `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.  
   Muchos servicios definen `PORT` automáticamente; si es así, no hace falta ponerla.

3. **Comando de inicio**  
   Usa: `npm start` (o `node src/server.js`). El `package.json` del backend ya tiene el script `start`.

4. **URL del backend**  
   Te darán una URL tipo `https://tu-app.onrender.com` o `https://tu-app.railway.app`. Esa es la **URL base del API**.

---

## 5. Configurar el frontend para producción

El frontend llama al API usando `window.API_BASE_URL`, que se define en **un solo sitio**:

**Archivo:** `frontend/src/js/config.js`

- **Desarrollo (local):**  
  `window.API_BASE_URL = 'http://localhost:3000'` (o dejarlo como está).

- **Producción:**  
  Cámbialo por la URL de tu backend **sin** barra final, por ejemplo:  
  `window.API_BASE_URL = 'https://tu-app.onrender.com'`

Solo con ese cambio, todas las pantallas (create, admin, dashboard) usarán tu API en producción.

---

## 6. Desplegar el frontend (HTML/JS estáticos)

Tienes dos caminos:

### Opción A: Mismo dominio que el backend (recomendado al principio)

Algunos servicios (p. ej. Render con “Static Site”, o un mismo servidor que sirva estáticos) permiten servir la carpeta **frontend** desde el mismo dominio que el backend.  
Si tu backend está en `https://tu-app.onrender.com` y el frontend se sirve ahí mismo (p. ej. en la raíz), entonces puedes poner en `config.js`:

```js
window.API_BASE_URL = ''   // peticiones a /api/... van al mismo origen
```

Así no tendrás problemas de CORS si más adelante restringes orígenes en el backend.

### Opción B: Frontend en otro servicio (Vercel, Netlify, GitHub Pages, etc.)

1. Sube la carpeta **frontend** (o el repo con la carpeta frontend como raíz del sitio).
2. En **producción**, asegúrate de que en `frontend/src/js/config.js` esté la URL completa del backend, por ejemplo:  
   `window.API_BASE_URL = 'https://tu-backend.onrender.com'`
3. En el backend, **CORS** ya está habilitado (`app.use(cors())`), así que el navegador permitirá peticiones desde otro dominio. Si más adelante quieres restringir, puedes limitar `cors()` a tu dominio del frontend.

---

## 7. Comprobar que todo funciona

1. Abre la URL del frontend (create o admin).
2. Prueba login (admin) y que el dashboard cargue las citas.
3. Prueba agendar una cita desde create.html.
4. Revisa que no haya errores en la consola del navegador (F12) ni en los logs del backend.

---

## 8. Mejoras que puedes hacer después

- Añadir **HTTPS** en todo (la mayoría de servicios ya lo dan).
- Restringir **CORS** en el backend al dominio real del frontend.
- No dejar `JWT_SECRET` ni contraseñas en el código; usar siempre variables de entorno.
- Mantener la URL del API solo en `config.js` (o en un build que inyecte la URL) y no hardcodearla en más archivos.
- Backups periódicos de la base MySQL.
- Si usas un servicio que “duerme” el backend (p. ej. Render free), tener en cuenta que la primera petición puede tardar más.

Cuando vayas a desplegar en un servicio concreto (Render, Railway, Vercel, etc.), si me dices cuál usas te puedo detallar los pasos exactos en ese panel (conectar repo, env vars, comando de start, etc.).
