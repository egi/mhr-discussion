/**
 * SD03-007, a character that may prune itself when it moves to stock the BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card takes BATTLE-BASE Move, you may prune this card in the field. If
 *   you do, you place the top 3 cards of your deck face down into your BASE.
 *
 * Event tag: base-move, FIELD (301.24.a). The prune of this card is optional (304.1.a); only if it
 * was done are the top three DECK cards placed face down into the BASE (301.13.a). When the BASE or
 * the DECK cannot take all three, as many as possible are placed (survey label "11 B2" is
 * discussion 24, HEAD-JUDGE for the principle, CR 304.1.d; the zone-full cases are CONSENSUS).
 * Declining changes nothing. "If you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN,
 * user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  effect,
  ifDone,
  optional,
  prune,
  relocate,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET cards face-down
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '24', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(prune(source())),
        ifDone(relocate(select('self', 'DECK', ANY_CARD, 3), { side: 'self', area: 'BASE', faceDown: true })),
      ),
    ),
    trigger('base-move', 'FIELD'),
  );
}
