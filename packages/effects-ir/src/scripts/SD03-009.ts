/**
 * SD03-009, a blue Lv3 character that swaps places with a character that won a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your character wins the fight, you may swap this card in
 *   the field and that character.
 *
 * The script swaps this card with the character the trigger pinned down (the one that won the
 * fight). The interpreter does not run swap yet, so the script answers EFFECT_UNSUPPORTED and
 * the card is played by hand. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  effect,
  optional,
  source,
  subject,
  swap,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-009');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(swap(source(), subject())),
  );
}
