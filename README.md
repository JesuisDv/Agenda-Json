# 📝 App de Gestión de Tareas

Esta es una aplicación web simple desarrollada con JavaScript puro y JSON Server que permite gestionar tareas. Puedes crear nuevas tareas, visualizarlas por estado y cambiar su estado con un menú desplegable.

## 🚀 Características principales

- ✅ Crear tareas nuevas
- 📋 Ver todas las tareas separadas por estado:
  - Por hacer
  - En proceso
  - Completadas
- 🔄 Cambiar el estado de cada tarea dinámicamente desde un `<select>`
- 📡 Backend simulado usando [JSON Server](https://github.com/typicode/json-server)

---

## ⚙️ Requisitos

- [Node.js](https://nodejs.org/)
- [JSON Server](https://www.npmjs.com/package/json-server)
- Navegador web moderno (Chrome, Firefox, Edge, etc.)

---

## 📦 Instalación

1. **Clona este repositorio o descarga los archivos:**

   ```bash
   git clone https://github.com/tu-usuario/gestion-tareas.git
   cd gestion-tareas
   npm install -g json-server
   {
    "tareas": []
   }
   json-server --watch db.json --port 3000

## Estructura del proyecto
📁 proyecto/
├── index.html
├── app.js
└── db.json  ← creado por el usuario

Autor
Jesus Franco
