/**
 * BP01-001 「Antimatter」Iron Man, a Lv6 character that prunes a small opposing character when it
 * is called, as many Lv as it retreated to be called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you prune 1 of your opponent's
 *   characters with LvX or below in the field. X is the number of the cards you retreat by
 *   calling this card.
 *
 * The trigger tag is `enters-field-by-call` from the FIELD: an entry by an effect does not fire
 * it, and the effect is mandatory (304.1.b). One opponent character in the field (BATTLE or BASE)
 * with Lv at most X is pruned (301.17.a). X is `retreated-card-count`: the cards the call
 * retreated, attached cards included (user decision D-19 WR-02; discussion 02, HEAD-JUDGE
 * 2026-10-10). A call that retreated nothing gives X = 0, so only Lv0 candidates qualify; with
 * no candidate nothing is pruned.
 *
 * OPEN-RULING 17, tier: HEAD-JUDGE for the result, ESCALATE-OPEN for the grouping mechanism; no
 * generalisation; card link inferred (`cards-status: inferred`).
 * Discussion: .planning/research/community-rulings/discussions/17-same-event-triggers-atomic-grouping.md
 * (frontmatter cards BP01-001, BP01-099, SP01-070, status HEAD-JUDGE for the result and
 * ESCALATE-OPEN for the mechanism). It covers the Antimatter prune and the triggers derived from
 * it. This script asserts only the prune itself (the Lv bound, X from the cards retreated) and
 * nothing about how the triggers of one event group.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, prune, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1'), reviewedHash: 'd566cc2d7ec3' }, // triggered effects
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
  ],
  rulings: [{ discussion: '17', rule: asRuleKey('304.1') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    prune(select('opponent', 'FIELD', characters({ lvBy: { mode: 'max', source: 'retreated-card-count' } }))),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
