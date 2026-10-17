/**
 * BP01-014, a Machine character that retreats a low-Lv opposing character when another Ultron
 * stands in the field.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, if you have the characters with
 *   【Ultron】 in their names in the field except this card, you may retreat 1 of your
 *   opponent's characters with Lv3 or below in BATTLE.
 *
 * The script is the effect after the trigger: when the controller has a character with Ultron in
 * its name in the field other than this card, it retreats one opposing BATTLE character of Lv3 or
 * below. "Characters" is read as at least one. The name test is a substring match on the card's
 * name (201.7.b: a name is all the text in it), ignoring case.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, optional, retreat, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-014');

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
        filter: characters({ nameIncludes: 'ULTRON', exceptSource: true }),
        min: 1,
        max: null,
      },
      optional(retreat(select('opponent', 'BATTLE', characters({ lvMax: 3 })))),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
