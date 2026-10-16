/**
 * EB01-008, a character that grows with the characters in the VOID when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When this card takes BATTLE-BASE Move, this card gets
 *   Power+X000 in this turn. X is the number of your characters in VOID.
 *
 * The script raises this card's Power by 1000 for each character in the controller's VOID
 * until the end of the turn. With no characters there the bonus is zero and nothing changes.
 * The "once per turn" limit is a use limit, not an effect, and is not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, source, statMod } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-008');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, statMod(source(), 'power', 1000, 'characters-in-void'));
}
