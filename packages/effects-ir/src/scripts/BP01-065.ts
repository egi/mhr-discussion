/**
 * BP01-065, a character that stocks the BASE when it loses a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:This card enters RETREAT by losing the fight, you place the top 2 cards of
 *   your deck face down into your BASE.
 *
 * The script is the effect after the trigger: the top two DECK cards go face down into the
 * BASE. A DECK with fewer than two cards cannot satisfy it.
 */

import { asCardNo } from '@mhr/core';
import { ANY_CARD, effect, relocate, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-065');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('self', 'DECK', ANY_CARD, 2), { side: 'self', area: 'BASE', faceDown: true }),
  );
}
