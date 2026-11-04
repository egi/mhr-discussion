/**
 * PB01-002, a character that retreats a target that was already attacked this turn.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card attacks, if its target was attacked before in this turn, you
 *   retreat that target.
 *
 * The script is the effect after the trigger: if the attack target (the pinned subject) was
 * attacked earlier this turn, it is retreated. "When this card attacks" is the trigger tag (an
 * `attacks` event fired from BATTLE with no attacker filter). The `target-attacked-before`
 * condition reads the answer the engine fixed when the attack was declared (the declaration's
 * own record does not count), so a Weakness attack (no target) does nothing.
 *
 * Rulings behind it, none declared below because the public board does not hold them (the
 * declaration lists public discussion ids only):
 * - Discussion 22 (HEAD-JUDGE): a character that declared an attack has attacked, even if the
 *   attack failed, so a declared-but-failed earlier attack counts as "attacked before".
 * - Discussion 44 (USER-DECISION of 2026-11-03, not a head-judge ruling or consensus, provisional
 *   until the head judge answers): a blocker that becomes the Attack Target through BLOCK counts
 *   as attacked. Any verdict citing it must say so.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { conditional, effect, retreat, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.4.3.1.1'), reviewedHash: '83ebfc5199ca' }, // a character attacks by choosing a target
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // a Character is retreated by an effect
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional({ kind: 'target-attacked-before' }, retreat(subject())),
    trigger('attacks', 'BATTLE'),
  );
}
