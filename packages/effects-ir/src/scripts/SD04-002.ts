/**
 * SD04-002, a green Lv6 character that mills two cards and weakens an opposing BATTLE character by their Lv.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field, you discard the top 2 cards of your deck.
 *   If you do, 1 of your opponent's characters in BATTLE gets Power-X000. X is the total
 *   value of Lv of the cards you discard by this effect.
 *
 * The script discards the top two cards of the player's DECK and, only if that happened,
 * lowers the Power of one opposing BATTLE character by 1000 for every Lv of the discarded
 * cards, until the end of the turn. A DECK with fewer than two cards cannot satisfy it.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  mill,
  select,
  sequence,
  statMod,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-002');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(mill('self', 'top', 2, 'discard')),
      ifDone(
        statMod(select('opponent', 'BATTLE', characters()), 'power', -1000, 'discarded-lv-total'),
      ),
    ),
  );
}
