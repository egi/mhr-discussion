/**
 * BP01-009, a red character with a once-per-turn ACTI effect.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:If you have no cards in BASE, you prune 1 of your red
 *   characters with Lv5 or above in RETREAT. If you do, 1 of your opponent's characters in
 *   BATTLE gets Power-1000 in this turn.
 *
 * The script checks that the BASE is empty, prunes one red Lv5+ character from the RETREAT,
 * and, only if that happened, lowers one opposing BATTLE character's Power by 1000 until the
 * end of the turn. The once-per-turn limit belongs to the envelope.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  colored,
  conditional,
  effect,
  ifDone,
  power,
  prune,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('304.2.c'), reviewedHash: 'af8ff211a42d' }, // activation needs resolvable content
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
    conditional(
      { kind: 'have', side: 'self', area: 'BASE', filter: ANY_CARD, min: 0, max: 0 },
      sequence(
        step(prune(select('self', 'RETREAT', colored('red', { lvMin: 5 })))),
        ifDone(power(select('opponent', 'BATTLE', characters()), -1000)),
      ),
    ),
  );
}
