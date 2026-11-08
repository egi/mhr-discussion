/**
 * SD02-015, a Lv5 yellow Machine that refills the BASE with a small Machine from the RETREAT.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】： When this card enters the field by calling, you place 1 of your characters
 *   with Lv1 and 【Machine】 in their features from RETREAT into your BASE.
 *
 * Event tag: enters-field-by-call, FIELD. One Lv1 Machine from the player's RETREAT is placed
 * face up into the BASE. A Lv2 or non-Machine character is not a legal target; no legal target is
 * not done and raises no error. When the BASE is full the placement is not done: resolving to the
 * greatest extent possible is 304.1.d, discussion 24 (HEAD-JUDGE for the principle, FAQ F-29;
 * CONSENSUS only for the zone-full cases). The Lv filter reads the printed Lv
 * (effective-power-lv-basis is UNRULED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-015');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [{ discussion: '24', rule: asRuleKey('304.1.d') }],
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
