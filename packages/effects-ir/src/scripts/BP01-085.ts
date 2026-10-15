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

import { asCardNo } from '@mhr/core';
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
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-085');

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
