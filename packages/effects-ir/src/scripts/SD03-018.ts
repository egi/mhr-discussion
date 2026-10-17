/**
 * SD03-018, a character that trades a RETREAT character for a BATTLE-BASE Move.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】：When the turn ends, you may prune 1 of your characters in RETREAT. If you do, 1
 *   of your characters in the field takes BATTLE-BASE Move once.
 *
 * The script lets the player prune one of their RETREAT characters and, only if that happened,
 * moves one of their field characters between BATTLE and BASE. A card in the BASE
 * moves to a lane the player names, and a card in a lane moves to the BASE; without a lane
 * choice the interpreter answers EFFECT_UNEXECUTABLE and changes nothing.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { battleMove, characters, effect, ifDone, optional, prune, select, sequence, step } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-018');

// 09: RESOLVED (rulebook 304.1 plus head-judge rulings).
// 10: ESCALATE-OPEN. "If you do" after a partly done step runs the next step (Reading A,
// tier: user decision below a head-judge ruling; 301.38.a points the other way).
export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(prune(select('self', 'RETREAT', characters()))),
        ifDone(battleMove(select('self', 'FIELD', characters()))),
      ),
    ),
  );
}
