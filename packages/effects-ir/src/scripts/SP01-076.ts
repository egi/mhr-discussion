/**
 * SP01-076, a Lv3 Human that returns from the RETREAT onto the BATTLE by retreating another Human.
 *
 * Printed text (official card):
 *
 *   ACTI【RETREAT】:You retreat 1 of your cards with 【Human】 in their features on BATTLE. If you
 *   do, you place this card from RETREAT onto your BATTLE.
 *   TRIG【BATTLE】:When this card is attacked, your opponent's attacking character gets the
 *   ability 【ASSAULT】 this turn.
 *
 * Event tag: activate, RETREAT. A script carries one clause, so this is the first printed clause
 * (ACTI, 201.10.f.2): an own Human character on the BATTLE is retreated (the cost), and only if
 * that was done is this card placed from the RETREAT onto the BATTLE (placement by effect). With
 * no own Human on the BATTLE nothing is done and the card stays in the RETREAT; a non-Human is not
 * a legal choice. If the BATTLE cannot take the card the effect does as much as it can
 * (304.1.d; discussion 24). The second clause (TRIG【BATTLE】, the attacker gets ASSAULT, rule
 * 305.4.a) is not modelled and stays on the manual path, so the card badges partial. With no
 * target the activation is still usable by the cost (discussion 25, HEAD-JUDGE, provisional:
 * applied by principle, the discussion names other cards).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, ifDone, relocate, retreat, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-076');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect
    { key: asRuleKey('302.2.a'), reviewedHash: '34c5cf52cc7d' }, // BATTLE area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '24', rule: asRuleKey('304.1.d') },
    { discussion: '25', rule: asRuleKey('201.10.f.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'BATTLE', characters({ feature: 'Human' })))),
      ifDone(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
    ),
    trigger('activate', 'RETREAT'),
  );
}
