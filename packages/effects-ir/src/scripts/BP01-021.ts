/**
 * BP01-021, a character that digs the DECK for a Human when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you show the top 3 cards of
 *   your deck, add 1 of them with 【Human】 in their features to your HAND and discard the
 *   rest.
 *
 * The script digs the top three DECK cards for one with the Human feature and discards the
 * rest. The interpreter does not run the dig op yet, so applying this script today answers
 * EFFECT_UNSUPPORTED and the card is played by hand.
 */

import { asCardNo } from '@mhr/core';
import { ANY_CARD, dig, effect } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-021');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, dig('self', 3, { ...ANY_CARD, feature: 'Human' }, 'discard'));
}
