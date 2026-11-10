/**
 * SP01-057, a Lv2 Human in the HAND that discards itself to retreat an opposing Lv2 Human that
 * just entered the field.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your opponent's character with Lv2 and 【Human】 in its feature enters the
 *   field, you may discard this card in HAND. If you do, you retreat that character.
 *
 * Event tag: opponent-character-enters-field, HAND, subject Human and printed Lv2. The trigger is
 * optional (304.1.a): declining leaves the card in the HAND. Discarding this card from the HAND
 * is the cost (301.15.a); only if that was done is the entered character (the pinned subject)
 * retreated. A Lv3 Human, a Lv2 character without Human, and a character entering on the own
 * side do not fire. The Lv test uses the printed Lv (effective-power-lv-basis is UNRULED).
 * Related community reading, cited by path only (not on the pinned board):
 * .planning/research/community-rulings/discussions/29-black-cat-vs-crowds-of-the-hand.md
 * (CONSENSUS tier).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { discard, effect, ifDone, optional, retreat, sequence, source, step, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-057');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard places the card in RETREAT
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(sequence(step(discard(source())), ifDone(retreat(subject())))),
    trigger('opponent-character-enters-field', 'HAND', undefined, { feature: 'Human', level: 2 }),
  );
}
