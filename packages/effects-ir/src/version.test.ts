import { describe, expect, it } from 'vitest';
import { EffectIRSchema } from './schema';
import { EFFECT_RULES_REVISION, EFFECT_RULES_VERSION } from './version';
import { effect, draw } from './combinators';
import { SYNTHETIC_CARDS } from './fixtures/synthetic-cards';

describe('rules version', () => {
  it('is a non-empty string equal to the revision', () => {
    expect(EFFECT_RULES_VERSION.length).toBeGreaterThan(0);
    expect(EFFECT_RULES_VERSION).toBe(String(EFFECT_RULES_REVISION));
  });

  it('lets an IR carry a different revision while no longer equalling the constant', () => {
    const card = SYNTHETIC_CARDS[0]!;
    const stale = { ...effect(card.cardNo, draw('self', 1)), rulesVersion: '0.01' };
    expect(EffectIRSchema.safeParse(stale).success).toBe(true);
    expect(stale.rulesVersion).not.toBe(EFFECT_RULES_VERSION);
  });
});
