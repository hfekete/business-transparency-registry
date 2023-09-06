// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    strict: true
  },
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'nuxt-vitest',
  ],
  eslint: {
    /* module options */
  },
  stylelint: {
    /* module options */
  },
  pinia: {
    /* pinia module options */
  },
})
