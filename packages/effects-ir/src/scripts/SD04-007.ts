/**
 * SD04-007, a green Lv2 character that makes a field character take a BATTLE-BASE Move.
 *
 * Printed text (official card):
 *
 *   ACTI【FIELD/ONCE PER TURN】: 1 of your characters in the field takes BATTLE-BASE Move
 *   once.
 *
 * The script has one of the player's field characters take a BATTLE-BASE Move. The interpreter
 * does not run battle-move yet, so the script answers EFFECT_UNSUPPORTED and the card is played
 * by hand. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo } from '@mhr/core';
import {
  battleMove,
  characters,
  effect,
  select,
} from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-007');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    battleMove(select('self', 'FIELD', characters())),
  );
}
