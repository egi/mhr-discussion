/**
 * BP01-074, a counter that either calls a Lv4 character or recycles one from the RETREAT.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【BACK/ONCE PER TURN】:If the number of your cards in HAND is 4, you place 1
 *   of your characters with Lv4 from HAND into your field, otherwise you move 1 of your
 *   characters from RETREAT back to the bottom of your deck.
 *
 * The script tests for exactly four cards in the HAND. When that holds it places a Lv4
 * character from the HAND into the field; otherwise it moves a RETREAT character to the
 * bottom of the DECK. The field placement names no lane, so that branch takes the player's
 * placement (a free lane or the BASE) and, without one, answers EFFECT_UNEXECUTABLE and
 * changes nothing. The
 * "once per turn" limit is a use limit, not an effect, and is not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  conditional,
  effect,
  relocate,
  select,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-074');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up into field
  ],
  rulings: [
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'HAND', filter: ANY_CARD, min: 4, max: 4 },
      relocate(select('self', 'HAND', characters({ lvMin: 4, lvMax: 4 })), {
        side: 'self',
        area: 'FIELD',
        faceDown: false,
      }),
      relocate(select('self', 'RETREAT', characters()), {
        side: 'self',
        area: 'DECK-BOTTOM',
        faceDown: true,
      }),
    ),
  );
}
