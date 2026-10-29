import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    adonisjs({
      // Fichiers CSS et JavaScript compilés par Vite.
      entryPoints: ['resources/css/app.css', 'resources/css/landing.css', 'resources/js/app.js'],
      // Recharge les pages Edge lors de leurs modifications.
      reload: ['resources/views/**/*.edge'],
    }),
  ],
  server: {
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
