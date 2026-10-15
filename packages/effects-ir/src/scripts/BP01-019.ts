/**
 * BP01-019, a character that trades a DECK card for Power when it attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】:When this card attacks, you may discard the top card of
 *   your deck. If you do, this card gets Power+2000 in this turn.
 *
 * The script lets the player discard the top DECK card and, only if that happened, raises
 * this card's Power by 2000 until the end of the turn. The once-per-turn limit belongs to
 * the envelope.
 */

import { asCardNo } from '@mhr/core';
import {
  effect,
  ifDone,
  mill,
  optional,
  power,
  sequence,
  source,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-019');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(sequence(step(mill('self', 'top', 1, 'discard')), ifDone(power(source(), 2000)))),
  );
}
