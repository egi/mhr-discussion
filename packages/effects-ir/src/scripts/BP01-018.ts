/**
 * BP01-018, a character that weakens a low-Lv opponent when the board is behind.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, if the number of your
 *   characters in BATTLE is less than your opponent's, 1 of your opponent's characters with
 *   Lv3 or below in BATTLE gets Power-2000 in this turn.
 *
 * The script compares the two sides' BATTLE character counts and, when the controller has
 * fewer, lowers one opposing BATTLE character of Lv3 or below by 2000 Power until the end of
 * the turn.
 */

import { asCardNo } from '@mhr/core';
import { characters, conditional, effect, power, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-018');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'fewer-than-opponent', area: 'BATTLE', filter: characters() },
      power(select('opponent', 'BATTLE', characters({ lvMax: 3 })), -2000),
    ),
  );
}
