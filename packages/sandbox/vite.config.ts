import { defineConfig } from 'vite'
import reactSupport from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  server: {
    host: true,
    port: 5175,
    allowedHosts: ['.csb.app', '.github.dev'],
  },
  plugins: [
    reactSupport()
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      // https://github.com/vitejs/vite/issues/15012
      onwarn(warning, defaultHandler) {
        if (warning.code === 'SOURCEMAP_ERROR') {
          return
        }

        defaultHandler(warning)
      },
    },
    minify: false,
  },
});
