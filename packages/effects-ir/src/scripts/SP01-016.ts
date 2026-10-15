/**
 * SP01-016, a red Lv6 character that raises its own R and weakens an opposing field character.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】:When the number of your cards in BASE increases, this card
 *   gets R+1 this turn and 1 of your opponent's characters on the field gets Power-500 this
 *   turn.
 *
 * The script raises the R of this card by 1 and lowers the Power of one opposing field
 * character by 500, both until the end of the turn. They are independent: neither is gated on
 * the other. With no opposing field character the second cannot run, so the whole script is
 * unexecutable. The "number of cards in BASE increases" trigger and the once-per-turn limit are
 * the envelope and a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  effect,
  power,
  select,
  sequence,
  source,
  statMod,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-016');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(statMod(source(), 'r', 1)),
      step(power(select('opponent', 'FIELD', characters()), -500)),
    ),
  );
}
