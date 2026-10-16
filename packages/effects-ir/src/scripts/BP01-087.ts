/**
 * BP01-087, a counter that turns a discarded Avenger into Power loss for an opponent.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【BATTLE/ONCE PER TURN】:You discard 1 of your characters with 【Avengers】 in
 *   their features in HAND. If you do, 1 of your opponent's characters in BATTLE gets
 *   Power-1000 in this turn.
 *
 * The script discards one Avengers character from the HAND and, only if that happened,
 * lowers an opposing BATTLE character's Power by 1000 until the end of the turn. The "once
 * per turn" limit is a use limit, not an effect, and is not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  discard,
  effect,
  ifDone,
  power,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-087');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
      step(discard(select('self', 'HAND', characters({ feature: 'Avengers' })))),
      ifDone(power(select('opponent', 'BATTLE', characters()), -1000)),
    ),
  );
}
