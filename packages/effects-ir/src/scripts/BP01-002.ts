/**
 * BP01-002, a red Lv3 character with a COUNTER-ACTI effect.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【HAND】:You discard this card in HAND. If you do, 1 of your opponent's
 *   characters in BATTLE gets Power-2000 in this turn.
 *
 * The script discards its own card, then, only if that happened, lowers one opposing BATTLE
 * character's Power by 2000 until the end of the turn. The COUNTER·ACTI timing and the HAND
 * location are the envelope that decides when the player may invoke it.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  discard,
  effect,
  ifDone,
  power,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-002');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(discard(source())),
      ifDone(power(select('opponent', 'BATTLE', characters()), -2000)),
    ),
  );
}
