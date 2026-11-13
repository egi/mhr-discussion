/**
 * BP01-099, a Hawkeye that trades 2 cards from the HAND for the removal of itself and an opposing
 * character when a big opposing character enters the field.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When your opponent's character with Lv4 or above enters the field, you may
 *   discard 2 of your cards in HAND. If you do, you prune this card in the field and 1 of your
 *   opponent's characters in the field.
 *
 * The trigger tag is `opponent-character-enters-field` from the FIELD, narrowed to a character of
 * printed Lv4 or above (the `levelAtLeast` subject filter). It fires for the seat that does not
 * control the entering character, not for an own entry, and not for a face-down card flipped
 * face up (discussion 30, HEAD-JUDGE: a flip is not entering the field). The discard is
 * optional (304.1.a). The discard is a cost that must be paid in full (user decision of
 * 2026-11-13, tier: user decision, FAQ F-29), overriding the "do as much as you can" default for
 * counted discards: with fewer than 2 cards in the HAND nothing is discarded and nothing is
 * pruned, so the IR checks for 2 HAND cards first. Only if the 2 cards were discarded does this card go to the VOID, and then the
 * opponent's field character (BATTLE or BASE, a face-down card is not a character, 301.21.a)
 * the player picks; with no such character the first prune stays and the effect resolves as far
 * as it can (discussion 25, HEAD-JUDGE via FAQ F-30, provisional: the head judge noted he might
 * be wrong). "If you do" is Reading B (discussion 10 item 3, rule 301.38.a); this script does
 * not declare discussion 10.
 *
 * Rulings (tiers read from the status marks): discussion 17 is HEAD-JUDGE for the result (the
 * triggers of one event are atomic, Pym Arrow cannot sit between Gwen and Silk) and its grouping
 * mechanism is ESCALATE-OPEN; the engine queue, not this script, carries it, and the pinned board
 * marks the row HEAD-JUDGE, so the provisional builder does not list this card (see
 * 17.3-PROVISIONAL-GAP.md). Discussion 25 is HEAD-JUDGE (via the FAQ, provisional); discussion 30
 * is HEAD-JUDGE (via FAQ F-11).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  conditional,
  discard,
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

export const CARD_NO = asCardNo('BP01-099');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1'), reviewedHash: 'd566cc2d7ec3' }, // triggered effects
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND by effect
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('301.22.d'), reviewedHash: '561defd4704b' }, // flipping is not entering the field
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [
    { discussion: '17', rule: asRuleKey('304.1') },
    { discussion: '25', rule: asRuleKey('304.1.d') },
    { discussion: '30', rule: asRuleKey('301.22.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      conditional(
        { kind: 'have', side: 'self', area: 'HAND', filter: ANY_CARD, min: 2, max: null },
        sequence(
          step(discard(select('self', 'HAND', ANY_CARD, 2))),
          ifDone(
            sequence(step(prune(source())), step(prune(select('opponent', 'FIELD', characters())))),
          ),
        ),
        null,
      ),
    ),
    trigger('opponent-character-enters-field', 'FIELD', undefined, { levelAtLeast: 4 }),
  );
}
