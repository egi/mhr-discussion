/**
 * BP01-053, a character that hits harder against a high-Lv target.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】：When this card attacks, if its target is the character with Lv4 or above,
 *   this card gets Power+1500 in this turn.
 *
 * The script tests the attack target (the subject) for Lv4 or above and, if so, raises this
 * card's Power by 1500 until the end of the turn. The invoker names the target as the
 * subject.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, power, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-053');

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
      { kind: 'subject-matches', filter: characters({ lvMin: 4 }) },
      power(source(), 1500),
    ),
    trigger('attacks', 'BATTLE'),
  );
}
