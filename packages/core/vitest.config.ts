import { defineProject } from 'vitest/config';

/** The core project, named uniquely so the root config can address it. */
export default defineProject({
  test: {
    name: 'core',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
