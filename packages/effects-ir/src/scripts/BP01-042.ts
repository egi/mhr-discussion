/**
 * BP01-042, a character that brings a small yellow character back from the RETREAT.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you place 1 of your yellow
 *   characters with Lv2 or below from RETREAT into your BATTLE.
 *
 * The script places one yellow Lv2-or-below character from the RETREAT into the BATTLE. The
 * destination lane is a choice the invocation does not carry yet, so the interpreter answers
 * EFFECT_UNSUPPORTED and the card is played by hand.
 */

import { asCardNo } from '@mhr/core';
import { colored, effect, relocate, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-042');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('self', 'RETREAT', colored('yellow', { lvMax: 2 })), {
      side: 'self',
      area: 'BATTLE',
      faceDown: false,
    }),
  );
}
