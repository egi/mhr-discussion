/**
 * BP01-035 「MK44-The Commander」Hulk Buster, a Lv3 Machine that attaches itself to an ally and
 * clears that ally's other attachments.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】: You attach this card from the field to 1 of your
 *   characters in the field. If you do, you retreat all the attaching cards of that character
 *   except this card.
 *   TRIG【BATTLE】:When this card attaches to the character in BATTLE, that character may take
 *   BATTLE Move once.
 *
 * Two clauses in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  COUNTER·ACTI (activate-counter, FIELD), the body shared with BP01-023
 *   1  TRIG【BATTLE】 (this-card-attached, BATTLE)
 *
 * Clause 1 fires after this card attaches to a character in BATTLE: the carrier stands where its
 * host stands, so the BATTLE tag is the "character in BATTLE" of the printed text, and the host is
 * the event's subject. The host then may take BATTLE Move once: the `optional` battle-move on the
 * host, which is the BATTLE-BASE move of 301.24.a/b. A host in BASE does not fire it. The effect
 * has no use limit of its own and the single battle-move is the "once".
 *
 * OPEN-RULING 59, tier: ESCALATE-OPEN (discussion 59, USER-DECISION 2026-11-20 for the scope of
 * this clause only): whether the attach from the field is itself a movement of this card, the
 * unanswered question in discussion 04 (`20261002-1557#40`), is not decided here. Neither clause
 * treats the attach as a movement; tests that depend on that are named PROVISIONAL.
 *
 * Clause 0: the host is chosen and attached; only if the attach was done does the retreat of the host's other
 * attaching cards run (this card is kept). A host with no other attachment is not an error and no
 * own character in the field leaves the card where it is (304.1.d, discussions 09 and 10;
 * discussion 10 is ESCALATE-OPEN and the "If you do" reading is the engine default, tier: user
 * decision below a head-judge ruling). The host pick never offers this card itself.
 * ONCE PER TURN is the `oncePerTurn` marker on the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  battleMove,
  characters,
  effect,
  hostOfSource,
  ifDone,
  optional,
  retreatAttachedOfHost,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-035');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a stacked character is an attached card
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect moving between BATTLE and BASE
    { key: asRuleKey('301.26.b'), reviewedHash: '37416cbf2bfd' }, // detach is treated as movement
  ],
  rulings: [{ discussion: '59', rule: asRuleKey('301.26.b') }],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  return [
    effect(
      CARD_NO,
      sequence(
        step(attach(source(), select('self', 'FIELD', characters({ exceptSource: true })))),
        ifDone(retreatAttachedOfHost(hostOfSource(), 'all', true)),
      ),
      trigger('activate-counter', 'FIELD'),
      { oncePerTurn: true },
    ),
    effect(CARD_NO, optional(battleMove(hostOfSource())), trigger('this-card-attached', 'BATTLE')),
  ];
}
