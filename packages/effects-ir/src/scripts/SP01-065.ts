/**
 * SP01-065, an attachment that trades places with its Web host (gaining AIR STRIKE) and, at the
 * opponent's turn start, with one of the Web cards attached to it (giving BLOCK to the new host).
 *
 * Printed text (official card; SP01-064 and SP01-065 print the same text):
 *
 *   ACTI【FIELD/ONCE PER TURN】:You swap this card on the field and the character this card is
 *   attached to with 【Web】 in its feature. If you do, this card gets the ability 【AIR STRIKE】
 *   this turn.
 *   TRIG【FIELD/ONCE PER TURN】:When your opponent's turn starts, you swap this card on the field
 *   and 1 of its attached cards with 【Web】 in their features. If you do, the character this card
 *   is attached to gets the ability 【BLOCK】 this turn.
 *
 * Two clauses, in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  ACTI FIELD, once per turn  (activate, FIELD)
 *   1  TRIG FIELD, once per turn  (opponent-turn-starts, FIELD)
 *
 * Clause 0. With this card attached to a host that has Web in its features, the card and the host
 * trade places (a keyed host swap: the stacks stay with their cards, 301.18.c), and only if the
 * swap was done (301.38.a, Reading B) does this card get AIR-ATTACK (the engine name of the printed
 * AIR STRIKE) for the turn. A host without Web, or a card not attached to anything, moves nothing
 * and grants nothing. The former host, now an attached card, is not Power-checked after the swap
 * (user decision D-06, 2026-11-19, not a rule).
 *
 * Clause 1. At the start of the opponent's turn, the card swaps with 1 of its own attached Web
 * cards. "Its attached cards" is read as this card's own attachments (the `attachedTo: 'source'`
 * pool), not the host's other attachments (user decision D-17, 2026-11-19, not a rule), so the
 * clause can be satisfied only once this card is a host, for example after clause 0 has swapped it
 * up. With no own attached Web card nothing happens. Only if the swap was done does the character
 * this card is then attached to get BLOCK for the turn. Activation from the FIELD selects clause 0
 * only (D-03); clause 1 never activates.
 *
 * Once per turn: the use record is keyed by card instance, so an ACTI use in the controller's turn
 * does not block the TRIG at the opponent's turn start, and the record clears at the End Phase.
 * Swaps carry per-turn entries with the cards (D-10, D-18, user decision 2026-11-17, not a
 * rule).
 * OPEN-RULING 20, decided: USER-DECISION 2026-11-17 (discussion 20 CLOSED; member consensus, the rulebook is
 * silent on swapping a card with its host, the head judge has not ruled). SP01-065 is named in
 * discussion 20's frontmatter, so the ruling is declared in `rulings` and the token stays in this
 * header so audits find it. The card is not provisional (D-09). A host swap trades the places of
 * the two cards (301.18.a, 301.18.c) and counts as a re-attach for every re-hosted card; hit-field
 * is NO for a field-to-field swap (user decision D-10, not a rule).
 *
 * Rules verified in docs/rules: 301.18.a, 301.18.c, 301.18.d, 301.18.f, 301.18.h, 301.38.a,
 * 201.10.d.2, 201.10.f.2.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  conditional,
  effect,
  grantAbility,
  hostOfSource,
  hostOfSourceMatches,
  ifDone,
  selectAttachedTo,
  sequence,
  source,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-065');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // Activated Effect
    { key: asRuleKey('301.18.a'), reviewedHash: 'ee5d5ce25680' }, // swap exchanges positions
    { key: asRuleKey('301.18.c'), reviewedHash: 'ecf7cbe1e937' }, // swapped cards exchange attached cards
    { key: asRuleKey('301.18.d'), reviewedHash: '75dd0629d8dd' }, // swap on the FIELD counts as moving
    { key: asRuleKey('301.18.f'), reviewedHash: '1dfd38a20178' }, // swap with a HAND card
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // a prevented move makes the swap unresolvable
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
  ],
  rulings: [{ discussion: '20', rule: asRuleKey('301.18.d') }],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  const web = characters({ feature: 'Web' });
  return [
    effect(
      CARD_NO,
      conditional(
        hostOfSourceMatches(web),
        sequence(step(swap(source(), hostOfSource(), true)), ifDone(grantAbility(source(), 'AIR-ATTACK'))),
      ),
      trigger('activate', 'FIELD'),
      { oncePerTurn: true },
    ),
    effect(
      CARD_NO,
      sequence(
        step(swap(source(), selectAttachedTo('source', 'self', web), true)),
        ifDone(grantAbility(hostOfSource(), 'BLOCK')),
      ),
      trigger('opponent-turn-starts', 'FIELD'),
      { oncePerTurn: true },
    ),
  ];
}
