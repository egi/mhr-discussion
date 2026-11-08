/**
 * BP01-102 「Quantum Collapse」Ant-Man, a Lv6 Human that prunes itself out of the RETREAT and takes
 * a weak opposing character out of the BASE with it.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT from the field, you prune this card in RETREAT.
 *   If you do, you prune 1 of your opponent's characters with Lv3 or below in BASE.
 *
 * The trigger is mandatory (304.1.b). The script prunes this card from the RETREAT into the VOID
 * (301.17.a). Only if that was done does one opposing character with Lv3 or below in the BASE get
 * pruned; with no such character the prune of this card stays and the effect resolves.
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
  characters,
  effect,
  ifDone,
  prune,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-102');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(prune(source())),
      ifDone(prune(select('opponent', 'BASE', characters({ lvMax: 3 })))),
    ),
    trigger('enters-retreat-from-field', 'RETREAT'),
  );
}
