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
 * changes nothing and the attach never runs.
 *
 * The discard is a cost that must be paid in full (user decision of 2026-11-11; discussion 24 is
 * cited only for the unpayable-cost case, a cost that cannot be paid is not paid; F-29 and
 * CR 301.38.a cover only the "after doing so" sentence). With fewer than 3 cards in the HAND the
 * cost cannot be paid, so nothing is discarded and nothing attaches. This replaces the earlier
 * "discard what it can" reading. The IR therefore checks for 3 HAND cards before the discard.
 *
 * Only if the discard was done in full is 1 own Machine character from the RETREAT attached to
 * this card (301.25.a). With no Machine character in the RETREAT the attach is not done and the
 * discard stays paid (discussion 25 for a cost with no legal target). "If you do" follows
 * Reading B (discussion 10 item 3, user decision of 2026-11-04, closed; its equivalence with
 * [After doing so] is an inference).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  attach,
  characters,
  conditional,
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
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
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
      conditional(
        { kind: 'have', side: 'self', area: 'HAND', filter: ANY_CARD, min: 3, max: null },
        sequence(
          step(discard(select('self', 'HAND', ANY_CARD, 3))),
          ifDone(attach(select('self', 'RETREAT', characters({ feature: 'Machine' })), source())),
        ),
        null,
      ),
    ),
    trigger('base-move', 'FIELD'),
    { oncePerTurn: true },
  );
}
