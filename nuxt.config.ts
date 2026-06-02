// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Enable Nuxt 4 directory structure and features
  future: {
    compatibilityVersion: 4,
  },

  // Modules
  modules: ['nuxt-gtag', '@nuxtjs/i18n'],

  // i18n configuration
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json'
      },
      {
        code: 'zh',
        language: 'zh-CN',
        file: 'zh.json'
      }
    ],
    vueI18n: './i18n.config.ts'
  },

  // Google Analytics configuration
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || 'G-BILLSPLIT123'
  },

  // Global CSS files
  css: [
    'vuetify/lib/styles/main.css',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/css/main.css'
  ],

  // Build configuration for transpiling Vuetify
  build: {
    transpile: ['vuetify'],
  },

  // Vite specific options for SSR support
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
})
