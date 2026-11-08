/**
 * SD04-005, a character that prunes itself on leaving the field to give a small ally AIR ATTACK.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】: When this card enters RETREAT from the field, you prune this card in RETREAT.
 *   If you do, 1 of your characters with Lv3 or below in the field gets the ability 【AIR ATTACK】
 *   (AUTO【BATTLE】: Even if your opponent has the character in BATTLE, this card may also regard
 *   that BATTLE as weakness to attack) in this turn.
 *
 * Event tag: enters-retreat-from-field, RETREAT. The script prunes this card from the RETREAT and,
 * only if that was done, gives AIR ATTACK until the end of the turn to one own field character of
 * Lv3 or below. "If you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision
 * of 2026-11-03); resolving to the greatest extent is 304.1.d (discussion 09, RESOLVED). With no
 * legal target the prune stays done and the grant is not done. Printed Lv is read; the
 * `effective-power-lv-basis` point is UNRULED.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  grantAbility,
  ifDone,
  prune,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(prune(source())),
      ifDone(grantAbility(select('self', 'FIELD', characters({ lvMax: 3 })), 'AIR-ATTACK')),
    ),
    trigger('enters-retreat-from-field', 'RETREAT'),
  );
}
