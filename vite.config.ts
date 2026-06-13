import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: ['/client-entry.ts'],
      output: {
        entryFileNames: 'client-entry.js',
      },
    },
  },
});
