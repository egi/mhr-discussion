/**
 * EB01-014, a UNIQUE Web character that pulls a Web character back to the HAND when it is
 * attached, and that can be placed onto the BATTLE from the HAND by pruning five Web characters.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【FIELD】:When you attach this card to a character on the field, you move 1 of your
 *   characters with 【Web】 in their features from RETREAT or VOID back to your HAND.
 *   ACTI【HAND】:If you have any Weaknesses, you prune 5 of your characters with 【Web】 in their
 *   features in RETREAT. If you do, you place this card from HAND onto your BATTLE and retreat 1
 *   of your opponent's characters on the field.
 *
 * Two clauses, in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  TRIG FIELD  (this-card-attached, FIELD)
 *   1  ACTI HAND   (activate, HAND)
 *
 * Clause 0. Fires when the controller attaches this card to a character on the field; an attach
 * by the opponent does not fire it. A swap that re-hosts the card counts as a re-attach and
 * fires it again (discussion 20, CLOSED, USER-DECISION 2026-11-17; same behaviour as the swap
 * re-attach of 17.5.1.1). The text has no "may", so the move is mandatory (304.1.b). The pool is
 * the union of the own RETREAT and VOID (`areas`), filtered to Web characters; with none in either
 * area nothing happens, and a non-Web card is never offered.
 *
 * Clause 1. Activated from the HAND (201.10.f.2). Only with a Weakness (`have-weakness`) does the
 * prune start. It prunes exactly 5 own Web characters in the RETREAT; with fewer than 5 nothing
 * is pruned and the card stays in the HAND. Only if the prune was done in full (301.38.a,
 * Reading B) is this card placed from the HAND onto the BATTLE and 1 opposing character on the
 * field retreated. Activation from the HAND selects clause 1 only; clause 0 is a trigger and never
 * activates (D-03).
 *
 * OPEN-RULING 17, tier: HEAD-JUDGE for the result, ESCALATE-OPEN for the grouping mechanism; no
 * generalisation; card link inferred (discussion 17 asks about the "Echo of Fate" trigger wording
 * and a call that retreats 1 opposing character; its frontmatter `cards:` is BP01-001, BP01-099
 * and SP01-070 and does not name EB01-014, and the glossary records "echo of fate" as SP01-065;
 * the link to this printing is the user's decision K4 answer A, recorded in
 * 17.5.2.1-CHECKPOINTS.md). The clause 1 placement followed by a retreat in the same resolution
 * is the case whose same-event trigger grouping is open; tests depending on it are named
 * PROVISIONAL.
 * Discussion: .planning/research/community-rulings/discussions/17-same-event-triggers-atomic-grouping.md
 * Discussion 20 (CLOSED) covers the swap re-attach of clause 0 and is cited in prose; its
 * frontmatter `cards:` does not name EB01-014 either. No discussion 10 link (D-15).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  conditional,
  effect,
  ifDone,
  prune,
  relocate,
  retreat,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-014');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1'), reviewedHash: 'd566cc2d7ec3' }, // triggered effects
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // Activated Effect
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
  ],
  rulings: [{ discussion: '17', rule: asRuleKey('304.1') }],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  const webToHand = {
    ...select('self', 'RETREAT', characters({ feature: 'Web' })),
    areas: ['VOID'],
  } as ReturnType<typeof select>;
  return [
    effect(
      CARD_NO,
      relocate(webToHand, { side: 'self', area: 'HAND', faceDown: false }),
      trigger('this-card-attached', 'FIELD'),
    ),
    effect(
      CARD_NO,
      conditional(
        { kind: 'have-weakness' },
        sequence(
          step(prune(select('self', 'RETREAT', characters({ feature: 'Web' }), 5))),
          ifDone(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
          ifDone(retreat(select('opponent', 'FIELD', characters()))),
        ),
      ),
      trigger('activate', 'HAND'),
    ),
  ];
}
