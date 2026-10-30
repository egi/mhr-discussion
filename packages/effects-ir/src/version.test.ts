import { describe, expect, it } from 'vitest';
import { EffectIRSchema } from './schema';
import { EFFECT_RULES_REVISION, EFFECT_RULES_VERSION } from './version';
import { effect, draw } from './combinators';
import { SYNTHETIC_CARDS } from './fixtures/synthetic-cards';

describe('rules version', () => {
  it('is the revision plus the script generation suffix, and the revision stays 1.03', () => {
    expect(String(EFFECT_RULES_REVISION)).toBe('1.03');
    expect(EFFECT_RULES_VERSION).toBe(`${String(EFFECT_RULES_REVISION)}+17.2`);
  });

  it('stamps every effect() with the version, not the bare revision', () => {
    const card = SYNTHETIC_CARDS[0]!;
    expect(effect(card.cardNo, draw('self', 1)).rulesVersion).toBe(EFFECT_RULES_VERSION);
    expect(effect(card.cardNo, draw('self', 1)).rulesVersion).not.toBe(String(EFFECT_RULES_REVISION));
  });

  it('refuses the previous generation stamp as no longer equal to the constant', () => {
    const card = SYNTHETIC_CARDS[0]!;
    const old = { ...effect(card.cardNo, draw('self', 1)), rulesVersion: `${String(EFFECT_RULES_REVISION)}+17.1` };
    expect(old.rulesVersion).not.toBe(EFFECT_RULES_VERSION);
    expect(EFFECT_RULES_VERSION.endsWith('+17.2')).toBe(true);
  });

  it('lets an IR carry a different revision while no longer equalling the constant', () => {
    const card = SYNTHETIC_CARDS[0]!;
    const stale = { ...effect(card.cardNo, draw('self', 1)), rulesVersion: '0.01' };
    expect(EffectIRSchema.safeParse(stale).success).toBe(true);
    expect(stale.rulesVersion).not.toBe(EFFECT_RULES_VERSION);
  });
});
