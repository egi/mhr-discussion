/**
 * SD02-010, a character that brings a Lv1 Machine back from the RETREAT into the BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】：When this card enters the field by calling, you place 1 of your
 *   characters with Lv1 and 【Machine】 in their features from RETREAT into your BASE.
 *
 * The script moves one Lv1 character with the Machine feature from the RETREAT into the
 * BASE, face up. With no such character the effect cannot run.
 */

import { asCardNo } from '@mhr/core';
import { characters, effect, relocate, select } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-010');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('self', 'RETREAT', characters({ lvMin: 1, lvMax: 1, feature: 'Machine' })), {
      side: 'self',
      area: 'BASE',
      faceDown: false,
    }),
  );
}
