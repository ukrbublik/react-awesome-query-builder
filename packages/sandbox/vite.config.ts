import { defineConfig } from 'vite'
import reactSupport from '@vitejs/plugin-react'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    //reactRefresh()
    reactSupport()
  ],
  build: {
    sourcemap: true,
    minify: false,
  },
});
