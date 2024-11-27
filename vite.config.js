import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import vuetify from 'vite-plugin-vuetify'; // Vuetify plugin for Vite

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    vuetify(), // Ensure Vuetify is included here
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `@import "@/styles/variables.sass"`, // Optional: Automatically include global SASS files
      },
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // Optional: Automatically include global SCSS files
      },
    },
  },
});
