/**
 * BP01-103, a Winter Soldier that shoves the opposing FRONT character to the BACK when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card takes BATTLE-BASE Move, you may move your opponent's character
 *   from FRONT to your opponent's BACK.
 *
 * The trigger tag is `base-move` from the FIELD: it fires when this card itself moves between a
 * BATTLE area and the BASE (301.24.a), in either direction, and not for another card's move or a
 * BASE-to-BASE rearrangement. The move is optional (304.1.a). The script moves the opponent's
 * FRONT character to the opponent's BACK (a BATTLE MOVE, 301.23.b), face up; with no FRONT
 * character, or with the BACK already occupied, nothing moves.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-103');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.23.b'), reviewedHash: 'bd6926cc49cb' }, // an effect's move between BATTLE areas is a BATTLE MOVE
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      relocate(select('opponent', 'FRONT', characters()), {
        side: 'opponent',
        area: 'BACK',
        faceDown: false,
      }),
    ),
    trigger('base-move', 'FIELD'),
  );
}
