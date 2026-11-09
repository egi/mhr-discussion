/**
 * BP01-105, a character that grows stronger when any of your characters attacks a strong target.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your character attacks, if its target is the character with
 *   Power 5000 or higher, that your character gets Power+1000 in this turn.
 *
 * The script is the effect after the trigger: if the attack target (the pinned subject) is a
 * character whose Power is 5000 or higher, the attacking character ("that your character", the
 * attacker, not the carrier of this script) gets Power+1000 until the end of the turn. "When
 * your character attacks" is carried by the trigger tag (an `attacks` event fired from the
 * FIELD, for an attacker of the same player), and the target test is the `attack-target-matches`
 * condition, so a Weakness attack (no target) does nothing. ONCE PER TURN is the `oncePerTurn`
 * marker on the IR, enforced by the engine.
 *
 * Rulings behind it, none declared below because the public board does not hold them (the
 * declaration lists public discussion ids only):
 * - Discussion 06 (HEAD-JUDGE, via the mhrdecklab FAQ F-18): a retarget does not fire "attacks"
 *   again, so the effect is read once per declaration.
 * - Which Power counts for "Power 5000 or higher" (the effective Power now, or the printed
 *   one) is UNRULED, registered as the engine reading `effective-power-lv-basis` (effective).
 *   The target filter's `powerMin` currently compares the printed Power, so the script rests
 *   on a reading that is neither ruled nor fully implemented; it must not be shown as settled.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attackerFilter, attackingCharacter, characters, conditional, effect, power, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-105');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.4.3.1.1'), reviewedHash: '83ebfc5199ca' }, // a character attacks by choosing a target
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'attack-target-matches', filter: characters({ powerMin: 5000 }), powerAboveSource: false },
      power(attackingCharacter(), 1000),
    ),
    trigger('attacks', 'FIELD', attackerFilter()),
    { oncePerTurn: true },
  );
}
