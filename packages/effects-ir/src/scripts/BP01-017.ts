/**
 * BP01-017, a character that feeds on the opponent's RETREAT.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may prune 1 of your
 *   opponent's characters in RETREAT. If you do, this card gets Power+1000 in this turn.
 *
 * The script lets the player prune one character from the opponent's RETREAT and, only if
 * that happened, raises this card's Power by 1000 until the end of the turn.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  power,
  prune,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-017');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
    optional(
      sequence(
        step(prune(select('opponent', 'RETREAT', characters()))),
        ifDone(power(source(), 1000)),
      ),
    ),
  );
}
