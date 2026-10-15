/**
 * BP01-112, a character that knocks a set card out of the opponent's BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field, you retreat 1 of your opponent's set cards
 *   in BASE.
 *
 * The script retreats one face-down ("set") card from the opponent's BASE into their
 * RETREAT. With no set card there, the effect cannot run.
 */

import { asCardNo } from '@mhr/core';
import { ANY_CARD, effect, retreat, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-112');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    retreat(select('opponent', 'BASE', { ...ANY_CARD, faceDown: true })),
  );
}
