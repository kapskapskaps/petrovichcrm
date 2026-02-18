
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Support process.env.API_KEY as used in the code
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
