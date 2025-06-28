import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // for compatibility with most hosting platforms
  },
  server: {
    port: 3000,
  },
});
