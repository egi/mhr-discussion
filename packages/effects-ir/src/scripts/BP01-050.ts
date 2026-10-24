/**
 * BP01-050, a character that pins an opposing character in place when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, 1 of your opponent's
 *   characters in the field can not move in this turn.
 *
 * The script forbids one opposing FIELD character from moving until the end of the turn. The
 * interpreter records the restriction for the turn on the controller (the per-turn record), so a
 * BATTLE move, a BATTLE-BASE move and a swap of that character are refused until the End Phase.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, restrict, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-050');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
  ],
  rulings: [
    { discussion: '04', rule: asRuleKey('301.18.h') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, restrict(select('opponent', 'FIELD', characters()), 'move'), trigger('enters-field-by-call', 'FIELD'));
}
