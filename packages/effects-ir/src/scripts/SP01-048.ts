/**
 * SP01-048, a blue Lv3 UNIQUE counter that retreats a Human character to draw.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   COUNTER·ACTI【BASE/ONCE PER TURN】:You retreat 1 of your characters with 【Human】 in their
 *   features on the field. If you do, you draw 1 card.
 *
 * UNIQUE is an ability keyword, not an effect, so the script is the COUNTER·ACTI line only. It
 * retreats one Human character from the player's field and, only if that happened, draws one
 * card. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  draw,
  effect,
  ifDone,
  retreat,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-048');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'FIELD', characters({ feature: 'Human' })))),
      ifDone(draw('self', 1)),
    ),
  );
}
