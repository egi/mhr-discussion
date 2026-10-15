/**
 * BP01-118, a character that loots when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card takes BATTLE-BASE Move, you draw 1 card. If you do, you
 *   discard 1 of your cards in HAND.
 *
 * The script draws one card and, only if that happened, discards one card from the HAND.
 */

import { asCardNo } from '@mhr/core';
import {
  ANY_CARD,
  discard,
  draw,
  effect,
  ifDone,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-118');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(step(draw('self', 1)), ifDone(discard(select('self', 'HAND', ANY_CARD)))),
  );
}
