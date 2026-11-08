/**
 * PB01-011, a Lv3 Human that returns from the VOID by pruning a Lv4 or higher character.
 *
 * Printed text (official card):
 *
 *   ACTI【VOID/ONCE PER TURN】:You prune 1 of your characters with Lv4 or above in RETREAT. If
 *   you do, you place this card from VOID into your field.
 *
 * An activation from the VOID. One of the player's own RETREAT characters of Lv4 or above is
 * pruned (a Lv3 or lower character is not a legal target); only if that was done is this card
 * placed face up into the field, the lane or the BASE being the placement choice. With no legal
 * target the card stays in the VOID. ONCE PER TURN is the `oncePerTurn` marker. The Lv filter
 * reads the card's Lv; whether printed or effective is UNRULED (`effective-power-lv-basis`). The
 * "If you do" reading is Reading B (discussion 10 item 3, ESCALATE-OPEN, tier: user decision
 * below a head-judge ruling); 304.1.d is discussion 09 RESOLVED.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, ifDone, prune, relocate, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-011');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places card in VOID
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(prune(select('self', 'RETREAT', characters({ lvMin: 4 })))),
      ifDone(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
    ),
    trigger('activate', 'VOID'),
    { oncePerTurn: true },
  );
}
