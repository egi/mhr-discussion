/**
 * Registry behaviour, plus the plain-Node smoke check the coverage build depends on.
 *
 * The same calls must work outside Vitest. Run from the repository root:
 *
 *   pnpm exec tsx -e "import('./packages/engine/src/effects/registry.ts').then(m => console.log(m.scriptedCardNumbers(), typeof m.cardScript('BP01-005')))"
 */
import { describe, expect, it } from 'vitest';
import { asCardNo } from '@mhr/core';
import { cardScript, scriptedCardNumbers } from './registry';

// `import.meta.glob` is Vite-only and the engine's tsconfig carries no Vite types, so the
// call is cast. It is used here only to compare the manifest against the files on disk.
const files = (
  import.meta as unknown as { glob(pattern: string): Record<string, unknown> }
).glob('./scripts/*.ts');

describe('card-script registry', () => {
  it('resolves an authored script', () => {
    const script = cardScript(asCardNo('BP01-005'));
    expect(script).toBeTypeOf('function');
    expect(script?.().cardNo).toBe('BP01-005');
  });

  it('returns undefined, without throwing, for an unscripted card', () => {
    expect(() => cardScript(asCardNo('BP01-999'))).not.toThrow();
    expect(cardScript(asCardNo('BP01-999'))).toBeUndefined();
  });

  it('enumerates exactly the scripts on disk', () => {
    const onDisk = Object.keys(files)
      .map((path) => /([^/]+)\.ts$/.exec(path)?.[1])
      .filter((name): name is string => name !== undefined && name !== 'index');
    expect([...scriptedCardNumbers()].sort()).toEqual(onDisk.sort());
  });
});
