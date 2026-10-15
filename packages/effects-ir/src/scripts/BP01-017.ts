/**
 * BP01-017, a character that feeds on the opponent's RETREAT.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may prune 1 of your
 *   opponent's characters in RETREAT. If you do, this card gets Power+1000 in this turn.
 *
 * The script lets the player prune one character from the opponent's RETREAT and, only if
 * that happened, raises this card's Power by 1000 until the end of the turn.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  power,
  prune,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-017');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(prune(select('opponent', 'RETREAT', characters()))),
        ifDone(power(source(), 1000)),
      ),
    ),
  );
}
