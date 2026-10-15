/**
 * SD01-007, a character that pays a card to weaken a mid-Lv opposing BATTLE character.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may discard 1 of your cards
 *   in HAND. If you do, 1 of your opponent's characters with Lv5 or below in BATTLE gets
 *   Power-2000 in this turn.
 *
 * The script lets the player discard one HAND card and, only if that happened, lowers the
 * Power of an opposing BATTLE character of Lv5 or below by 2000 until the end of the turn.
 */

import { asCardNo } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  power,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-007');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(discard(select('self', 'HAND', ANY_CARD))),
        ifDone(power(select('opponent', 'BATTLE', characters({ lvMax: 5 })), -2000)),
      ),
    ),
  );
}
