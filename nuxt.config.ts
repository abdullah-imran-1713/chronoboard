export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },

  // Transpile client JS down so older browsers/WebViews (e.g. 2016 tablets) can run it
  vite: {
    build: {
      target: 'es2019',
    },
  },

  // Vercel/Nuxt: also set here so Permissions-Policy survives nitro output merge
  routeRules: {
    '/**': {
      headers: {
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
      },
    },
  },

  components: [
    { path: '~/components/core', pathPrefix: false },
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/settings', pathPrefix: false },
    { path: '~/components/widgets', pathPrefix: false },
    '~/components',
  ],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
  ],

  pinia: {
    storesDirs: ['../stores/**'],
  },

  runtimeConfig: {
    weatherApiKey: '',
    adminPassword: '',
    analyticsSecret: '',
  },

  app: {
    head: {
      title: 'ChronoBoard — Premium Digital Clock & Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'A beautiful, customizable digital clock and productivity dashboard for your screens.' },
        { name: 'theme-color', content: '#000000' },
        { property: 'og:title', content: 'ChronoBoard — Premium Digital Clock & Dashboard' },
        { property: 'og:description', content: 'A beautiful, customizable digital clock for your screens' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://chronoboard.app' },
        { property: 'og:image', content: 'https://chronoboard.app/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'canonical', href: 'https://chronoboard.app' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  compatibilityDate: '2025-01-01',

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ChronoBoard — Digital Clock & Dashboard',
      short_name: 'ChronoBoard',
      description: 'A beautiful, customizable digital clock and productivity dashboard',
      theme_color: '#000000',
      background_color: '#000000',
      display: 'fullscreen',
      orientation: 'any',
      categories: ['productivity', 'utilities'],
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
    },
  },
})
