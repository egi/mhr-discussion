/**
 * BP01-020, a character that recycles its own RETREAT into a draw.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you prune 1 of your red
 *   characters in RETREAT. If you do, you draw 1 card.
 *
 * The script prunes one red character from the controller's RETREAT and, only if that
 * happened, draws one card.
 */

import { asCardNo } from '@mhr/core';
import {
  colored,
  draw,
  effect,
  ifDone,
  prune,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-020');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(step(prune(select('self', 'RETREAT', colored('red')))), ifDone(draw('self', 1))),
  );
}
