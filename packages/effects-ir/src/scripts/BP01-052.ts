/**
 * BP01-052 「Nemesis」Hulk Buster, a Lv2 Machine that places itself into the field from the HAND
 * when a big Machine arrives.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:Your character with Lv4 or above and 【Machine】 in its feature enters the field,
 *   if you have no characters with 【Hulk Buster】 in their names, you may place this card from
 *   HAND into your field.
 *
 * The trigger tag is `own-character-enters-field` from the HAND, narrowed to a character of
 * printed Lv4 or above with the Machine feature (the `levelAtLeast` and `feature` subject
 * filters). A HAND trigger needs no declaration and a card drawn at the same timing still
 * triggers (304.1.g.2, 304.1.k; discussion 18, HEAD-JUDGE, RESOLVED by rulebook 304.1.k). The
 * condition is the controller's own field (BATTLE and BASE) holding no character with Hulk Buster
 * in its name; a Hulk Buster of the opponent does not count, and neither does one in the HAND.
 * With the condition false nothing happens. The placement is optional (304.1.a): this card is
 * put face up into the field (301.12.a), into the lane the player picks.
 *
 * The entering Machine itself counts: if it is a Hulk Buster (SD01-009), the condition is false.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, optional, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-052');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.g.2'), reviewedHash: '107585942132' }, // HAND triggers need no declaration
    { key: asRuleKey('304.1.k'), reviewedHash: '1c37c93f925c' }, // a card now in HAND still triggers
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up into the field
  ],
  rulings: [{ discussion: '18', rule: asRuleKey('304.1.k') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      {
        kind: 'have',
        side: 'self',
        area: 'FIELD',
        filter: characters({ nameIncludes: 'Hulk Buster' }),
        min: 0,
        max: 0,
      },
      optional(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
    ),
    trigger('own-character-enters-field', 'HAND', undefined, { levelAtLeast: 4, feature: 'Machine' }),
  );
}
