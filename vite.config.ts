import { defineConfig } from 'vitest/config';

// Honour PORT so a harness that hands us a free port is obeyed, and so a busy
// 5173 is somebody else's problem rather than ours.
const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  // `host: true` binds every interface rather than just localhost, so the game
  // can be opened from a phone on the same network. Testing a reaction game on
  // a desktop mouse tells you very little; the target is a thumb on glass.
  server: { host: true, port },
  preview: { host: true, port },
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
