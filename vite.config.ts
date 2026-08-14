import { defineConfig } from 'vitest/config';

export default defineConfig({
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
