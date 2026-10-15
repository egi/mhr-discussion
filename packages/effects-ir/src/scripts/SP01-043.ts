/**
 * SP01-043, a blue Lv4 counter that discards a card to place an Archenemy character.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【BACK/ONCE PER TURN】:You discard 1 of your cards in HAND. If you do, you may
 *   place 1 of your characters with 【Archenemy】 in their features from HAND onto your
 *   BATTLE.
 *
 * The script discards one HAND card and, only if that happened, lets the player place an
 * Archenemy character from the HAND onto the BATTLE. Placing into the BATTLE names no lane,
 * which the interpreter does not run yet, so the script answers EFFECT_UNSUPPORTED, and the
 * card is played by hand. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  relocate,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-043');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(discard(select('self', 'HAND', ANY_CARD))),
      ifDone(
        optional(
          relocate(select('self', 'HAND', characters({ feature: 'Archenemy' })), {
            side: 'self',
            area: 'BATTLE',
            faceDown: false,
          }),
        ),
      ),
    ),
  );
}
