import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    // Headroom for tests that do heavy work under full-suite PARALLEL load
    // (e.g. Modal integration smoke `await import('../Modal')` pulls the whole
    // overlay/presence dep tree; ~1.8s isolated but can exceed the 5s default
    // under CPU/disk contention). 15s still fails a genuine hang. See D-1.
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/index.ts',
        'packages/demo/**',
      ],
    },
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'packages/demo/**',
    ],
  },
  resolve: {
    alias: {
      '@prismui/core': resolve(__dirname, './packages/core/src')
    },
  },
});
