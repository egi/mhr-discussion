/**
 * BP01-015, a character that prunes a weak opposing character when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, you may prune 1 of your
 *   opponent's characters with Power 4000 or lower in BATTLE.
 *
 * The script lets the player prune one opposing BATTLE character with Power 4000 or less.
 */

import { asCardNo } from '@mhr/core';
import { characters, effect, optional, prune, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-015');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(prune(select('opponent', 'BATTLE', characters({ powerMax: 4000 })))),
  );
}
