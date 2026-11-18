/**
 * SP01-007, an attachment that boosts 1 own character as a counter and then retreats itself.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:The character this card is attached to gets the ability 【ASSAULT】. If that
 *   character has 【Web】 in its feature, that character gets R+1 extra.
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】:1 of your characters on the field gets Power+2000 this
 *   turn. If you do, you retreat this card.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Event tag: activate-counter, FIELD, once per turn (201.10.f.3; ONCE PER TURN is an additional
 * Condition). 1 own character on the field gets Power+2000 this turn (301.40.a); only if a
 * character was boosted is this card retreated (301.16.a). With no own character on the field
 * nothing is boosted and the card stays. "If you do" is Reading B (user decision 2026-11-03,
 * discussion 10 item 3).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, ifDone, power, retreat, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(step(power(select('self', 'FIELD', characters()), 2000)), ifDone(retreat(source()))),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
