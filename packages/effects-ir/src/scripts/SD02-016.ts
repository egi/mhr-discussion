/**
 * SD02-016, a character that gains ASSAULT when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】：When this card enters the field by calling, this card gets the ability
 *   【ASSAULT】(AUTO【BATTLE】: If this card wins the fight by attacking, this card attacks the
 *   weakness successfully） in this turn.
 *
 * The script gives this card the ASSAULT ability until the end of the turn. The interpreter
 * records the grant for the turn on the controller (the per-turn record), and the battle rules
 * read it like a printed ASSAULT. It has the same
 * text and the same script as BP01-059.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, grantAbility, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-016');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('305.4.a'), reviewedHash: 'c1de4889c0ff' }, // ASSAULT
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, grantAbility(source(), 'ASSAULT'), trigger('enters-field-by-call', 'FIELD'));
}
