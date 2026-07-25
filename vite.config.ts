import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Eat Somewhere',
        short_name: 'EatSomewhere',
        description: "Explore Anthony Bourdain's world and find your next meal",
        theme_color: '#1a1008',
        background_color: '#0f0d0b',
        display: 'standalone',
        start_url: '/explore',
        orientation: 'any',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /^https:\/\/api\.mapbox\.com\//, handler: 'NetworkOnly' },
          { urlPattern: /^https:\/\/events\.mapbox\.com\//, handler: 'NetworkOnly' },
          { urlPattern: /^https:\/\/[a-z]+\.supabase\.co\//, handler: 'NetworkOnly' },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
})
