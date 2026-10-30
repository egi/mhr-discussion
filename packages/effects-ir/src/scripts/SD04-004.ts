/**
 * SD04-004, a character with BLOCK that steps in front of an attack aimed at another target.
 *
 * Printed text (official card):
 *
 *   BLOCK（COUNTER·ACTI【BATTLE/ONCE PER TURN】: If your opponent's character may attack this
 *   card, the target attacked by that character changes to this card.）
 *
 * The script is the COUNTER-Activated Effect of the BLOCK ability (305.2.a): the attack in
 * progress is aimed at this card instead. It is tagged `activate-counter` from the BATTLE and
 * marked once per turn, so the engine offers it in the Counter Step. "May attack this card" is
 * the condition under which BLOCK may be activated at all; it is not an op, the engine offers the
 * activation only when this card can be chosen as the attack target.
 *
 * Whether the retarget fires "attacks" again and whether it opens a fresh Counter Step rest on
 * the still-open discussion 13 (items 1 to 3); the engine's provisional reading is that it does
 * neither.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, retargetAttack, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-004');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('305.2.a'), reviewedHash: 'b350a4f6db4e' }, // BLOCK
    { key: asRuleKey('303.2.a.4.3.2.2'), reviewedHash: '16c82563f537' }, // invalid target returns to selection
  ],
  rulings: [
    // 13: ESCALATE-OPEN. A retarget's effect on "attacks" triggers and on the Counter Step is
    // provisional (discussion 13, items 1 to 3).
    { discussion: '13', rule: asRuleKey('303.2.a.4.3.2.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, retargetAttack(source()), trigger('activate-counter', 'BATTLE'), { oncePerTurn: true });
}
