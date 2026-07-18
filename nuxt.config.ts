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

  icon: {
    clientBundle: {
      // Preload battery glyphs — dynamic swap was blank on some tablets
      icons: [
        'mdi:battery',
        'mdi:battery-outline',
        'mdi:battery-10',
        'mdi:battery-20',
        'mdi:battery-30',
        'mdi:battery-40',
        'mdi:battery-50',
        'mdi:battery-60',
        'mdi:battery-70',
        'mdi:battery-80',
        'mdi:battery-90',
        'mdi:battery-charging-10',
        'mdi:battery-charging-20',
        'mdi:battery-charging-30',
        'mdi:battery-charging-40',
        'mdi:battery-charging-50',
        'mdi:battery-charging-60',
        'mdi:battery-charging-70',
        'mdi:battery-charging-80',
        'mdi:battery-charging-90',
        'mdi:battery-charging-100',
      ],
    },
  },

  pinia: {
    storesDirs: ['../stores/**'],
  },

  runtimeConfig: {
    adminPassword: '',
    analyticsSecret: '',
    public: {
      // Set NUXT_PUBLIC_SUPPORT_URL (Payoneer payment link, Ko-fi, etc.)
      supportUrl: '',
      supportEmail: '',
    },
  },

  app: {
    head: {
      title: 'ChronoBoard — Premium Digital Clock & Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'A beautiful, customizable digital clock and productivity dashboard for your screens.' },
        { name: 'theme-color', content: '#000000' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'ChronoBoard' },
        { property: 'og:title', content: 'ChronoBoard — Premium Digital Clock & Dashboard' },
        { property: 'og:description', content: 'A beautiful, customizable digital clock for your screens' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://chronoboard.app' },
        { property: 'og:image', content: 'https://chronoboard.app/og-image.png?v=kinetic' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'canonical', href: 'https://chronoboard.app' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap',
        },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png?v=gemini-k3' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png?v=gemini-k3' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png?v=gemini-k3' },
        { rel: 'shortcut icon', href: '/favicon.ico?v=gemini-k3' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=gemini-k3' },
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
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
    },
  },
})
