import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA: tek kod tabaniyla telefon (Android/iPhone) + PC + tarayicida calisir.
// Kullanici "Ana ekrana ekle" ile uygulamayi yukleyebilir.
//
// BASE_PATH: GitHub Pages proje sayfasi alt-yolda yayinlanir
// (or. /Dorugunaminabasim/). CI bu env'i ayarlar; yerelde '/' kalir.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gunluk Aktivite AI',
        short_name: 'AktiviteAI',
        lang: 'tr',
        description: 'AI ile gunluk planlama, puan, rank ve kalori takibi',
        theme_color: '#F6F6F4',
        background_color: '#F6F6F4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: base + 'index.html'
      },
      devOptions: { enabled: true }
    })
  ]
})
