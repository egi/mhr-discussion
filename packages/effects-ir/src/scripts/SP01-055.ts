/**
 * SP01-055, a character that discards 3 cards to bring a Machine back from the RETREAT as an
 * attachment when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When this card takes BATTLE-BASE Move, you may discard 3 of your
 *   cards in HAND. If you do, you attach 1 of your characters with 【Machine】 in their features
 *   from RETREAT to this card.
 *
 * Event tag: base-move, FIELD (301.24.a), once per turn (201.10.d.2), on this card's own move only.
 * The effect is optional (304.1.a): the player may discard 3 HAND cards (301.15.a); declining
 * changes nothing and the attach never runs. Only if the discard was done in full is 1 own
 * Machine character from the RETREAT attached to this card (301.25.a). With fewer than 3 HAND
 * cards the engine discards what it can (304.1.d) but the discard is not done in full, so no
 * attach; with no Machine character in the RETREAT the attach is not done and the discard stays paid (discussion 24 principle, discussion 25 for a cost
 * with no legal target, 304.1.d). "If you do" follows Reading B (discussion 10 item 3,
 * USER-DECISION of 2026-11-04, closed).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  attach,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-055');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: ONCE PER TURN is an additional Condition
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '24', rule: asRuleKey('304.1.d') },
    { discussion: '25', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(discard(select('self', 'HAND', ANY_CARD, 3))),
        ifDone(attach(select('self', 'RETREAT', characters({ feature: 'Machine' })), source())),
      ),
    ),
    trigger('base-move', 'FIELD'),
    { oncePerTurn: true },
  );
}
