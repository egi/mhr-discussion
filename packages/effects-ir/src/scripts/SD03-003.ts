/**
 * SD03-003, a blue Lv4 character that swaps itself for an Avengers HAND character after a BATTLE-BASE Move.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card takes BATTLE-BASE Move, you may place 1 of your characters
 *   with 【Avengers】 in their features from HAND onto your BATTLE. If you do, you retreat
 *   this card.
 *
 * The script lets the player place an Avengers character from the HAND onto the BATTLE and,
 * only if that happened, retreats the card itself. Placing into the BATTLE names no lane, which
 * the interpreter does not run yet, so the whole script answers EFFECT_UNSUPPORTED and the card
 * is played by hand. The BATTLE-BASE Move trigger is the envelope that decides when it may run.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  relocate,
  retreat,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-003');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(
          relocate(select('self', 'HAND', characters({ feature: 'Avengers' })), {
            side: 'self',
            area: 'BATTLE',
            faceDown: false,
          }),
        ),
        ifDone(retreat(source())),
      ),
    ),
  );
}
