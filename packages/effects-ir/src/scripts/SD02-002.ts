/**
 * SD02-002, a character that places a Machine character face down into the BASE when it loses a
 * fight in BATTLE.
 *
 * Printed text (official card):
 *
 *   UNIQUE(AUTO【FIELD】:You cannot have another card with the same name as this card on the
 *   field. This effect cannot be lost.)
 *   AUTO【BATTLE】:This card gets R+X. X is the number of your set cards in BASE.
 *   TRIG【BATTLE】:When your character with 【Machine】 in its feature enters RETREAT from BATTLE
 *   by losing the fight, you place that character face down into your BASE.
 *
 * A script carries one effect, so this one is the TRIG. The two AUTO clauses are modelled in the
 * engine's AUTO registry, not here.
 *
 * Event tag: own-character-enters-retreat-by-losing-fight narrowed to the Machine feature, BATTLE
 * (201.10.d.2). The event only fires for a character that leaves a BATTLE lane, so a character
 * retreated from the BASE does not count. The trigger is mandatory: that character is moved from
 * the RETREAT and placed face down into the BASE (301.21.a). If the BASE is full the move does not
 * happen and the character stays in the RETREAT (304.1.d, discussion 24).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, relocate, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // placed face-down in the BASE by an effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '24', rule: asRuleKey('304.1.d') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(subject(), { side: 'self', area: 'BASE', faceDown: true }),
    trigger('own-character-enters-retreat-by-losing-fight', 'BATTLE', undefined, { feature: 'Machine' }),
  );
}
