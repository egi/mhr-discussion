/**
 * SD02-005, a BASE ability that mills for a draw and then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】：You discard the top 3 cards of your deck. If you do, you draw
 *   1 card, and cover this card.
 *
 * The script discards the top three DECK cards and, only if that happened, draws one card
 * and covers this card. Covering is an op the interpreter does not run yet, so applying
 * this script today answers EFFECT_UNSUPPORTED, changes nothing, and the card is played by
 * hand. The "once per turn" limit is a use limit, not an effect, and is not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  cover,
  draw,
  effect,
  ifDone,
  mill,
  sequence,
  source,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-005');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(mill('self', 'top', 3, 'discard')),
      ifDone(draw('self', 1)),
      ifDone(cover(source())),
    ),
  );
}
