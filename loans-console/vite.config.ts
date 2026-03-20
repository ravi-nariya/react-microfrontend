import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  server: {
    port: 3001,
    strictPort: true,
  },
  plugins: [
    react(),
    federation({
      name: 'loans',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    assetsDir: '',
  },
});
