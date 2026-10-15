/**
 * BP01-109, a character that makes the opponent stock their own BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field, your opponent places 1 of their cards from
 *   HAND face down into your opponent's BASE.
 *
 * The script moves one card from the opponent's HAND face down into the opponent's BASE. The
 * opponent chooses the card; the invoker passes that choice as a pick.
 */

import { asCardNo } from '@mhr/core';
import { ANY_CARD, effect, relocate, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-109');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('opponent', 'HAND', ANY_CARD), {
      side: 'opponent',
      area: 'BASE',
      faceDown: true,
    }),
  );
}
