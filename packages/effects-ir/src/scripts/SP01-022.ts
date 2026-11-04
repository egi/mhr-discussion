/**
 * SP01-022, a Human Web character that swaps itself in from the HAND after a Web character wins.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When you attach this card to a character on the field, that character gets the
 *   ability 【Double Attack】 this turn.
 *   TRIG【HAND】:When your character with 【Web】 in its feature wins the fight by attacking, you
 *   may swap this card in HAND and that character. If you do, this card gets the ability
 *   【Double Attack】this turn.
 *
 * The script is the second TRIG. It starts from the HAND when one of the controller's Web
 * characters wins a fight as the attacker (`wins-fight-by-attacking`, narrowed to the Web feature);
 * the winner is the pinned subject. The swap is optional (304.1.a); a HAND card swapped with a
 * field card is placed and the field card moves (301.18.f), and the swap is refused while an effect
 * keeps the winner from moving (301.18.h). Only if the swap was done does this card, now standing
 * where the winner stood, get DOUBLE ATTACK for the turn (an "If you do" step, so a declined swap
 * grants nothing).
 *
 * The first TRIG (`this-card-attached`, the host gets DOUBLE ATTACK) is a separate effect and is not
 * part of this script. A defender that wins does not start this trigger (wins by attacking only).
 *
 * Provisional readings, none of them settled:
 * - DOUBLE ATTACK is read literally (305.3.a: a second attack opportunity); discussion 13 items
 *   2-3 (ESCALATE-OPEN) leave its interplay with a retargeted or re-fired attack open.
 * - Whether a swap also counts as an attach is open (discussion 11 item 1, ESCALATE-OPEN); this
 *   swap fires no attach trigger.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  effect,
  grantAbility,
  ifDone,
  optional,
  sequence,
  source,
  step,
  subject,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-022');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.18.f'), reviewedHash: '1dfd38a20178' }, // swap with a HAND card
    { key: asRuleKey('301.18.c'), reviewedHash: 'ecf7cbe1e937' }, // swapped cards exchange attached cards
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
    { key: asRuleKey('303.2.a.4.3.2.2'), reviewedHash: '16c82563f537' }, // invalid target returns to selection
    { key: asRuleKey('305.3.a'), reviewedHash: '50e7a5497ebc' }, // DOUBLE ATTACK
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '04', rule: asRuleKey('301.18.h') },
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
    // 11: ESCALATE-OPEN. Whether a swap counts as an attach is not settled.
    { discussion: '11', rule: asRuleKey('301.18.c') },
    // 13: ESCALATE-OPEN. DOUBLE ATTACK read literally; re-fire and retarget are not settled.
    { discussion: '13', rule: asRuleKey('303.2.a.4.3.2.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(step(swap(source(), subject())), ifDone(grantAbility(source(), 'DOUBLE ATTACK'))),
    ),
    trigger('wins-fight-by-attacking', 'HAND', undefined, { feature: 'Web' }),
  );
}
