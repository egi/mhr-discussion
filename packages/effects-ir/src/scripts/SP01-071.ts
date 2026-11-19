/**
 * SP01-071 「Venom 2099」, a UNIQUE card that attaches itself to a Human from the HAND and, as an
 * attachment, punishes an opponent's effect that lowers its host's Power.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【BATTLE】:When the Power of the character this card is attached to is decreased by the
 *   effect of your opponent, 1 of your opponent's characters on the field gets Power-X this turn.
 *   X is the Power value of the character this card is attached to.
 *   COUNTER·ACTI【HAND】:You attach this card from HAND to 1 of your characters with 【Human】 in
 *   their features on the field. If you do, 1 of your opponent's characters on BATTLE gets Lv-3
 *   this turn.
 *
 * Two clauses, in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  TRIG BATTLE        (host-power-decreases, BATTLE, subject causeSide opponent)
 *   1  COUNTER-ACTI HAND  (activate-counter, HAND)
 *
 * Clause 0. The trigger is `host-power-decreases` with `causeSide: 'opponent'`: the cause is
 * judged per resolving effect and never netted (mhrdecklab FAQ F-27, head-judge FAQ tier;
 * 17.5.1.1 D-11, D-12, D-26, D-32), any effect the opponent controls counts (an AUTO included),
 * a battle result is not an effect, and the controller's own effect does not fire it. A swap that
 * gives the card a new host re-runs the check for the new host with the swap's controller as the
 * cause side (user decision 2026-11-17, discussion 20); the former host is not checked. X is read
 * with the `host-power` scale source, the host's effective Power when the effect resolves, and
 * 1 opposing character on the field gets Power-X this turn. The text has no "may", so the effect
 * is mandatory (304.1.b).
 *
 * Clause 1. A COUNTER·ACTI from the HAND (201.10.f.3): the card is attached from the HAND to 1 own
 * Human on the field, and only if that was done (301.38.a, Reading B) 1 opposing BATTLE character
 * gets Lv-3 this turn. With no own Human on the field nothing is attached and nothing changes.
 * Activation from the HAND selects clause 1 only; clause 0 is a trigger and never activates (D-03).
 *
 * OPEN-RULING 17, tier: HEAD-JUDGE for the result, ESCALATE-OPEN for the grouping mechanism; no
 * generalisation; card link inferred (discussion 17's frontmatter `cards:` is BP01-001, BP01-099
 * and SP01-070 and does not name SP01-071; the link is the user's decision K2 answer A, recorded
 * in 17.5.2.1-CHECKPOINTS.md). The Power-change event this card reads is an unruled engine
 * reading tied to the discussion 17 grouping mechanism (`power-change-narrow-reading` in
 * `engine-provisional.ts`).
 * Discussion: .planning/research/community-rulings/discussions/17-same-event-triggers-atomic-grouping.md
 * Discussion 09 (RESOLVED, card link inferred) covers the resolution order.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  characters,
  effect,
  ifDone,
  select,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-071');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1'), reviewedHash: 'd566cc2d7ec3' }, // triggered effects
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1') },
    { discussion: '17', rule: asRuleKey('304.1') },
  ],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  return [
    effect(
      CARD_NO,
      statMod(select('opponent', 'FIELD', characters()), 'power', -1, 'host-power'),
      trigger('host-power-decreases', 'BATTLE', undefined, { causeSide: 'opponent' }),
    ),
    effect(
      CARD_NO,
      sequence(
        step(attach(source(), select('self', 'FIELD', characters({ feature: 'Human' })))),
        ifDone(statMod(select('opponent', 'BATTLE', characters()), 'lv', -3)),
      ),
      trigger('activate-counter', 'HAND'),
    ),
  ];
}
