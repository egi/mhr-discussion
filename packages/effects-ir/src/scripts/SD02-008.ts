/**
 * SD02-008, a BASE ability that raises a BATTLE character's R and then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】:1 of your characters in BATTLE gets R+1 in this turn. If you
 *   do, cover this card.
 *
 * The script raises the R of one of the controller's BATTLE characters by 1 until the end
 * of the turn and, only if that happened, covers this card. Covering is an op the
 * interpreter does not run yet, so applying this script today answers EFFECT_UNSUPPORTED,
 * changes nothing, and the card is played by hand. The "once per turn" limit is a use
 * limit, not an effect, and is not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  cover,
  effect,
  ifDone,
  select,
  sequence,
  source,
  statMod,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-008');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(statMod(select('self', 'BATTLE', characters()), 'r', 1)),
      ifDone(cover(source())),
    ),
  );
}
