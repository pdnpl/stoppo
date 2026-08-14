import { defineConfig } from 'vitest/config';

// Honour PORT so a harness that hands us a free port is obeyed, and so a busy
// 5173 is somebody else's problem rather than ours.
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  server: { port },
  preview: { port },
  build: {
    target: 'es2022',
    // The game is a handful of kilobytes; a single chunk beats any preload dance.
    modulePreload: { polyfill: false },
    assetsInlineLimit: 8192,
    reportCompressedSize: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
