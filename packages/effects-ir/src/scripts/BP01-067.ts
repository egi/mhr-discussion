/**
 * BP01-067 (Hostile Focus), a Lv3 blue Human that turns an opposing attack aside.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your opponent's character attacks, you may change its target
 *   to the other one it may attack, which is chosen by you.
 *
 * The script is the effect after the trigger: the controller may change the Attack Target of the
 * attack in progress to another character, or a Weakness, that the attacker may legally attack
 * (303.2.a.4.3.1.1; the `retarget-candidate` selector builds that pool from the attack in
 * progress, the attacker's own legality test included). The trigger is `opponent-character-attacks`
 * from the FIELD and once per turn. The text says "may", so the root is optional (304.1.a). The
 * use is spent only when the retarget really changed the target; a declined "may" and an empty
 * pool spend nothing (discussion 55, CP-3 A, USER-DECISION 2026-11-20, unruled). With exactly one
 * other legal target it is applied without a second prompt; with none the trigger does nothing.
 *
 * PROVISIONAL. Item 1 (a retarget does not fire "attacks" again) is HEAD-JUDGE via FAQ F-18. Items
 * 2 and 3 are defaults on ESCALATE-OPEN discussion 13: OPEN-RULING 13.2 (there is no window before
 * the target is chosen, so the "may" is asked as soon as the attack is declared) and OPEN-RULING
 * 13.3 (the Counter Step after the retarget opens as for a fresh declaration, opponent first).
 * The unresolved queued attacks fires of the declaration follow the new target (CP-1 B, discussion
 * 55, USER-DECISION, unruled).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, optional, retargetAttack, retargetCandidate, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-067');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('303.2.a.4.3.1.1'), reviewedHash: '83ebfc5199ca' }, // a Character attacks a Character or a Weakness within R
  ],
  rulings: [
    // 13: ESCALATE-OPEN. OPEN-RULING 13.2 (no window before the target is chosen) and OPEN-RULING
    // 13.3 (a fresh Counter Step after the retarget) are defaults; item 1 (no re-fire) is
    // HEAD-JUDGE via FAQ F-18.
    { discussion: '13', rule: asRuleKey('303.2.a.4.3.1.1') },
    // 55: USER-DECISION 2026-11-20. Queued attacks fires follow the new target (CP-1 B) and a
    // declined "may" or an empty pool spends no use (CP-3 A); both unruled.
    { discussion: '55', rule: asRuleKey('303.2.a.4.3.1.1') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(retargetAttack(retargetCandidate())),
    trigger('opponent-character-attacks', 'FIELD'),
    { oncePerTurn: true },
  );
}
