/**
 * BP01-022, a card that retreats a low-Lv opposing character with an AUTO effect.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, if you have the characters with
 *   【Avengers】 in their features in the field except this card, you may retreat 1 of your
 *   opponent's characters with Lv3 or below and 【AUTO】 in their effects in the field.
 *
 * The condition counts another own Avengers character in the FIELD (`have`, this card does not
 * count). The retreat is optional (304.1.a); the opposing character must be Lv3 or below and carry
 * a printed AUTO effect (`hasAutoEffect`, a printed text fact). Without the condition, or without
 * such a target, nothing happens.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, optional, retreat, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-022');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat a character
  ],
  rulings: [],
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
        filter: characters({ feature: 'Avengers', exceptSource: true }),
        min: 1,
        max: null,
      },
      optional(retreat(select('opponent', 'FIELD', characters({ lvMax: 3, hasAutoEffect: true })))),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
