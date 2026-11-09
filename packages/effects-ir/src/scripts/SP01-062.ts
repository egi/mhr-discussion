/**
 * SP01-062, a UNIQUE card that prunes a Human from the HAND to draw and place a vanilla character.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   ACTI【BASE/ONCE PER TURN】:You prune 1 of your characters with 【Human】 in their features in
 *   HAND. If you do, you draw 1 card and you may place 1 of your characters with LvX and no
 *   effects from HAND onto your BATTLE. X is the Lv value of the character pruned by this effect.
 *
 * The Human is pruned from the HAND first. Only if that was done do the two results run; they are
 * independent parts of one "If you do" (Reading B nested shape, `always` inner steps), so an empty
 * deck does not stop the placement (304.1.d, discussions 09 and 10; discussion 10 is ESCALATE-OPEN,
 * the nesting is the engine's default reading, tier: user decision below a head-judge ruling). The
 * character to place is optional and offered only when it has no effects (`noEffects`, a printed
 * text fact) and its Lv equals the Lv of the pruned card (`lvBy` exact `pruned-lv-total`). With no
 * such character in HAND the outcome stays ok after the prune and the draw. The lane comes from the
 * invocation's placement choice. Whether X reads the pruned card's Lv at the time of the prune or
 * its printed Lv is an open point (community discussion 34, ESCALATE-OPEN): the engine reads the
 * Lv it had when pruned and that is the current engine reading, not a settled one. The script
 * carries no trigger tag because it places a card onto the BATTLE (a relocate to BATTLE is run only
 * from a named activation). ONCE PER TURN is the `oncePerTurn` marker on the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  draw,
  effect,
  ifDone,
  optional,
  prune,
  relocate,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-062');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw from DECK top
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(prune(select('self', 'HAND', characters({ feature: 'Human' })))),
      ifDone(
        sequence(
          step(draw('self', 1)),
          step(
            optional(
              relocate(
                select(
                  'self',
                  'HAND',
                  characters({ noEffects: true, lvBy: { mode: 'exact', source: 'pruned-lv-total' } }),
                ),
                { side: 'self', area: 'BATTLE', faceDown: false },
              ),
            ),
          ),
        ),
      ),
    ),
    undefined,
    { oncePerTurn: true },
  );
}
