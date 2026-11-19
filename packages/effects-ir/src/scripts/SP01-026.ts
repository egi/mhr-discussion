/**
 * SP01-026, an attachment that trades places with its Human host and, from the HAND as a
 * COUNTER, swaps onto the field with a Ghost-Spider or Gwen card to shrink an opposing character.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   ACTI【FIELD/ONCE PER TURN】:If the character this card is attached to is with 【Human】 in its
 *   feature, you swap this card on the field and that character.
 *   COUNTER·ACTI【HAND】:You swap this card in HAND and 1 of your cards with 【Ghost-Spider】 or
 *   【Gwen】 in their names on the field. If you do, 1 of your opponent's characters on BATTLE gets
 *   Power-1000 this turn.
 *
 * Two clauses, in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  ACTI FIELD, once per turn  (activate, FIELD)
 *   1  COUNTER·ACTI HAND          (activate-counter, HAND), not once per turn
 *
 * Activation picks the clause by zone, never both (D-03): clause 0 from the FIELD, clause 1 from
 * the HAND.
 *
 * Clause 0. With this card attached to a host that has Human in its features, the card and the
 * host trade places (a keyed host swap: the stacks stay with their cards, 301.18.c). A host
 * without Human, or a card attached to nothing, moves nothing.
 *
 * Clause 1. The card in HAND swaps with 1 of the controller's own field cards whose name has
 * Ghost-Spider or Gwen in it (two name filters as alternatives, `anyOf`). The text says "cards",
 * so the pick is not limited to characters (`characterOnly` stays false); the HAND card takes the
 * picked card's place and the picked card goes to the HAND (301.18.f). With no such card on the
 * field nothing is swapped and no Power changes. Only if the swap was done (301.38.a, Reading B)
 * does 1 opponent character on BATTLE get Power-1000 for the turn. The count of cards in the
 * opponent's BATTLE is a pick, not a rule: a character is required there.
 *
 * Swap re-attach (D-07; user decision 2026-11-17 / 2026-11-18, confirmed 2026-11-19; explicitly
 * not 301.18.e): a swap counts as a re-attach, so the when-attached triggers of the attached
 * cards that change hosts are fired again. This holds for the HAND swap too: the attached cards
 * of the field card go to the HAND card.
 *
 * Entering the field (D-08): this card, coming from the HAND, is "treated as being placed"
 * (301.18.f), and the step from "placed" to "enters the field" (so that enters-the-field triggers
 * fire) is a user decision of 2026-11-19, since docs/rules defines neither "enters the field" nor
 * "hit field". The character going from the field to the HAND is "moving" (301.18.f). Hit-field
 * stays NO for a field-to-field swap such as clause 0 (301.18.d).
 *
 * OPEN-RULING 20 decided: swap-as-attach, discussion 20 (CLOSED, USER-DECISION 2026-11-17; member
 * consensus, rulebook silent, head judge has not ruled). The card is not provisional (D-09).
 * `rulings` is left empty: the pinned vendor status board line for 20 still reads ESCALATE-OPEN,
 * which would list the card as provisional. Add `{ discussion: '20', rule: 301.18.d }` once that
 * board line reads CLOSED.
 *
 * Rules verified in docs/rules: 301.18.a, 301.18.c, 301.18.d, 301.18.f, 301.18.h, 301.38.a,
 * 201.10.f.2 (Activated Effect), 201.10.f.3 (COUNTER-Activated Effect).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  conditional,
  effect,
  hostOfSource,
  hostOfSourceMatches,
  ifDone,
  select,
  sequence,
  source,
  statMod,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-026');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // Activated Effect
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.18.a'), reviewedHash: 'ee5d5ce25680' }, // swap exchanges positions
    { key: asRuleKey('301.18.c'), reviewedHash: 'ecf7cbe1e937' }, // swapped cards exchange attached cards
    { key: asRuleKey('301.18.d'), reviewedHash: '75dd0629d8dd' }, // swap on the FIELD counts as moving
    { key: asRuleKey('301.18.f'), reviewedHash: '1dfd38a20178' }, // swap with a HAND card
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // a prevented move makes the swap unresolvable
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
  ],
  // No `rulings` entry for discussion 20: see the header.
  rulings: [],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  const spiderOrGwen = {
    ...ANY_CARD,
    anyOf: [
      { ...ANY_CARD, nameIncludes: 'Ghost-Spider' },
      { ...ANY_CARD, nameIncludes: 'Gwen' },
    ],
  };
  return [
    effect(
      CARD_NO,
      conditional(hostOfSourceMatches(characters({ feature: 'Human' })), swap(source(), hostOfSource(), true)),
      trigger('activate', 'FIELD'),
      { oncePerTurn: true },
    ),
    effect(
      CARD_NO,
      sequence(
        step(swap(source(), select('self', 'FIELD', spiderOrGwen))),
        ifDone(statMod(select('opponent', 'BATTLE', characters()), 'power', -1000)),
      ),
      trigger('activate-counter', 'HAND'),
    ),
  ];
}
