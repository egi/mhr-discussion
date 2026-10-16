/**
 * BP01-018, a character that weakens a low-Lv opponent when the board is behind.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, if the number of your
 *   characters in BATTLE is less than your opponent's, 1 of your opponent's characters with
 *   Lv3 or below in BATTLE gets Power-2000 in this turn.
 *
 * The script compares the two sides' BATTLE character counts and, when the controller has
 * fewer, lowers one opposing BATTLE character of Lv3 or below by 2000 Power until the end of
 * the turn.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-018');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'fewer-than-opponent', area: 'BATTLE', filter: characters() },
      power(select('opponent', 'BATTLE', characters({ lvMax: 3 })), -2000),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
