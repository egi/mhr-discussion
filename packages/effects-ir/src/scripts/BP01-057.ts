/**
 * BP01-057, a character that brings a Lv1 Machine back from the RETREAT into the BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by callling, you place 1 of your characters
 *   with Lv1 and 【Machine】 in their features from RETREAT into your BASE.
 *
 * The script is the effect after the trigger: one RETREAT character with Lv1 and the Machine
 * feature is placed into the BASE, face up (301.12.a, the text says place and not face-down, the
 * same as SD02-010). With no such character the effect cannot run. The trigger is mandatory
 * (304.1.b).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-057');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('self', 'RETREAT', characters({ lvMin: 1, lvMax: 1, feature: 'Machine' })), {
      side: 'self',
      area: 'BASE',
      faceDown: false,
    }),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
