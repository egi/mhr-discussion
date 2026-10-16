/**
 * BP01-085, a character that trades a RETREAT character for a BATTLE-BASE Move.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】：When the turn ends, you may prune 1 of your characters in RETREAT. If you
 *   do, 1 of your characters in the field takes BATTLE-BASE Move once.
 *
 * The script lets the player prune one of their RETREAT characters and, only if that
 * happened, moves one of their field characters between BATTLE and BASE. The move is an op
 * the interpreter does not run yet, so applying this script today answers
 * EFFECT_UNSUPPORTED, changes nothing, and the card is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  battleMove,
  characters,
  effect,
  ifDone,
  optional,
  prune,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-085');

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
