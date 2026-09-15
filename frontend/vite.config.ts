import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the approved sign-in artwork inside the production JS bundle so it
    // cannot disappear because of a separate static-asset path/runtime fetch.
    // The reference JPG is ~15 KB, so this threshold intentionally inlines it.
    assetsInlineLimit: 20_000
  },
  server: {
    proxy: {
      '/actuator': 'http://127.0.0.1:8080',
      '/api': 'http://127.0.0.1:8080'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100
      }
    }
  }
});
