import { describe, expect, it } from 'vitest';

import { AUTO_FORMS, isAutoStatEffect } from './auto';
import type { AutoAnyEffect } from './auto';
import { characters } from './combinators';

describe('AUTO forms', () => {
  it('keeps the form names append-only', () => {
    expect(AUTO_FORMS).toEqual(['grant', 'restrict', 'lose-effects', 'reduce', 'distance-set']);
  });

  it('reads an effect with no form (every script written before the forms existed) as a stat change', () => {
    const plain: AutoAnyEffect = {
      locations: ['FIELD'],
      condition: { kind: 'always' },
      target: { kind: 'self' },
      stat: 'power',
      change: { kind: 'add', delta: 1000 },
      clause: 0,
    };
    expect(isAutoStatEffect(plain)).toBe(true);
    expect(isAutoStatEffect({ ...plain, form: 'stat' })).toBe(true);
  });

  it('reads every other form as not a stat change', () => {
    const grant: AutoAnyEffect = {
      form: 'grant',
      locations: ['HAND'],
      condition: { kind: 'only', side: 'self', area: 'BATTLE', filter: characters(), count: null, thisCard: false },
      target: { kind: 'self' },
      ability: 'COUNTER',
      clause: 0,
    };
    expect(isAutoStatEffect(grant)).toBe(false);
  });
});
