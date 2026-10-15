/**
 * BP01-114, a character that weakens an opposing BATTLE character when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card takes BATTLE-BASE Move, 1 of your opponent's characters in
 *   BATTLE gets Power-1000 in this turn.
 *
 * The script lowers the Power of one opposing BATTLE character by 1000 until the end of the
 * turn.
 */

import { asCardNo } from '@mhr/core';
import { characters, effect, power, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-114');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, power(select('opponent', 'BATTLE', characters()), -1000));
}
