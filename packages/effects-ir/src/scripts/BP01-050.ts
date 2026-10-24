/**
 * BP01-050, a character that pins an opposing character in place when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, 1 of your opponent's
 *   characters in the field can not move in this turn.
 *
 * The script forbids one opposing FIELD character from moving until the end of the turn.
 * A trigger or activated restriction needs a per-turn record in the game state and the share
 * codec; until that record exists the interpreter answers EFFECT_UNSUPPORTED, changes nothing
 * and the card is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, restrict, select } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-050');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
  ],
  rulings: [
    { discussion: '04', rule: asRuleKey('301.18.h') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, restrict(select('opponent', 'FIELD', characters()), 'move'));
}
