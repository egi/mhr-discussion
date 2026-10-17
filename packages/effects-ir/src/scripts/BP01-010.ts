/**
 * BP01-010, a card that attaches itself to a Machine character and returns a set Lv1 Machine.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You attach this card from HAND to 1 of your characters with Lv4 or above and
 *   【Machine】 in their features in the field.
 *   ACTI【BACK/ONCE PER TURN】:You show 1 of your set cards in BASE. If you do and that set
 *   card is with Lv1 and 【Machine】 in its feature, you move that set card back to your HAND.
 *
 * The script is the first clause only: this card is attached from the HAND to one of the
 * player's field characters of Lv4 or above with Machine in its features. The second clause is
 * not modelled, so the card badges partial at best and its BACK clause is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, select, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-010');

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
    attach(source(), select('self', 'FIELD', characters({ lvMin: 4, feature: 'Machine' }))),
    trigger('activate', 'HAND'),
  );
}
