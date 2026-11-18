/**
 * TB01-001, a character that prunes a low-Lv opposing card when it is called.
 *
 * Printed text (official card):
 *
 *   UNIQUE, COUNTER, AUTO keywords (registered, not IR clauses).
 *   TRIG【FIELD】:When this card enters the field by calling, you may prune 1 of your opponent's
 *   cards with Lv2 or below in the field.
 *
 * The tag is `enters-field-by-call`, so an entry by an effect does not fire it. The prune is
 * optional (304.1.a) and its target is any opposing card in the field with Lv2 or below, not only
 * a character, so `characterOnly` is false.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, optional, prune, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('TB01-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(prune(select('opponent', 'FIELD', { ...ANY_CARD, characterOnly: false, lvMax: 2 }))),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
