/**
 * BP01-002, a red Lv3 character with a COUNTER-ACTI effect.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【HAND】:You discard this card in HAND. If you do, 1 of your opponent's
 *   characters in BATTLE gets Power-2000 in this turn.
 *
 * The script discards its own card, then, only if that happened, lowers one opposing BATTLE
 * character's Power by 2000 until the end of the turn. The COUNTER·ACTI timing and the HAND
 * location are the envelope that decides when the player may invoke it.
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
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard places card in RETREAT
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
    sequence(
      step(discard(source())),
      ifDone(power(select('opponent', 'BATTLE', characters()), -2000)),
    ),
  );
}
