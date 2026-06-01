import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'neubrutalism',
      themes: {
        neubrutalism: {
          dark: false,
          colors: {
            background: '#FFE600',
            surface: '#FFFFFF',
            primary: '#f6339a',
            secondary: '#00F5D4',
            error: '#f6339a',
            info: '#00F5D4',
            success: '#00F5D4',
            warning: '#FFE600',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
