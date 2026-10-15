/**
 * SD04-011, a green Lv4 character that sets a BATTLE character's R to 2.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:The R of 1 of your characters in BATTLE changes to 2 in this
 *   turn.
 *
 * The script sets the R of one of the player's BATTLE characters to 2 until the end of the
 * turn. The interpreter records that as a change (a `set` modifier), which ends any earlier
 * modifier on the same card's R. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  characters,
  effect,
  select,
  statSet,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-011');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    statSet(select('self', 'BATTLE', characters()), 'r', 2),
  );
}
