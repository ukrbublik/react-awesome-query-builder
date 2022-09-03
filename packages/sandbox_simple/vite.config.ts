import { defineConfig } from 'vite'
import reactSupport from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactSupport()
  ],
  build: {
    sourcemap: true,
    minify: false,
  },
});
