/**
 * BP01-080, a Lv3 character in the HAND that prunes itself to retreat a Lv3 attacker.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your opponent's character with Lv3 attacks, if the total value of Lv of your
 *   characters in BATTLE is lower than your opponent's, you may prune this card in HAND. If you do,
 *   you retreat that character.
 *
 * The trigger tag is `opponent-character-attacks` from the HAND, narrowed to an attacker of Lv3
 * (the `level` subject filter; for this event the filter tests the ATTACKER, not the defender
 * that the fire pins as the trigger subject). A HAND trigger needs no declaration (304.1.g.2). The
 * condition is `total-lv-lower-than-opponent`: the Lv total of the own BATTLE characters is
 * strictly lower than the opponent's; equal totals fail it. The prune of this card is the optional
 * cost (304.1.a, 301.17.a); only if it was done ("If you do", Reading B, discussion 10 item 3, rule
 * 301.38.a) is the attacker retreated (301.16.a.3). The retreat target is `attackingCharacter()`,
 * never the defender.
 *
 * Printed-Lv caveat: the trigger filter reads the attacker's PRINTED Lv, not its effective Lv, so a
 * character whose Lv was raised or lowered by an effect is judged by its printed Lv here. This
 * script does not declare discussion 10.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attackingCharacter,
  conditional,
  effect,
  ifDone,
  optional,
  prune,
  retreat,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-080');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.g.2'), reviewedHash: '107585942132' }, // HAND triggers need no declaration
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'total-lv-lower-than-opponent' },
      optional(sequence(step(prune(source())), ifDone(retreat(attackingCharacter())))),
    ),
    trigger('opponent-character-attacks', 'HAND', undefined, { level: 3 }),
  );
}
