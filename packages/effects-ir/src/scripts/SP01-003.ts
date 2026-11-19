/**
 * SP01-003 「Phoenix Host」Jean Grey, a UNIQUE character that comes back from the RETREAT by retreating an own Lv6
 * character when the controller is behind on the BATTLE, and then retreats an opposing Lv6.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   ACTI【RETREAT】:If the number of your characters on BATTLE is less than your opponent's, you
 *   retreat 1 of your characters with Lv6 on BATTLE. If you do, you place this card from RETREAT
 *   onto your field.
 *   TRIG【BATTLE】:When this card enters the field from RETREAT, you retreat 1 of your opponent's
 *   characters with Lv6 on BATTLE. If you do, you move 1 of your cards from HAND back to the
 *   bottom of your deck and you cannot retreat this card to call a character this turn.
 *
 * Two clauses, in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  ACTI RETREAT (activate, RETREAT)
 *   1  TRIG BATTLE  (enters-field-from-retreat, BATTLE)
 *
 * Clause 0. Only when the controller has fewer characters on the BATTLE than the opponent, 1 own
 * Lv6 character on the BATTLE is retreated (the cost), and only if that was done (301.38.a, "If
 * you do", Reading B) this card is placed from the RETREAT onto the field (the lane is the
 * player's choice). With equal or more characters nothing happens; with no own Lv6 character on
 * the BATTLE nothing moves and the card stays in the RETREAT.
 *
 * Clause 1. The placement made by clause 0 is the card entering the field from the RETREAT, so
 * this TRIG fires right after the ACTI (D-03, D-05); entering the field any other way fires
 * nothing. The text has no "may", so it is mandatory (304.1.b). 1 opposing Lv6 character on the
 * BATTLE is retreated; only if that was done, 1 own HAND card goes to the bottom of the deck and
 * this card gets the per-card `retreat-to-call` restriction (17.5.1.1 D-05 to D-07, D-28): it is
 * recorded on this card, by operand form, and the script does not rely on that record surviving
 * a retreat-and-recall (17.5.2 D-04). With no opposing Lv6 character no card moves and no
 * restriction is recorded.
 *
 * No community discussion names SP01-003 in its `cards:` frontmatter, so the script declares no
 * ruling and carries no OPEN-RULING marker.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  conditional,
  effect,
  ifDone,
  relocate,
  restrict,
  retreat,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-003');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
    { key: asRuleKey('301.19.b'), reviewedHash: '4804fb75db07' }, // the retreat paid for a call
  ],
  rulings: [],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  return [
    effect(
      CARD_NO,
      conditional(
        { kind: 'fewer-than-opponent', area: 'BATTLE', filter: characters() },
        sequence(
          step(retreat(select('self', 'BATTLE', characters({ lvMin: 6, lvMax: 6 })))),
          ifDone(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
        ),
      ),
      trigger('activate', 'RETREAT'),
    ),
    effect(
      CARD_NO,
      sequence(
        step(retreat(select('opponent', 'BATTLE', characters({ lvMin: 6, lvMax: 6 })))),
        ifDone(
          sequence(
            step(relocate(select('self', 'HAND', ANY_CARD), { side: 'self', area: 'DECK-BOTTOM', faceDown: false })),
            step(restrict(source(), 'retreat-to-call')),
          ),
        ),
      ),
      trigger('enters-field-from-retreat', 'BATTLE'),
    ),
  ];
}
