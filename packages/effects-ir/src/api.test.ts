import { describe, expect, it } from 'vitest';
import { asCardNo } from '@mhr/core';
import * as barrel from './index';
import { cardScript, scriptedCardNumbers } from './registry';

describe('consumer API', () => {
  it('returns undefined, without throwing, for an unscripted number', () => {
    expect(() => cardScript(asCardNo('BP01-999'))).not.toThrow();
    expect(cardScript(asCardNo('BP01-999'))).toBeUndefined();
  });

  it('lists scripted numbers sorted ascending, without duplicates', () => {
    const numbers = scriptedCardNumbers();
    expect(numbers.length).toBeGreaterThanOrEqual(43);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect([...numbers]).toEqual([...numbers].sort());
  });

  it('resolves every listed number', () => {
    for (const n of scriptedCardNumbers()) expect(cardScript(n)).toBeTypeOf('function');
  });

  it('exports the registry and builder surface from the barrel', () => {
    expect(barrel.cardScript).toBe(cardScript);
    expect(barrel.scriptedCardNumbers).toBe(scriptedCardNumbers);
    expect(barrel.effect).toBeTypeOf('function');
  });
});
