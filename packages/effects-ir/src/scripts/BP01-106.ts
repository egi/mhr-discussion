/**
 * BP01-106, a character that swaps a green HAND character for two cards when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may discard 1 of your green
 *   characters in HAND. If you do, you draw 2 cards.
 *
 * The script lets the player discard one green character from the HAND and, only if that
 * happened, draws two cards.
 */

import { asCardNo } from '@mhr/core';
import {
  colored,
  discard,
  draw,
  effect,
  ifDone,
  optional,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-106');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(discard(select('self', 'HAND', colored('green')))),
        ifDone(draw('self', 2)),
      ),
    ),
  );
}
