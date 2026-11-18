/**
 * SP01-077, a counter that discards itself to clean up the own Web characters.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】：The character this card is attached to can only attack your opponent's FRONT or
 *   the character on FRONT.
 *   COUNTER·ACTI【HAND】：You discard this card in HAND. If you do, you prune all your characters
 *   with 【Web】 in their features in RETREAT or you place all your characters with 【Web】 in
 *   their features from VOID into your RETREAT.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Event tag: activate-counter, HAND (201.10.f.3). This card is discarded (301.15.a.2, the cost
 * step). Only if that was done does the printed "or" run, read as an exclusive `chooseOne` (the
 * player picks exactly one branch): (a) prune all own Web characters in the RETREAT (301.17.a), or
 * (b) place all own Web characters from the VOID into the own RETREAT. An empty target set for the
 * chosen branch does nothing. Both branches are mandatory in their extent ("all"). SP01-077 is
 * itself a Web character and the discard has already put it in the RETREAT, so branch (a) prunes it
 * as well.
 *
 * READING, tier USER DECISION 2026-11-18 ("Exclusive chooseOne for both"): the Comprehensive Rules
 * v1.03 do not define "or" and there is no community or judge ruling on this card. Inclusive
 * (and/or) and opponent-chooses readings were rejected by the user. No discussion links the card,
 * so there is no open-ruling marker; the tests are named `PROVISIONAL (planner reading, no
 * ruling)`. Recorded in 17.5.2-BASELINE.md (`Checkpoint plan 02`).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  chooseOne,
  discard,
  effect,
  ifDone,
  prune,
  relocate,
  selectAll,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-077');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND by effect
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  const web = characters({ feature: 'Web' });
  return effect(
    CARD_NO,
    sequence(
      step(discard(source())),
      ifDone(
        chooseOne(
          prune(selectAll('self', 'RETREAT', web)),
          relocate(selectAll('self', 'VOID', web), { side: 'self', area: 'RETREAT', faceDown: false }),
        ),
      ),
    ),
    trigger('activate-counter', 'HAND'),
  );
}
