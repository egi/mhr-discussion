/**
 * BP01-005, a red character with a TRIG【HAND】 effect.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your red character attacks, you may discard this card in HAND. If you
 *   do, 1 of your red characters in BATTLE gets Power+3000 in this turn.
 *
 * The script is the effect after the trigger: an optional discard of this card, then, only if
 * the discard happened, Power+3000 for one red character in BATTLE until the end of the turn.
 * "When your red character attacks" is the envelope that decides when the player may invoke
 * the script, and it is not an op.
 */

import { asCardNo } from '@mhr/core';
import {
  colored,
  discard,
  effect,
  ifDone,
  optional,
  power,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-005');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(discard(source())),
        ifDone(power(select('self', 'BATTLE', colored('red')), 3000)),
      ),
    ),
  );
}
