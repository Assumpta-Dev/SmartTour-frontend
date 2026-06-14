import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'vendor-motion':  ['framer-motion'],
          'vendor-swiper':  ['swiper'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Smart Tourism Guide',
        short_name: 'TourGuide',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Pre-cache all built assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,webp,jpg,jpeg}'],

        runtimeCaching: [
          // Map tiles — cache-first, 7 days
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 604800 },
            },
          },

          // API objects list + individual objects — stale-while-revalidate
          // Serves cached data instantly, refreshes in background when online
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/objects'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-objects',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 }, // 30 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Uploaded images served from the API origin
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'object-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 86400 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Audio narration files
          {
            urlPattern: ({ url }) => /\.(mp3|wav|ogg|m4a)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-files',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
