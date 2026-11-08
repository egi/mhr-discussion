/**
 * SP01-030, an attachment that can prune itself and a Web character from the RETREAT for two cards.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When you attach this card to a character on the field, you may prune this card
 *   on the field and 1 of your characters with 【Web】 in their features in RETREAT. If you do,
 *   you draw 2 cards.
 *   ACTI【BATTLE/ONCE PER TURN】:You prune 1 of your characters with 【Web】 in their features in
 *   HAND. If you do, you draw 1 card.
 *
 * Event tag: this-card-attached, FIELD. A script carries one trigger, so this is the first printed
 * clause (TRIG): optionally prune one own Web character from the RETREAT and this card from the
 * field, and only if that was done draw 2. The Web character is chosen first, so with none in the
 * RETREAT nothing is pruned and nothing is drawn. The ACTI【BATTLE/ONCE PER TURN】 clause (prune a
 * Web character in HAND, draw 1) is not modelled and stays on the manual path, so the card badges
 * partial. "If you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision of
 * 2026-11-03); resolving to the greatest extent is 304.1.d (discussion 09, RESOLVED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  draw,
  effect,
  ifDone,
  optional,
  prune,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-030');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
    optional(
      sequence(
        step(prune(select('self', 'RETREAT', characters({ feature: 'Web' })))),
        ifDone(prune(source())),
        ifDone(draw('self', 2)),
      ),
    ),
    trigger('this-card-attached', 'FIELD'),
  );
}
