import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Sistema de Gestión Aduanera',
        short_name: 'SGA',
        description: 'Plataforma de gestión aduanera para despachantes de aduana',
        theme_color: '#3182ce',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
     tailwindcss(),

  ],
  server: {
    host: true, 
    port: 5173,
    strictPort: true,
  }
})