import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: '/prismui/dashboard/',
  resolve: {
    alias: {
      '@prismui/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@prismui/react': path.resolve(__dirname, '../../packages/react/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
});