import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: './client-entry.ts',
      formats: ['iife'],
      name: 'growiPluginLoginMessage',
      fileName: () => 'plugin.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
