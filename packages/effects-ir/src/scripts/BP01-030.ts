/**
 * BP01-030, a Machine card that attaches itself to a red Lv1 character.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You attach this card from HAND to 1 of your red characters with Lv1 in the
 *   field.
 *   AUTO【FIELD】:The Lv of the character attached by this card changes to 6.
 *
 * The script is the first clause only: this card is attached from the HAND to one of the
 * player's red characters of Lv1 in the field. The AUTO clause is a continuous change modelled
 * in the AUTO registry, not here.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, colored, effect, select, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-030');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    attach(source(), select('self', 'FIELD', colored('red', { lvMin: 1, lvMax: 1 }))),
    trigger('activate', 'HAND'),
  );
}
