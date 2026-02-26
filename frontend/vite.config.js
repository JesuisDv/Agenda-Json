import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'

// Incluir todos los .html de la raíz de frontend (nadie queda fuera)
const htmlFiles = readdirSync(__dirname)
  .filter((f) => f.endsWith('.html'))
  .reduce((acc, name) => {
    const key = name.replace('.html', '')
    acc[key] = resolve(__dirname, name)
    return acc
  }, {})

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.keys(htmlFiles).length ? htmlFiles : { main: resolve(__dirname, 'index.html') },
    },
  },
})
