import { describe, expect, it } from 'vitest';
import { TURN_EFFECT_KINDS, TURN_RESTRICTIONS, TURN_RESTRICTION_DIRECTIONS } from './turnEffects';

describe('TURN_EFFECT_KINDS', () => {
  it('is append-only: earlier kinds keep their wire index and restriction-limit is last', () => {
    expect(TURN_EFFECT_KINDS).toEqual([
      'restriction',
      'ability',
      'second-chance-attack',
      'skip-battle-phase',
      'effect-used',
      'defended',
      'battle-base-moved',
      'placed-this-turn',
      'restriction-limit',
    ]);
  });
});

describe('TURN_RESTRICTIONS and TURN_RESTRICTION_DIRECTIONS', () => {
  it('are append-only', () => {
    expect(TURN_RESTRICTIONS).toEqual(['move', 'attack', 'retreat-to-call']);
    expect(TURN_RESTRICTION_DIRECTIONS).toEqual(['at-least', 'at-most', 'exact']);
  });
});
