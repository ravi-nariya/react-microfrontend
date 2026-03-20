import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ command }) => {
  // Remotes serve remoteEntry.js at their root (assetsDir is '' on both remote builds)
  const remoteEntryPath = '/remoteEntry.js';
  void command;

  return {
    server: {
      port: 3000,
      strictPort: true,
    },
    plugins: [
      react(),
      federation({
        name: 'coreBankingSystem',
        remotes: {
          loans: `http://localhost:3001${remoteEntryPath}`,
          investments: `http://localhost:3002${remoteEntryPath}`,
        },
        shared: ['react', 'react-dom'],
      }),
    ],
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
  };
});
