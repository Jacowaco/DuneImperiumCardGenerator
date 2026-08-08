import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
