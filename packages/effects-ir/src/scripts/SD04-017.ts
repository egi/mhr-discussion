/**
 * SD04-017, a character that weakens an opposing BATTLE character when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card takes BATTLE-BASE Move, 1 of your opponent's characters in
 *   BATTLE gets Power-1000 in this turn.
 *
 * Event tag: base-move, FIELD. One opposing BATTLE character gets Power-1000 until the end of the
 * turn; with none in BATTLE nothing happens.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-017');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    power(select('opponent', 'BATTLE', characters()), -1000),
    trigger('base-move', 'FIELD'),
  );
}
