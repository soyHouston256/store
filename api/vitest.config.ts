import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['src/test/env.ts'],
    // mongodb-memory-server may download a mongod binary on first run
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
