/**
 * PB01-005, a Gamora that joins the field from the HAND once two Guardians stand in the BATTLE.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:If you have 2 or more characters with 【GOTG】 in their features in BATTLE, you
 *   place this card from HAND into your field.
 *
 * An activation from the HAND. When the player has at least two characters with GOTG in their
 * features in the BATTLE (the BASE and the opposing side do not count; this card is in the HAND
 * and so is not one of them), this card is placed face up into the field; the interpreter takes
 * the lane or the BASE the player chooses (`EffectInvocation.placement`). With fewer than two,
 * nothing happens. No community ruling touches this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('302.2.a'), reviewedHash: '34c5cf52cc7d' }, // BATTLE area
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'BATTLE', filter: characters({ feature: 'GOTG' }), min: 2, max: null },
      relocate(source(), { side: 'self', area: 'FIELD', faceDown: false }),
    ),
    trigger('activate', 'HAND'),
  );
}
