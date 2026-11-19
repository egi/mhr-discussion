/**
 * SP01-009 「Spider-Ally Black Panther」, a BATTLE character that moves attached cards around and
 * mills the opponent when it receives an attach by its own effect.
 *
 * Printed text (official card), two clauses in printed order:
 *
 *   0  ACTI【BATTLE/ONCE PER TURN】:You attach 1 of your attached cards on the field to this card
 *      or attach 1 of this card's attached cards to 1 of your characters on BATTLE.
 *   1  TRIG【BATTLE】:When this card would have a card attached to it by its own effect, you
 *      discard the top 2 cards of your opponent's deck.
 *
 * Clause 0 (activate, BATTLE, once per turn). An exclusive choice of two attaches (the printed
 * "or"; the same `chooseOne` reading as BP01-094):
 *   (1) 1 of the own attached cards on the field is attached to this card. The pool is the attached
 *       cards NOT attached to this card (`attachedTo: 'not-source'`): a card already attached to
 *       this card cannot attach to it again (rule 301.25.b). The reach follows the user's answer K9=A
 *       (identity cause; the pool excludes only the cards whose host is this card).
 *   (2) 1 of this card's own attached cards (`attachedTo: 'source'`) is attached to 1 of the own
 *       BATTLE characters.
 * A branch with no candidate does nothing; the unchosen branch changes nothing.
 *
 * Clause 1 (would-be-attached, BATTLE). "Would have a card attached" is the ordinary after-attach
 * timing (discussion 45, USER-DECISION). The cause must be this card itself (`causeIsSource`): an
 * attach by the opponent, by another own card or with no card cause (a call) does nothing. Branch
 * (1) of clause 0 attaches to this card by this card's own effect, so it fires clause 1 in
 * sequence. The opponent's deck with fewer than 2 cards mills what it has (304.1.d).
 *
 * OPEN-RULING 50, tier ESCALATE-OPEN: .planning/research/community-rulings/discussions/50-anti-venom-attach-and-attached-triggers-iron-man-black-panther.md
 * (cards SD01-001, SP01-067, SP01-009 and SP01-002, `cards-status: confirmed`): whether an on-attach
 * trigger still fires when the host loses its effects by the attach (Anti-Venom, 301.33.a). Nothing
 * is ruled; the engine's current literal reading applies, and tests of it are marked PROVISIONAL.
 * Related: discussion 47 (HEAD-JUDGE: an attached card is not a character but keeps its effects).
 * Rules verified in docs/rules: 301.25.a, 301.25.b, 301.25.c, 201.10.d.2, 201.10.f.2, 304.1.d.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  attach,
  causeIsSource,
  characters,
  chooseOne,
  conditional,
  effect,
  mill,
  select,
  selectAttachedTo,
  source,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // Activated Effect
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
    { key: asRuleKey('301.25.b'), reviewedHash: 'afd29edaf368' }, // an attached card cannot attach to its own host again
    { key: asRuleKey('301.25.c'), reviewedHash: 'f689fb13c049' }, // an attached card follows its host
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '50', rule: asRuleKey('301.25.a') }],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  return [
    effect(
      CARD_NO,
      chooseOne(
        attach(selectAttachedTo('not-source', 'self', ANY_CARD), source()),
        attach(selectAttachedTo('source', 'self', ANY_CARD), select('self', 'BATTLE', characters())),
      ),
      trigger('activate', 'BATTLE'),
      { oncePerTurn: true },
    ),
    effect(
      CARD_NO,
      conditional(causeIsSource(), mill('opponent', 'top', 2, 'discard')),
      trigger('would-be-attached', 'BATTLE'),
    ),
  ];
}
