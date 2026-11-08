/**
 * SD01-015, a Lv1 red Human that recycles a red character from the RETREAT into a draw.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, you prune 1 of your red characters
 *   in RETREAT. If you do, you draw 1 card.
 *
 * Event tag: enters-field-by-call, FIELD. One of the player's red RETREAT characters is pruned
 * (placed in the VOID); only if that was done the player draws 1 card. A non-red character is not
 * a legal target; no red character in the RETREAT is not done and draws nothing. The engine
 * reading of "If you do" is Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision of
 * 2026-11-03); resolving to the greatest extent is 304.1.d (discussion 09 RESOLVED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { colored, draw, effect, ifDone, prune, select, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-015');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places card in VOID
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
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
    sequence(step(prune(select('self', 'RETREAT', colored('red')))), ifDone(draw('self', 1))),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
