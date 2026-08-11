import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { version } from './package.json' with { type: 'json' }

export default defineConfig({
  // GitHub Pages sirve el proyecto en /<repo>/, no en la raíz. El build de
  // escritorio (Tauri) y el dev server sí van en la raíz, así que el base
  // path sólo cambia cuando el workflow de deploy pone esta variable.
  base: process.env.GH_PAGES ? '/DuneImperiumCardGenerator/' : '/',
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    watch: {
      // Si un archivo del proyecto está abierto en otro programa, Windows lo
      // bloquea y el watcher de Vite se cae con EBUSY, tirando abajo todo el
      // servidor. Nada de esto lo consume la app — los PSD crudos los procesa
      // `npm run assets` y el PDF y el render de referencia son documentación —
      // así que no hay motivo para vigilarlos.
      ignored: ['**/psd-exports/**', '**/reference/**', '**/*.pdf'],
    },
  },
})
