# 📅 Agenda App -- Sistema de Gestión de Citas

## 🧾 Descripción del proyecto

Agenda App es una aplicación web full-stack para la gestión de citas.\
Permite a los clientes agendar turnos disponibles y a un administrador
gestionar, confirmar, cancelar y bloquear horarios desde un panel
privado.

Está pensada para negocios que trabajan con reservas por hora
(consultorios, barberías, asesorías, servicios técnicos, etc.).

------------------------------------------------------------------------

## 🚀 Demo / Preview

> ⚠️ Pendiente de despliegue público\
> (Se puede ejecutar localmente siguiendo los pasos de instalación)

------------------------------------------------------------------------

## ✨ Características principales

-   📌 Creación de citas por clientes
-   📊 Panel administrativo con login seguro (JWT)
-   ✅ Confirmar o cancelar citas
-   ⛔ Bloqueo manual de horarios
-   🔐 Rutas protegidas por middleware de autenticación
-   📅 Validación de disponibilidad de horarios
-   🧩 Arquitectura separada frontend/backend

------------------------------------------------------------------------

## 🛠 Tecnologías utilizadas

### Backend

-   Node.js
-   Express.js
-   MySQL
-   JWT (jsonwebtoken)
-   dotenv

### Frontend

-   HTML5
-   CSS3
-   JavaScript Vanilla
-   Fetch API

------------------------------------------------------------------------

## 📋 Requisitos previos

  Requisito   Versión recomendada
  ----------- ---------------------
  Node.js     \>= 18
  MySQL       \>= 8
  npm         \>= 9

------------------------------------------------------------------------

## ⚙️ Instalación paso a paso

### 1️⃣ Clonar el repositorio

``` bash
git clone <repo-url>
cd agenda-app
```

### 2️⃣ Backend

``` bash
cd backend
npm install
```

### 3️⃣ Crear base de datos

``` sql
CREATE DATABASE agenda_db;
```

Crear tablas principales:

``` sql
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(255)
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  appointment_date DATE,
  appointment_time TIME,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'pending'
);

CREATE TABLE blocked_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_date DATE,
  block_time TIME,
  reason TEXT
);
```

------------------------------------------------------------------------

## 🔐 Variables de entorno necesarias

Crear archivo `.env` en `/backend`

``` env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=agenda_db
JWT_SECRET=super_secret_key
```

------------------------------------------------------------------------

## ▶️ Ejecución del proyecto

### Backend

``` bash
cd backend
npm run dev
```

Servidor disponible en:

    http://localhost:3000

### Frontend

Abrir con Vite o Live Server:

    http://localhost:5173

------------------------------------------------------------------------

## 🧑‍💻 Uso del sistema / flujo básico

1.  El cliente crea una cita desde la agenda pública.
2.  La cita queda en estado **pending**.
3.  El admin inicia sesión.
4.  Desde el dashboard puede:
    -   Confirmar citas
    -   Cancelar citas
    -   Bloquear horarios
5.  El sistema evita reservas duplicadas.

------------------------------------------------------------------------

## 📁 Estructura del proyecto

    backend/
    │
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── routes/
    │   └── app.js
    │
    └── server.js

    frontend/
    │
    ├── index.html
    ├── admin.html
    ├── dashboard.html
    │
    ├── css/
    ├── js/
    │   ├── api.js
    │   ├── auth.js
    │   ├── user.js
    │   └── admin.js

------------------------------------------------------------------------

## 🔌 Endpoints principales

### Auth

  Método   Endpoint            Descripción
  -------- ------------------- -------------
  POST     `/api/auth/login`   Login admin

### Citas

  Método   Endpoint                         Descripción
  -------- -------------------------------- ----------------
  GET      `/api/appointments`              Listar citas
  POST     `/api/appointments`              Crear cita
  PATCH    `/api/appointments/:id/status`   Cambiar estado

### Bloqueos

  Método   Endpoint               Descripción
  -------- ---------------------- -------------------------
  POST     `/api/blocked-slots`   Bloquear horario
  GET      `/api/blocked-slots`   Ver horarios bloqueados

------------------------------------------------------------------------

## 📜 Scripts disponibles

``` bash
npm run dev      # Inicia servidor con nodemon
npm start        # Inicia servidor normal
```

------------------------------------------------------------------------

## 🧠 Buenas prácticas aplicadas

-   Separación de responsabilidades (routes/controllers)
-   Middleware de autenticación reutilizable
-   Validaciones básicas en backend
-   Uso de variables de entorno
-   Manejo centralizado de errores
-   Frontend desacoplado del backend

------------------------------------------------------------------------

## 🔮 Posibles mejoras futuras / Roadmap

-   📧 Notificaciones por email o WhatsApp
-   📱 Diseño responsive mejorado
-   📊 Dashboard con métricas
-   ⏱ Configuración de horarios laborales
-   👥 Soporte para múltiples admins
-   🌐 Deploy en producción (Docker + Nginx)

------------------------------------------------------------------------

## 🤝 Contribución

1.  Fork del repositorio
2.  Crear rama feature

``` bash
git checkout -b feature/nueva-funcionalidad
```

3.  Commit y push

``` bash
git commit -m "Nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

4.  Abrir Pull Request

------------------------------------------------------------------------

## 📄 Licencia

> ⚠️ Pendiente de definir (MIT recomendado)

------------------------------------------------------------------------

## 👨‍💻 Autor

Desarrollado por **Jesús**\
Proyecto de práctica full-stack para gestión de citas con autenticación
y panel administrativo.
