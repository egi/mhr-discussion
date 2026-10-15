/**
 * BP01-050, a character that pins an opposing character in place when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, 1 of your opponent's
 *   characters in the field can not move in this turn.
 *
 * The script forbids one opposing FIELD character from moving until the end of the turn.
 * Nothing in the state records a movement restriction yet, so the interpreter answers
 * EFFECT_UNSUPPORTED and the card is played by hand.
 */

import { asCardNo } from '@mhr/core';
import { characters, effect, restrict, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-050');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, restrict(select('opponent', 'FIELD', characters()), 'move'));
}
