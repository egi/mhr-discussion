import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'effects-ir',
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
