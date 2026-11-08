/**
 * BP01-108 「Airbag Arrow」Hawkeye, a Lv3 Human that trades an Avengers character from the HAND for
 * a stocked BASE.
 *
 * Printed text (official card):
 *
 *   ACTI【FIELD/ONCE PER TURN】:You discard 1 of your characters with 【Avengers】 in their
 *   features in HAND. If you do, you place the top 2 cards of your deck face down into your BASE.
 *
 * ONCE PER TURN is the `oncePerTurn` marker on the IR. One own Avengers character is discarded
 * from the HAND (301.15.a.2). Only if that was done do 2 deck cards go face down into the BASE
 * (301.13.a); with no Avengers character in the HAND nothing happens, and a deck of fewer than 2
 * cards places what it holds. A full BASE (302.6.a) keeps the rest in the deck.
 *
 * The IR has no top-of-deck selector (see BP01-078), so the selection is
 * `select('self','DECK',...,2)`; the deck order is not chosen by the player, so the two cards
 * moved are the first two of the deck.
 *
 * "If you do" Reading B (the gated step runs only if the first step was done in full) is a USER
 * DECISION, tier USER-DECISION, not a head-judge ruling on the phrase. It has been the engine
 * default since 2026-11-03 (memory mhr-effects-do-as-much-as-you-can, update 2026-11-03) and was
 * closed on 2026-11-04 in discussion 10 item 3. It rests on an inferred equivalence of "If you do"
 * with [After doing so]: CR 301.38.a says text after [After doing so] resolves only if all text
 * before it was resolved in full, and it speaks of [After doing so], not of "If you do". Reading B
 * OVERRIDES the head-judge "do as much as you can" principle (mhrdecklab FAQ F-29, discussion 24,
 * HEAD-JUDGE) for "If you do" clauses only. The caveat is recorded in discussion 24 (Constraints
 * section: the "If you do" interaction is discussion 10 item 3, a user decision with rulebook
 * 301.38.a pointing the other way from the "as much as you can" principle) and in discussion 10
 * item 3 (the head judge never ruled the multi-part-first-step case; Reading A stays selectable
 * through ifYouDoReading 'A').
 * Here the first step is a single card, so both readings agree.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-108');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND by effect
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET puts card face-down
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE limit
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(discard(select('self', 'HAND', characters({ feature: 'Avengers' })))),
      ifDone(
        relocate(select('self', 'DECK', ANY_CARD, 2), {
          side: 'self',
          area: 'BASE',
          faceDown: true,
        }),
      ),
    ),
    trigger('activate', 'FIELD'),
    { oncePerTurn: true },
  );
}
