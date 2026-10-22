/**
 * BP01-005, a red character with a TRIG【HAND】 effect.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your red character attacks, you may discard this card in HAND. If you
 *   do, 1 of your red characters in BATTLE gets Power+3000 in this turn.
 *
 * The script is the effect after the trigger: an optional discard of this card, then, only if
 * the discard happened, Power+3000 for one red character in BATTLE until the end of the turn.
 * "When your red character attacks" is carried by the trigger tag (an `attacks` event fired
 * from HAND, filtered to a red attacker of the same player), and it is not an op.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  colored,
  discard,
  effect,
  ifDone,
  optional,
  power,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
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
    optional(
      sequence(
        step(discard(source())),
        ifDone(power(select('self', 'BATTLE', colored('red')), 3000)),
      ),
    ),
    trigger('attacks', 'HAND', { controller: 'self', color: 'red' }),
  );
}
