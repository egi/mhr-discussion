/**
 * SD03-005, a blue Lv2 character that takes a set BASE card back into the HAND.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】: When this card takes BATTLE-BASE Move, you may move 1 of your
 *   set cards from BASE back to your HAND.
 *
 * The script lets the player move one face-down card from their BASE back to their HAND, where
 * it lands face up. A BASE with no set card cannot satisfy it. The BATTLE-BASE Move trigger and
 * the once-per-turn limit are the envelope and a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  effect,
  optional,
  relocate,
  select,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      relocate(select('self', 'BASE', { ...ANY_CARD, faceDown: true }), {
        side: 'self',
        area: 'HAND',
        faceDown: false,
      }),
    ),
  );
}
