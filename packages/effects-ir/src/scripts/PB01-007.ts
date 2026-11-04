/**
 * PB01-007, a character that weakens a stronger target as it attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】：When this card attacks, if its target is the character with higher Power than
 *   this card, that character gets Power-2000 in this turn.
 *
 * The script is the effect after the trigger: if the attack target (the pinned subject) has
 * strictly higher Power than this card, the target gets Power-2000 until the end of the turn.
 * "When this card attacks" is carried by the trigger tag (an `attacks` event fired from BATTLE
 * with no attacker filter, so only this card's own attack fires it), and the comparison is the
 * `attack-target-matches` condition with `powerAboveSource`; equal Power does not count and a
 * Weakness attack (no target) does nothing.
 *
 * Which Power is compared (effective now, or printed) is UNRULED. The engine reads the effective
 * Power of both cards, registered as the engine reading `effective-power-lv-basis`; the script
 * rests on it and must not be shown as settled. Discussion 06 (HEAD-JUDGE, via the mhrdecklab FAQ
 * F-18; its example is a "-2000 when it attacks" character) says a retarget does not fire the
 * trigger again.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, power, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.4.3.1.1'), reviewedHash: '83ebfc5199ca' }, // a character attacks by choosing a target
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'attack-target-matches', filter: characters(), powerAboveSource: true },
      power(subject(), -2000),
    ),
    trigger('attacks', 'BATTLE'),
  );
}
