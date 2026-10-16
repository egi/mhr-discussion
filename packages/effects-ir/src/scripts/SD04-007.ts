/**
 * SD04-007, a green Lv2 character that makes a field character take a BATTLE-BASE Move.
 *
 * Printed text (official card):
 *
 *   ACTI【FIELD/ONCE PER TURN】: 1 of your characters in the field takes BATTLE-BASE Move
 *   once.
 *
 * The script has one of the player's field characters take a BATTLE-BASE Move. The interpreter
 * does not run battle-move yet, so the script answers EFFECT_UNSUPPORTED and the card is played
 * by hand. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  battleMove,
  characters,
  effect,
  select,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('304.2.b'), reviewedHash: 'bc71dd561b8a' }, // activation needs resolvable content
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
  ],
  rulings: [  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    battleMove(select('self', 'FIELD', characters())),
  );
}
