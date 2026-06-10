import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'hero.jpeg', 'robots.txt'],
      manifest: {
        name: 'Homydays Schools',
        short_name: 'Homydays',
        description: 'World-class education from Creche to Secondary School in Nigeria.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#F97316',
        lang: 'en-NG',
        orientation: 'portrait-primary',
        categories: ['education'],
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/hero.jpeg',
            sizes: '1280x720',
            type: 'image/jpeg',
            // @ts-ignore — form_factor is valid in the Web App Manifest spec
            form_factor: 'wide',
            label: 'Homydays Schools dashboard',
          },
          {
            src: '/hero.jpeg',
            sizes: '750x1334',
            type: 'image/jpeg',
            label: 'Homydays Schools on mobile',
          },
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            url: '/dashboard',
            description: 'Open the school dashboard',
          },
          {
            name: 'Login',
            url: '/login',
            description: 'Sign in to your account',
          },
        ],
      },
      workbox: {
        // Cache pages & assets for offline use — exclude large images from precache
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}', 'logo.png'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB
        // Network-first for API calls so data is always fresh when online
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Cache images with stale-while-revalidate
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
})
