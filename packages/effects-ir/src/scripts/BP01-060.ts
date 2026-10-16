/**
 * BP01-060, a character that weakens the opposing FRONT character when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, your opponent's character in
 *   FRONT gets Power-1000 in this turn.
 *
 * The script lowers the Power of the opposing character in the FRONT lane by 1000 until the
 * end of the turn. With no opposing FRONT character there is nothing to lower and the effect
 * cannot run.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, power, select } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-060');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor is zero
    { key: asRuleKey('301.16.a.1'), reviewedHash: 'bff4b407369d' }, // zero power retreats character
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, power(select('opponent', 'FRONT', characters()), -1000));
}
