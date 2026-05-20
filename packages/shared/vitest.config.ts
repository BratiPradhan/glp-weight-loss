import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/evaluator/**', 'src/engine/**'],
      thresholds: {
        branches: 78,
        functions: 100,
        lines: 90,
        statements: 88,
      },
    },
  },
});
