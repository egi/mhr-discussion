/**
 * SD03-008, a blue Lv6 character that retreats a set BASE card to boost a BATTLE character.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/TWICE PER TURN】:You retreat 1 of your set cards in BASE.If you do, 1 of your
 *   characters in BATTLE gets Power+500 in this turn.
 *
 * The script retreats one face-down card from the player's BASE and, only if that happened,
 * raises the Power of one of their BATTLE characters by 500 until the end of the turn. The
 * twice-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  effect,
  ifDone,
  power,
  retreat,
  select,
  sequence,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-008');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'BASE', { ...ANY_CARD, faceDown: true }))),
      ifDone(power(select('self', 'BATTLE', characters()), 500)),
    ),
  );
}
