/**
 * SP01-048, a blue Lv3 UNIQUE counter that retreats a Human character to draw.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   COUNTER·ACTI【BASE/ONCE PER TURN】:You retreat 1 of your characters with 【Human】 in their
 *   features on the field. If you do, you draw 1 card.
 *
 * UNIQUE is an ability keyword, not an effect, so the script is the COUNTER·ACTI line only. It
 * retreats one Human character from the player's field and, only if that happened, draws one
 * card. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  draw,
  effect,
  ifDone,
  retreat,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-048');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // counter activated effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat a character
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
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
      step(retreat(select('self', 'FIELD', characters({ feature: 'Human' })))),
      ifDone(draw('self', 1)),
    ),
  );
}
