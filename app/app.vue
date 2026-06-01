<template>
  <v-app class="app-container">
    <!-- Neubrutalist Header -->
    <header class="neo-header">
      <div class="header-content">
        <NuxtLink to="/" class="text-decoration-none d-flex align-center">
          <h1 class="header-title">
            <div class="header-actions mr-2">
              <div class="neo-btn pink" style="transform: rotate(-6deg); padding: 4px; pointer-events: none; margin: 0;">
                <v-icon size="small">mdi-receipt-text</v-icon>
              </div>
            </div>
            Bill Splitter
          </h1>
        </NuxtLink>
        <div class="header-actions">
          <v-btn class="neo-btn pink" icon="mdi-history" to="/history" aria-label="History"></v-btn>
          <v-btn class="neo-btn teal" icon="mdi-cog" @click="showSettings = true" aria-label="Settings"></v-btn>
        </div>
      </div>
    </header>

    <v-main class="main-content">
      <v-container class="px-4 py-8">
        <NuxtPage />
      </v-container>
    </v-main>

    <div class="d-flex flex-column flex-sm-row align-center justify-center gap-4 mt-10 mb-16 px-4">
      <div class="neo-card p-4 d-flex align-center gap-4" style="max-width: 450px; width: 100%;">
        <v-icon color="#FF007F" size="32">mdi-heart</v-icon>
        <a href="https://donate.stripe.com/9B6eVe3cYfsLftl03WejK00" class="ml-4 text-decoration-none text-black"
          target="_blank">
          <div class="font-weight-black">Support this application here</div>
          <div class="text-caption">AI does not run on water and is putting me in debt</div>
          <div class="text-caption">MYR 2 will process 50 bills</div>
        </a>
      </div>

      <div class="neo-card p-4 d-flex align-center gap-4" style="max-width: 450px; width: 100%;">
        <v-icon color="#00F5D4" size="32">mdi-code-json</v-icon>
        <a href="/?bill=eyJtZXJjaGFudE5hbWUiOiJKb25hdGhhbiIsImRhdGUiOiIyMDI2LTA2LTAxIiwiY3VycmVuY3kiOiJSTSIsIml0ZW1zIjpbeyJuYW1lIjoiRGV2ZWxvcG1lbnQgQ29zdCIsInF1YW50aXR5IjoxLCJwcmljZSI6OTh9LHsibmFtZSI6IlJlY2VpcHQgcHJvY2Vzc2luZyIsInF1YW50aXR5Ijo5OTk5OSwicHJpY2UiOjAuMDJ9LHsibmFtZSI6IldlYiBzZXJ2ZXIgcGVyIHByb2Nlc3MiLCJxdWFudGl0eSI6OTk5OTksInByaWNlIjowLjAxfSx7Im5hbWUiOiJNaWxrIHRlYSBkdXJpbmcgZGV2ZWxvcG1lbnQiLCJxdWFudGl0eSI6MSwicHJpY2UiOjcuOTB9XSwidGF4IjowLCJpc1RheEluSXRlbSI6ZmFsc2UsInNlcnZpY2VDaGFyZ2UiOjAsImRpc2NvdW50IjowLCJzdWJ0b3RhbCI6MTAwLCJ0b3RhbCI6MTA3LjkwLCJ0YXhSYXRlIjowLCJzZXJ2aWNlQ2hhcmdlUmF0ZSI6MCwiZGlzY291bnRSYXRlIjowfQ=="
          class="ml-4 text-decoration-none text-black">
          <div class="font-weight-black">Development Cost Breakdown</div>
          <div class="text-caption">See the cost of making this app</div>
          <div class="text-caption">If it can guilt trip you into using it properly...</div>
        </a>
      </div>
    </div>

    <v-footer
      style="background-color: var(--color-bg); border-top: var(--border-width) solid var(--color-navy); max-height: 128px;">
      <v-container>
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <p>[
              <v-btn variant="text" size="small" href="https://jonathanlawhh.com/" target="_blank">
                <strong>Jonathan Law Hui Hao</strong>
              </v-btn>
              ]
            </p>
          </v-col>
          <v-col cols="12" md="8">
            <p class="text-right">
              [
              <v-btn variant="text" size="small" href="https://jonathanlawhh.com/works/ai/" target="_blank">Other
                Projects
              </v-btn>
              ,
              <v-btn variant="text" size="small" href="https://github.com/jonathanlawhh/bill-splitter"
                target="_blank">Github
              </v-btn>
              ,
              <v-btn variant="text" size="small" href="https://jonathanlawhh.medium.com/" target="_blank">Blog</v-btn>
              ]
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>

    <!-- Settings Dialog -->
    <v-dialog v-model="showSettings" max-width="500px">
      <div class="neo-card p-6">
        <div class="dialog-header d-flex justify-between align-center mb-6">
          <h2 class="text-h5 font-weight-black">Settings</h2>
          <v-btn icon="mdi-close" variant="text" @click="showSettings = false"></v-btn>
        </div>
        <div class="mb-4">
          <label class="d-block font-weight-bold mb-2">Gemini API Key</label>
          <input v-model="apiKey" type="password" placeholder="AIzaSy..." class="neo-input" />
          <p class="text-caption mt-2 text-dark-gray">
            This key will be saved locally in your browser and sent only to the server for processing.
          </p>
        </div>
        <div class="d-flex justify-end gap-2 mt-6">
          <v-btn class="neo-btn navy px-6" @click="saveSettings" :disabled="apiKey.length > 0 && apiKey.length < 11">
            Save Settings
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- Global Alert Snackbars -->
    <v-snackbar v-model="snackbar.show" :timeout="3000" color="#0F172A" location="top" class="neo-border">
      <div class="font-weight-black" :style="{ color: snackbar.textColor }">
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'

useHead({
  title: 'Bill Splitter | AA mou',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Everything also can share share, until it comes to money' },
    { name: 'keywords', content: 'bill splitter, receipt scanner, go dutch, proportional split, split bill, money share' },
    // OpenGraph / Facebook
    { property: 'og:title', content: 'Bill Splitter - AA mou' },
    { property: 'og:description', content: 'Everything also can share share, until it comes to money' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/bill-split-favicon.svg' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Bill Splitter - AA mou' },
    { name: 'twitter:description', content: 'Everything also can share share, until it comes to money' },
    { name: 'twitter:image', content: '/bill-split-favicon.svg' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/bill-split-favicon.svg' },
    { rel: 'apple-touch-icon', href: '/bill-split-favicon.svg' },
    { rel: 'manifest', href: '/manifest.json' }
  ]
})

const showSettings = ref(false)
const apiKey = ref('')

const snackbar = ref({
  show: false,
  text: '',
  textColor: '#00F5D4'
})

const showNotification = (text, isError = false) => {
  snackbar.value.text = text
  snackbar.value.textColor = isError ? '#FF007F' : '#00F5D4'
  snackbar.value.show = true
}

// Provide key and notifications globally
provide('globalApiKey', apiKey)
provide('showNotification', showNotification)

onMounted(() => {
  apiKey.value = localStorage.getItem('gemini_api_key') || ''

  // PWA Service Worker management
  if ('serviceWorker' in navigator) {
    if (import.meta.dev) {
      // In development, automatically unregister active service worker to prevent Vite HMR caching conflicts (MIME type mismatches)
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        let unregisteredAny = false
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              unregisteredAny = true
            }
          })
        }
        if (unregisteredAny) {
          // Clear caches if service worker was unregistered
          caches.keys().then((names) => {
            for (const name of names) caches.delete(name)
          })
        }
      })
    } else {
      // In production, register the service worker
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service worker registered successfully:', reg.scope)
      }).catch((err) => {
        console.error('Service worker registration failed:', err)
      })
    }
  }
})

const saveSettings = () => {
  localStorage.setItem('gemini_api_key', apiKey.value)
  showSettings.value = false
  showNotification('Settings saved successfully!')
}
</script>

<style scoped>
.app-container {
  background-color: var(--color-bg) !important;
}

.neo-header {
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg) !important;
  border-bottom: var(--border-width) solid var(--color-navy) !important;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 2rem;
  margin: 0;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-dark-gray {
  color: var(--color-dark-gray);
}
</style>
