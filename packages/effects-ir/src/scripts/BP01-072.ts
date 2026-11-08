/**
 * BP01-072 「Force Field」Invisible Woman, a Lv4 character that trades itself from the HAND for a
 * recovery and a Range cut when an own Weakness is attacked.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your weakness is attacked, you may prune this card in HAND. If you do, you
 *   move 1 of your characters without 【Invisible Woman】 in their names from RETREAT back to the
 *   bottom of your deck and 1 of your opponent's characters in BATTLE gets R-2 in this turn.
 *
 * The trigger tag is `own-weakness-attacked` from the HAND: it fires when an opposing attack is
 * declared on the controller's empty BATTLE lane (a Weakness, 301.20.a). A declared attack is
 * enough (discussion 22, HEAD-JUDGE). A HAND trigger needs no declaration and a card drawn at the
 * same timing still triggers (304.1.g.2, 304.1.k; discussion 18, HEAD-JUDGE, RESOLVED by rulebook
 * 304.1.k). The prune is optional (304.1.a) and places this card into the VOID (301.17.a). Only
 * if it was done do the two results run; they are joined by "and", so each runs on its own
 * (304.1.d): one own RETREAT character whose name lacks Invisible Woman goes to the bottom of the
 * deck (the other copy of this card cannot be picked), and one opposing BATTLE character gets R-2
 * for the turn. With no such RETREAT character the prune stays and the R cut still applies, and
 * the other way round.
 *
 * "If you do" is Reading B (the gated step runs only if the first step was done in full) and is a
 * USER DECISION, tier USER-DECISION, not a head-judge ruling on the phrase. It has been the
 * engine default since 2026-11-03 (memory mhr-effects-do-as-much-as-you-can, update 2026-11-03)
 * and was closed on 2026-11-04 in discussion 10 item 3. It rests on an inferred equivalence of
 * "If you do" with [After doing so]: CR 301.38.a says text after [After doing so] resolves only if
 * all text before it was resolved in full, and it speaks of [After doing so], not of "If you do".
 * Reading B OVERRIDES the head-judge "do as much as you can" principle (mhrdecklab FAQ F-29,
 * discussion 24, HEAD-JUDGE) for "If you do" clauses only. The caveat is recorded in discussion 24
 * (Constraints section: the "If you do" interaction is discussion 10 item 3, a user decision with
 * rulebook 301.38.a pointing the other way from the "as much as you can" principle) and in
 * discussion 10 item 3 (the head judge never ruled the multi-part-first-step case; Reading A stays
 * selectable through ifYouDoReading 'A'). Here the first step is a single card, so both readings
 * agree. This script does not declare discussion 10.
 *
 * Discussion 23 (win-a-battle triggers) was read for the weakness case and does not govern this
 * clause: being attacked at the Weakness is not winning a fight.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  prune,
  relocate,
  select,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-072');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.g.2'), reviewedHash: '107585942132' }, // HAND triggers need no declaration
    { key: asRuleKey('304.1.k'), reviewedHash: '1c37c93f925c' }, // a card now in HAND still triggers
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('301.20.a'), reviewedHash: '2254445a2da9' }, // an empty BATTLE area is a Weakness
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('303.2.a.4.3'), reviewedHash: '7c6ee101bd64' }, // the battle process starts at the declaration
    { key: asRuleKey('302.11.b'), reviewedHash: 'e021deff8956' }, // deck order changes only as instructed
  ],
  rulings: [
    { discussion: '18', rule: asRuleKey('304.1.k') },
    { discussion: '22', rule: asRuleKey('303.2.a.4.3') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(prune(source())),
        ifDone(
          sequence(
            step(
              relocate(select('self', 'RETREAT', characters({ nameExcludes: 'Invisible Woman' })), {
                side: 'self',
                area: 'DECK-BOTTOM',
                faceDown: true,
              }),
            ),
            step(statMod(select('opponent', 'BATTLE', characters()), 'r', -2)),
          ),
        ),
      ),
    ),
    trigger('own-weakness-attacked', 'HAND'),
  );
}
