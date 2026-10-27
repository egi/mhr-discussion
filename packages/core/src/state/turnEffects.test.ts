import { describe, expect, it } from 'vitest';
import { TURN_EFFECT_KINDS } from './turnEffects';

describe('TURN_EFFECT_KINDS', () => {
  it('is append-only: earlier kinds keep their wire index and effect-used is last', () => {
    expect(TURN_EFFECT_KINDS).toEqual([
      'restriction',
      'ability',
      'second-chance-attack',
      'skip-battle-phase',
      'effect-used',
    ]);
  });
});
